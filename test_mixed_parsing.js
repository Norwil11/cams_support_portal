
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
    if (lowText.includes("concern") && (lowText.includes("designation") || lowText.includes("designated") || lowText.includes("concerning staff"))) {
        return "dailyCAMSConcerns";
    }

    return null;
};

const extractFields = (text) => {
    const fields = {};
    const lines = text.split('\n');
    let currentKey = null;
    let firstLineHandled = false;

    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        if (trimmed === '**' || trimmed === '***') return;

        if (!firstLineHandled && !trimmed.includes(':')) {
            fields['Subject'] = trimmed.replace(/\*/g, '');
            firstLineHandled = true;
            return;
        }
        firstLineHandled = true;

        const footers = ['thank you', 'thanks', 'best regards', 'regards', 'kind regards'];
        if (footers.includes(trimmed.toLowerCase().replace(/[^\w\s]/g, ''))) {
            currentKey = null;
            return;
        }

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

        if (currentKey) {
            if (!fields[currentKey]) {
                fields[currentKey] = trimmed;
            } else {
                fields[currentKey] += '\n' + trimmed;
            }
        }
    });
    return fields;
};

const splitLogData = (text) => {
    // Robust split:
    // 1. Greetings (Good morning...)
    // 2. Explicit Guard (--||--)
    // 3. Footer (Thanks/Regards) followed by a Start Key (Date, Branch, Subject, or **)
    //    This eats the footer but preserves the Start Key.
    const hardSplitRegex = /(?=--\|\||Good\s+(?:morning|day|afternoon|evening))|(?:Thanks|Thank you|Regards|Best regards)[\.\!;]*\s*(?:[\r\n]+\s*)?(?=Subject:|Date:|Date of Request:|Branch Code:|\*\*)/i;
    const initialSegments = text.split(hardSplitRegex).filter(s => s && s.trim().length > 10);

    const finalSegments = [];
    let pendingHeader = '';

    initialSegments.forEach(seg => {
        if (!seg.includes(':') || (seg.trim().startsWith('**') && seg.trim().endsWith('**'))) {
            pendingHeader += seg + '\n';
        } else {
            finalSegments.push(pendingHeader + seg);
            pendingHeader = '';
        }
    });

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

const input = `Good Day Sir/Ma'am;
    
Date of Request: February 12, 2026

Op'n-Div-Reg-Area: M2-Div15-Reg95-Davao Del Norte IV
Branch Code: B1614
Branch Name: Samal City III 

Concern Category: Assigning Branch Staff
Concern Details: ABH
Concerning Staff: Denny Bansag 

Staff Name: Denny Bansag 
ID Number: 8259
Corporate Email: denny.bansag@asaphil.org
Birthdate: April 25 1992
Contact Number: 
09319080147
Assigned As: Abh

Remarks: None 



Thank you.Good Day Sir/Ma'am;
    
Date of Request: February 12, 2026

Op'n-Div-Reg-Area: M2-Div15-Reg95-Davao Del Norte IV
Branch Code: B1614
Branch Name: Samal City III 

Concern Category: Assigning Branch Staff
Concern Details: BH
Concerning Staff: Marie Joy Ocho 

Staff Name: Marie Joy Ocho 
ID Number: 5012
Corporate Email: marie.ocho@asaphil.org
Birthdate: January 26 1993
Contact Number: 
09226521415
Assigned As: Mfo2

Remarks: Leave of Staff



Thank you.Good evening Sir/Ma'am;
    
Date of Request: February 12, 2026

Op'n-Div-Reg-Area: M2-Div15-Reg30-DDO I
Branch Code: B0848
Branch Name: Montevista

Concern Category: Assigning Branch Staff
Concern Details: MFO
Concerning Staff: Ken P. Alcaide (BM)

Staff Name: Princess Ciarra Abio
ID Number: 21585
Corporate Email: princess.abio@asaphil.org
Birthdate: 12-08-2001
Contact Number: 09452153036
Assigned As: MFO 1


Remarks: The staff is already resume from leave.

Thank you.Good evening Sir/Ma'am;
    
Date of Request: February 12, 2026

Op'n-Div-Reg-Area: M2-Div15-Reg30-DDO I
Branch Code: B0848
Branch Name: Montevista

Concern Category: Assigning Branch Staff
Concern Details: MFO to ABH
Concerning Staff: Ken P. Alcaide (BM)

Staff Name: Flaviano Leparto
ID Number: 12104
Corporate Email: flaviano.leparto@asaphil.org
Birthdate: 08-20-1992
Contact Number: 09122249809
Assigned As: ABH


Remarks: The staff is already resume from leave.

Thank you.Good morning Sir/Ma'am;
    
Date of Request: February 12, 2026

Op'n-Div-Reg-Area: M2-Div15-Reg30-DDN I
Branch Code: B1615
Branch Name: Tagum city IV

Concern Category: Assigning Branch Staff
Concern Details: ABH
Concerning Staff: Honey Rose Caballo

Staff Name: Honey Rose Caballo 
ID Number: 14063
Corporate Email: honey.caballo@asaphil.org
Birthdate: 10/23/1993
Contact Number: 09224289998
Assigned As: MFO4


Remarks: The  staff is on leave.

Thank you.Good Morning Sir/Ma'am;
    
Date of Request: February 12, 2026

Op'n-Div-Reg-Area: L2-Div15-Reg95-Davao Del Norte V
Branch Code: B0710
Branch Name: Asuncion 

Concern Category: Assigning Branch Staff
Concern Details: ABH
Concerning Staff: Arjane Mae Maboloc 

Staff Name: Arjane Mae Maboloc 
ID Number: 13518
Corporate Email: arjanemae.delosreyes@asaphil.org
Birthdate: 04/19/1996
Contact Number: 09700816250
Assigned As: MFO4

Remarks: Mfo is on leave 

Thank you**Daily CAMS Concern/Issue**
    
    
Good evening Sir/Ma'am;

Date: February 11,2026

Branch Code: B1669
Branch Name: Davao City XXII (Cabantian)

Concern: Bank withdrawal and bank deposit not running in front of DCS

Bank withdrawal: 325,000

Bank deposit: 322,304

Concerning Staff: Niecel M. Rabago
Designation: BH
    
Remarks: 

Thanks`;

const segments = splitLogData(input);
console.log(`Matched Segments: ${segments.length}`);

segments.forEach((seg, i) => {
    console.log(`\n--- SEGMENT ${i + 1} ---`);
    const fields = extractFields(seg);
    console.log(`Remarks: [${fields['Remarks']}]`);
    console.log(`Subject: [${fields['Subject']}]`);
    console.log(`Staff Name: [${fields['Staff_Name']}]`);
});
