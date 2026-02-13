import {
    ResponsibleIncharge,
    StaffAccess,
    CamsAdjustment,
    CamsReopenDevsAdjustment,
    DailyCamsConcern,
    BranchDB1,
    AreaDB1,
    RegionDB1,
    OperationDB1,
    Division,
    sequelizeDB1
} from '../src/models/index.js';
import logger from '../utils/logger.js';
import { QueryTypes } from 'sequelize';

const identifyLogType = (text) => {
    const lowText = text.toLowerCase();

    // 1. Staff Access (High Specificity)
    if (lowText.includes("staff name") || lowText.includes("id number") || lowText.includes("corporate email") || lowText.includes("assigned as")) {
        return "staffAccess";
    }

    // 2. CAMS Adjustment (High Specificity)
    if (lowText.includes("client reference") || lowText.includes("client name") || lowText.includes("name of mfo") || lowText.includes("balik client transfer")) {
        return "camsAdjustment";
    }

    // 3. CAMS Re-open (Moderate Specificity)
    if (lowText.includes("adjustment point") || lowText.includes("time of request") || lowText.includes("requested by") || lowText.includes("reason for reopening")) {
        return "camsReopen";
    }

    // 4. Daily CAMS Concerns (Lower Specificity - Catch-all for concerns)
    // Require at least 'Concern' AND either 'Designation' or 'Designated' to avoid matching headers/noise
    if (lowText.includes("concern") && (lowText.includes("designation") || lowText.includes("designated") || lowText.includes("concerning staff"))) {
        return "dailyCAMSConcerns";
    }

    return null;
};

const REQUIRED_KEYS = {
    staffAccess: ["Date_of_Request", "Branch_Code", "Concern_Category", "Concern_Details", "Concerning_Staff", "Staff_Name", "ID_Number", "Corporate_Email", "Remarks"],
    camsAdjustment: ["Date_of_Request", "Branch_Code", "Concern_Category", "Concerning_Staff", "Client_Reference", "Client_Name", "Name_of_MFO", "MFO", "Group", "Remarks"],
    camsReopen: ["Date_of_Request", "Branch_Code", "Time_of_Request", "Adjustment_Point", "Requested_By", "Concern_Category", "Reason", "Recommended_By", "Remarks"],
    dailyCAMSConcerns: ["Date", "Branch_Code", "Concern", "Concerning_Staff", "Designation", "Remarks"]
};

/**
 * Extracts fields using regex: /Field Name:\s*(.*)/i
 * Trims values automatically.
 */
const extractFields = (text) => {
    const fields = {};
    const lines = text.split('\n');
    let currentKey = null;
    let firstLineHandled = false;

    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Skip bold titles if they appear as empty markers
        if (trimmed === '**' || trimmed === '***') return;

        // 1. Subject Capture (Encoding Standard)
        // If the first real line has no colon and looks like a title (starts/ends with ** or is short), treat as subject
        if (!firstLineHandled && !trimmed.includes(':')) {
            fields['Subject'] = trimmed.replace(/\*/g, '');
            firstLineHandled = true;
            return;
        }
        firstLineHandled = true;

        // Ignore common footers
        const footers = ['thank you', 'thanks', 'best regards', 'regards', 'kind regards'];
        if (footers.includes(trimmed.toLowerCase().replace(/[^\w\s]/g, ''))) {
            currentKey = null;
            return;
        }

        // Auto-detect email if Corporate_Email is missing
        const emailMatch = trimmed.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i);
        if (emailMatch && !fields['Corporate_Email']) {
            fields['Corporate_Email'] = trimmed;
            return;
        }

        // Try to match a "Key: Value" pattern
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0 && colonIndex < 45) {
            let keyPart = line.substring(0, colonIndex).trim();
            const valuePart = line.substring(colonIndex + 1).trim();

            keyPart = keyPart.replace(/^\s*\d+[\s\.)-]+\s*/, '');
            keyPart = keyPart.replace(/[^\w\s]/g, '').trim();

            if (keyPart.length > 0) {
                currentKey = keyPart.replace(/\s+/g, '_');
                fields[currentKey] = valuePart;
                return;
            }
        }

        // Multiline append
        if (currentKey) {
            if (!fields[currentKey]) {
                fields[currentKey] = trimmed;
            } else {
                fields[currentKey] += '\n' + trimmed;
            }
        } else {
            // If no current key (e.g. preamble after Subject but before first key), append to Subject or start a Preamble
            // This handles cases where "Good evening" appears after a "**Daily CAMS**" header
            if (fields['Subject']) {
                fields['Subject'] += '\n' + trimmed;
            } else {
                fields['Subject'] = trimmed;
            }
        }
    });

    Object.keys(fields).forEach(key => {
        if (typeof fields[key] === 'string') {
            fields[key] = fields[key].trim();
        }
    });

    return fields;
};

const formatDateForMySQL = (dateStr) => {
    if (!dateStr) return null;
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr; // Fallback if parsing fails
        return d.toISOString().split('T')[0];
    } catch {
        return dateStr;
    }
};

const formatTimeForMySQL = (timeStr) => {
    if (!timeStr) return null;
    try {
        // Handle HH:MM AM/PM format (even with single digit minutes like 10:0 AM)
        const ampmMatch = timeStr.match(/^(\d{1,2}):(\d{1,2})\s*(AM|PM)$/i);
        if (ampmMatch) {
            let [_, hours, minutes, ampm] = ampmMatch;
            hours = parseInt(hours);
            minutes = minutes.padStart(2, '0');
            if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
            return `${String(hours).padStart(2, '0')}:${minutes}:00`;
        }

        // Handle HH:MM:SS or HH:MM (24-hour style, allowing single digits)
        const isoMatch = timeStr.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
        if (isoMatch) {
            let [_, hours, minutes, seconds] = isoMatch;
            hours = hours.padStart(2, '0');
            minutes = minutes.padStart(2, '0');
            seconds = (seconds || '00').padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }

        return timeStr;
    } catch {
        return timeStr;
    }
};

const validateBranchCode = (code) => {
    if (!code) return false;
    // Expected format B followed by 4 digits (e.g., B0039)
    return /^B\d{4}$/i.test(code.trim());
};

export const getIncharges = async (req, res, next) => {
    try {
        const incharges = await ResponsibleIncharge.findAll({
            order: [['firstName', 'ASC']]
        });

        // Deduplicate by full name
        const uniqueIncharges = [];
        const seenNames = new Set();

        for (const person of incharges) {
            const fullName = `${person.firstName} ${person.lastName}`.trim().toLowerCase();
            if (!seenNames.has(fullName)) {
                uniqueIncharges.push(person);
                seenNames.add(fullName);
            }
        }

        res.json(uniqueIncharges);
    } catch (error) {
        logger.error(`Error fetching incharges: ${error.message}`);
        next(error);
    }
};

/**
 * Automatically find the JD Incharge based on branch number
 * Path: branches -> areas -> divisions -> operations -> in_charge
 */
export const getJDInchargeForBranch = async (branchNo) => {
    try {
        const query = `
            SELECT jd.firstname, jd.lastname
            FROM branches b
            JOIN areas a ON b.area_id = a.id
            JOIN divisions d ON a.division_id = d.id
            JOIN jd_incharge jd ON d.operation_id = jd.operation_id
            WHERE b.branch_no = :branchNo
            LIMIT 1
        `;

        const [result] = await sequelizeDB1.query(query, {
            replacements: { branchNo },
            type: QueryTypes.SELECT
        });

        if (result) {
            return `${result.firstname} ${result.lastname}`.trim();
        }
        return null;
    } catch (error) {
        logger.error(`Error in getJDInchargeForBranch: ${error.message}`);
        return null;
    }
};

/**
 * Splits a large block of text into individual log segments.
 * Uses greetings and explicit headers as separators.
 * This version restores the "Proper" greeting-centric splitting.
 */
const splitLogData = (text) => {
    // Robust split:
    // 1. Greetings (Good morning...)
    // 2. Explicit Guard (--||--)
    // 3. Footer (Thanks/Regards) followed by a Start Key (Date, Branch, Subject, or **)
    //    This eats the footer but preserves the Start Key.
    const hardSplitRegex = /(?=--\|\||Good\s+(?:morning|day|afternoon|evening))|(?:Thanks|Thank you|Regards|Best regards)[\.\!;]*\s*(?:[\r\n]+\s*)?(?=Subject:|Date:|Date of Request:|Branch Code:|\*\*)/i;

    // Split and filter for minimal length to ignore noise
    const initialSegments = text.split(hardSplitRegex)
        .filter(s => s && s.trim().length > 10);

    const finalSegments = [];
    let pendingHeader = '';

    initialSegments.forEach(seg => {
        // If segment is just a header (like "**Daily CAMS...**") or very short and no colon, treat as header
        if (!seg.includes(':') || (seg.trim().startsWith('**') && seg.trim().endsWith('**'))) {
            pendingHeader += seg + '\n';
        } else {
            // Found a data log, attach any pending header
            finalSegments.push(pendingHeader + seg);
            pendingHeader = '';
        }
    });

    // Final filter: ensure segments look like they contain data
    return finalSegments.filter(s => {
        const lowerS = s.toLowerCase();
        return lowerS.includes(':') && (
            lowerS.includes('branch') ||
            lowerS.includes('concern') ||
            lowerS.includes('staff') ||
            lowerS.includes('client') ||
            lowerS.includes('date')
        );
    });
};

const LOG_TYPE_NAMES = {
    staffAccess: "Staff Access",
    camsAdjustment: "CAMS Adjustment",
    camsReopen: "CAMS Re-open",
    dailyCAMSConcerns: "Daily CAMS Concern"
};

export const submitLog = async (req, res, next) => {
    const { inchargeId, logData } = req.body;

    if (!inchargeId || !logData) {
        return res.status(400).json({ error: 'Incharge and Log Data are required' });
    }

    try {
        const person = await ResponsibleIncharge.findByPk(inchargeId);
        if (!person) {
            return res.status(404).json({ error: 'Selected Incharge not found.' });
        }
        const responsibleInchargeName = `${person.firstName} ${person.lastName}`.trim();

        const segments = splitLogData(logData);
        const results = [];
        const errors = [];

        for (const segment of segments) {
            try {
                const logType = identifyLogType(segment);
                if (!logType) {
                    errors.push({ segment: segment.substring(0, 50).replace(/\n/g, ' ') + '...', message: 'Unable to identify log format.' });
                    continue;
                }

                const data = extractFields(segment);

                // Auto-fill Date for Daily CAMS Concerns if missing
                if (logType === 'dailyCAMSConcerns') {
                    const dateKey = Object.keys(data).find(k => k.toLowerCase() === 'date');
                    if (!dateKey) {
                        const today = new Date().toISOString().split('T')[0];
                        data['Date'] = today;
                    }
                }

                // 1. Validate Required Fields
                const missing = REQUIRED_KEYS[logType].filter(key => {
                    const actualKey = Object.keys(data).find(k => k.toLowerCase() === key.toLowerCase());
                    if (!actualKey) return true; // Key must exist

                    // Special case: Remarks can be empty string if the key exists
                    if (key.toLowerCase() === 'remarks') return false;

                    return !data[actualKey];
                });

                if (missing.length > 0) {
                    errors.push({
                        type: logType,
                        message: `Missing required fields: ${missing.join(', ')}`
                    });
                    continue;
                }

                // 2. Validate and Extract Branch Code
                const branchKey = Object.keys(data).find(k => k.toLowerCase() === 'branch_code');
                let extractedBranchCode = null;
                if (branchKey) {
                    const rawBranchValue = data[branchKey];
                    const branchMatch = rawBranchValue.match(/B\d{4}/i);
                    if (!branchMatch) {
                        errors.push({ type: logType, message: `Invalid Branch Code format: "${rawBranchValue}"` });
                        continue;
                    }
                    extractedBranchCode = branchMatch[0].toUpperCase();
                }

                // 3. Prepare data for model
                const dbData = {
                    incharge_id: inchargeId,
                    responsible_incharge: responsibleInchargeName,
                    time_log: new Date()
                };

                // Automate JD Incharge lookup
                if (extractedBranchCode) {
                    dbData.jd_incharge = await getJDInchargeForBranch(extractedBranchCode);
                }

                // Dynamic Field Mapping based on log type
                let skipSegment = false;
                const looseFields = []; // Fields that don't match columns will be preserved in remarks

                for (const k of Object.keys(data)) {
                    let value = data[k];
                    const rawKey = k.replace(/_/g, ' ');
                    const lowerKey = k.toLowerCase().replace(/\s+/g, '_').replace(/[^\w\s]/g, '');

                    // Normalized keys for mapping
                    const fieldMapping = {
                        'date': logType === 'dailyCAMSConcerns' ? 'date' : 'date_of_request',
                        'date_of_request': 'date_of_request',
                        'branch_code': 'branch_code',
                        'concern': logType === 'dailyCAMSConcerns' ? 'concern_issue' : 'concern_category',
                        'concern_category': logType === 'dailyCAMSConcerns' ? 'concern_issue' : 'concern_category',
                        'concern_details': 'concern_details',
                        'concerning_staff': 'concerning_staff',
                        'staff_name': 'staff_name',
                        'id_number': 'id_number',
                        'corporate_email': 'corporate_email',
                        'email': 'corporate_email',
                        'designation': 'designation',
                        'designate': 'designation',
                        'client_ref': 'client_reference',
                        'client_reference': 'client_reference',
                        'client_name': 'client_name',
                        'name_of_mfo': 'name_of_mfo',
                        'mfo': 'mfo',
                        'group': 'group_name',
                        'group_name': 'group_name',
                        'reason': 'reason_for_reopening',
                        'adjustment_point': 'adjustment_point',
                        'time_of_request': 'time_of_request',
                        'requested_by': 'requested_by',
                        'recommended_by': 'recommended_by',
                        'status': 'status',
                        'remarks': 'remarks',
                        'note': 'remarks',
                        'notes': 'remarks',
                        'comment': 'remarks',
                        'comments': 'remarks',
                        'opndivregarea': 'opndivregarea_temp' // Marker to identify hierarchy line
                    };

                    // Map to target key
                    const targetKey = fieldMapping[lowerKey] || null;

                    if (!targetKey) {
                        // Capture loose encoding data (like Subject) to preserve completeness
                        // BUT: Exclude "Subject" (greetings) and "OpnDivRegArea" (redundant context) from polluting Remarks
                        // ALSO: Exclude specific non-DB fields that user identified as noise
                        if (
                            lowerKey !== 'subject' &&
                            !lowerKey.startsWith('opndiv') &&
                            !lowerKey.includes('regarea') &&
                            !lowerKey.includes('branch_name') &&
                            !lowerKey.includes('birthdate') &&
                            !lowerKey.includes('contact_number') &&
                            !lowerKey.includes('assigned_as')
                        ) {
                            looseFields.push(`${rawKey}: ${value}`);
                        }
                        continue;
                    }

                    // Marker for special hierarchy preserving - DO NOT APPEND
                    if (targetKey === 'opndivregarea_temp') {
                        // Do nothing, just consume it so it doesn't end up in looseFields
                        continue;
                    }

                    // Branch Code extraction & normalization
                    if (targetKey === 'branch_code' && extractedBranchCode) {
                        value = extractedBranchCode;
                    }

                    // Status normalization
                    if (targetKey === 'status') {
                        if (!value || value === '' || value === 'NULL') {
                            dbData['status'] = 'Need to update';
                        } else {
                            dbData['status'] = value;
                        }
                        continue;
                    }

                    // Type-specific field exclusion/mapping
                    if (targetKey === 'reason_for_reopening' && logType !== 'camsReopen') {
                        continue;
                    }

                    dbData[targetKey] = value;

                    // Normalize & Validate Date fields
                    const dateFields = ['date_of_request', 'date', 'adjustment_point'];
                    if (dateFields.includes(targetKey)) {
                        const originalValue = value;
                        const formatted = formatDateForMySQL(value);
                        const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(formatted);

                        if (!isValidDate && (formatted !== null && formatted !== '')) {
                            errors.push({ type: logType, message: `Invalid Date format: "${originalValue}" in ${targetKey}` });
                            skipSegment = true;
                            break;
                        }
                        dbData[targetKey] = formatted;
                    }

                    // Normalize & Validate Time fields
                    if (targetKey === 'time_of_request') {
                        const originalValue = value;
                        const formatted = formatTimeForMySQL(value);
                        const isValidTime = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(formatted);

                        if (!isValidTime) {
                            errors.push({ type: logType, message: `Invalid Time format: "${originalValue}". Please use HH:MM AM/PM.` });
                            skipSegment = true;
                            break;
                        }
                        dbData[targetKey] = formatted;
                    }
                }

                if (skipSegment) continue;

                // 4. Data Preservation (Encoding Integrity)
                // Append Subject and other loose fields to remarks/concern_issue to ensure nothing is lost during "printing"
                if (looseFields.length > 0) {
                    const preservationText = looseFields.join('\n');
                    const targetRemarkField = logType === 'dailyCAMSConcerns' ? 'concern_issue' : 'remarks';

                    if (dbData[targetRemarkField]) {
                        dbData[targetRemarkField] = `${preservationText}\n\n${dbData[targetRemarkField]}`;
                    } else {
                        dbData[targetRemarkField] = preservationText;
                    }
                }

                if (skipSegment) continue;

                let result;
                switch (logType) {
                    case 'staffAccess': result = await StaffAccess.create(dbData); break;
                    case 'camsAdjustment': result = await CamsAdjustment.create(dbData); break;
                    case 'camsReopen': result = await CamsReopenDevsAdjustment.create(dbData); break;
                    case 'dailyCAMSConcerns': result = await DailyCamsConcern.create(dbData); break;
                }

                results.push({
                    type: logType,
                    displayName: LOG_TYPE_NAMES[logType],
                    id: result.id,
                    branch: extractedBranchCode
                });

            } catch (err) {
                logger.error(`Error processing segment: ${err.message}`);
                errors.push({ error: err.message });
            }
        }

        if (results.length === 0) {
            if (errors.length > 0) {
                return res.status(400).json({
                    error: 'Failed to process any log entries.',
                    details: errors
                });
            } else {
                return res.status(400).json({
                    error: 'No valid log entries found. Please ensure your data follows the required format.',
                });
            }
        }

        const typeCounts = results.reduce((acc, r) => {
            acc[r.displayName] = (acc[r.displayName] || 0) + 1;
            return acc;
        }, {});

        const count = results.length;
        const typeSummary = Object.entries(typeCounts)
            .map(([name, num]) => `${name} (${num})`)
            .join(', ');

        let message = `Successfully updated ${count} log${count > 1 ? 's' : ''}: ${typeSummary}`;

        res.status(201).json({
            message,
            results,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        logger.error(`Error in batch submission: ${error.message}`);
        res.status(500).json({
            error: 'Server error occurred during batch submission.',
            details: error.message
        });
    }
};

/**
 * Retrieval Endpoints for Consolidated Logs - Updated with Hierarchy Joins
 */

const HIERARCHY_INCLUDE = {
    model: BranchDB1,
    as: 'hierarchy',
    include: [{
        model: AreaDB1,
        as: 'area',
        include: [
            { model: RegionDB1, as: 'region' },
            {
                model: Division,
                as: 'division',
                include: [{ model: OperationDB1, as: 'operation' }]
            }
        ]
    }]
};

const flattenLogWithHierarchy = (log) => {
    const raw = log.get({ plain: true }); // Better for deep nested objects
    const h = raw.hierarchy || {};
    const a = h.area || {};
    const r = a.region || {};
    const d = a.division || {};
    const o = d.operation || {};

    // Remove technical IDs as requested
    delete raw.incharge_id;
    delete raw.hierarchy;

    return {
        ...raw,
        branch_name: h.branch_name || '---',
        area: a.area_name || '---',
        region: r.region || '---',
        division: d.division || '---',
        operation: o.name || '---'
    };
};

export const getStaffAccessLogs = async (req, res, next) => {
    try {
        const logs = await StaffAccess.findAll({
            include: [HIERARCHY_INCLUDE],
            order: [['created_at', 'DESC']],
            limit: 500
        });
        res.json(logs.map(flattenLogWithHierarchy));
    } catch (error) {
        logger.error(`Error fetching Staff Access logs: ${error.message}`);
        next(error);
    }
};

export const getCamsAdjustmentLogs = async (req, res, next) => {
    try {
        const logs = await CamsAdjustment.findAll({
            include: [HIERARCHY_INCLUDE],
            order: [['created_at', 'DESC']],
            limit: 500
        });
        res.json(logs.map(flattenLogWithHierarchy));
    } catch (error) {
        logger.error(`Error fetching CAMS Adjustment logs: ${error.message}`);
        next(error);
    }
};

export const getCamsReopenLogs = async (req, res, next) => {
    try {
        const logs = await CamsReopenDevsAdjustment.findAll({
            include: [HIERARCHY_INCLUDE],
            order: [['created_at', 'DESC']],
            limit: 500
        });
        res.json(logs.map(flattenLogWithHierarchy));
    } catch (error) {
        logger.error(`Error fetching CAMS Re-open logs: ${error.message}`);
        next(error);
    }
};

export const getDailyCamsLogs = async (req, res, next) => {
    try {
        const logs = await DailyCamsConcern.findAll({
            include: [HIERARCHY_INCLUDE],
            order: [['created_at', 'DESC']],
            limit: 500
        });
        res.json(logs.map(flattenLogWithHierarchy));
    } catch (error) {
        logger.error(`Error fetching Daily CAMS Concerns: ${error.message}`);
        next(error);
    }
};

export const updateLog = async (req, res, next) => {
    const { type, id } = req.params;
    const updateData = req.body;

    try {
        let Model;
        switch (type) {
            case 'staff-access': Model = StaffAccess; break;
            case 'cams-adjustment': Model = CamsAdjustment; break;
            case 'cams-reopen': Model = CamsReopenDevsAdjustment; break;
            case 'daily-concerns': Model = DailyCamsConcern; break;
            default:
                return res.status(400).json({ error: 'Invalid log type' });
        }

        const log = await Model.findByPk(id);
        if (!log) {
            logger.warn(`Update failed: Log entry not found. ID: ${id}, Type: ${type}`);
            return res.status(404).json({ error: 'Log entry not found' });
        }

        logger.info(`Updating ${type} log [${id}] with data: ${JSON.stringify(updateData)}`);

        // Use set + save for more explicit tracking of changes
        log.set(updateData);

        // Final check before save

        // Final check before save
        logger.debug(`Final changed fields: ${JSON.stringify(log.changed())}`);

        await log.save();

        // Final check from DB
        const freshLog = await Model.findByPk(id);
        logger.info(`Log [${id}] after save (fresh from DB): ${JSON.stringify(freshLog.toJSON())}`);

        res.json({ message: 'Log updated successfully', data: freshLog });
    } catch (error) {
        logger.error(`Error updating log: ${error.message}`);
        next(error);
    }
};
