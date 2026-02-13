const identifyLogType = (text) => {
    const lowText = text.toLowerCase();
    if (lowText.includes("staff name") || lowText.includes("id number") || lowText.includes("corporate email")) {
        return "staffAccess";
    }
    if (lowText.includes("client reference") || lowText.includes("client name") || lowText.includes("name of mfo")) {
        return "camsAdjustment";
    }
    if (lowText.includes("adjustment point") || lowText.includes("time of request") || lowText.includes("requested by")) {
        return "camsReopen";
    }
    if (lowText.includes("concern") || lowText.includes("designation")) {
        return "dailyCAMSConcerns";
    }
    return null;
};

const extractFields = (text) => {
    const fields = {};
    const lines = text.split('\n');
    let currentKey = null;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
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

    Object.keys(fields).forEach(key => {
        if (typeof fields[key] === 'string') {
            fields[key] = fields[key].trim();
        }
    });

    return fields;
};

const splitLogData = (text) => {
    const hardSplitRegex = /(?=--\|\||Good\s+(?:morning|day|afternoon|evening))/i;
    const initialSegments = text.split(hardSplitRegex).filter(s => s && s.trim().length > 10);
    const finalSegments = [];

    initialSegments.forEach(segment => {
        const lines = segment.split('\n');
        const keyCounts = {};
        const keyLines = [];
        lines.forEach((line, idx) => {
            const match = line.match(/^\s*([^:]+):\s*(.*)$/);
            if (match) {
                const cleanKey = match[1].trim().toLowerCase().replace(/^\s*\d+[\s\.)-]+\s*/, '').replace(/\s+/g, '_');
                keyCounts[cleanKey] = (keyCounts[cleanKey] || 0) + 1;
                keyLines.push({ line, idx, cleanKey });
            }
        });

        const repeatingKeys = new Set(Object.keys(keyCounts).filter(k => keyCounts[k] > 1));
        let firstRepeatIdx = lines.length;
        let lastRepeatIdx = -1;
        keyLines.forEach(kl => {
            if (repeatingKeys.has(kl.cleanKey)) {
                if (kl.idx < firstRepeatIdx) firstRepeatIdx = kl.idx;
                if (kl.idx > lastRepeatIdx) lastRepeatIdx = kl.idx;
            }
        });

        const sessionHeaders = lines.slice(0, firstRepeatIdx).filter(line => line.trim().length > 0);
        const sessionFooters = lines.slice(lastRepeatIdx + 1).filter(line => {
            const match = line.match(/^\s*([^:]+):\s*(.*)$/);
            return match;
        });

        const remarksLine = lines.find(l => l.trim().toLowerCase().startsWith('remarks:'));
        if (remarksLine && !sessionFooters.includes(remarksLine)) {
            const remarksIdx = lines.indexOf(remarksLine);
            if (remarksIdx > lastRepeatIdx) sessionFooters.push(remarksLine);
        }

        let currentRecordLines = [...sessionHeaders];
        let seenKeysInCurrent = new Set();
        lines.slice(firstRepeatIdx, lastRepeatIdx + 1).forEach(line => {
            const match = line.match(/^\s*([^:]+):\s*(.*)$/);
            if (match) {
                const cleanKey = match[1].trim().toLowerCase().replace(/^\s*\d+[\s\.)-]+\s*/, '').replace(/\s+/g, '_');
                if (repeatingKeys.has(cleanKey) && seenKeysInCurrent.has(cleanKey)) {
                    finalSegments.push([...currentRecordLines, ...sessionFooters].join('\n'));
                    currentRecordLines = [...sessionHeaders];
                    seenKeysInCurrent = new Set();
                }
                seenKeysInCurrent.add(cleanKey);
            }
            currentRecordLines.push(line);
        });

        if (currentRecordLines.length > sessionHeaders.length) {
            finalSegments.push([...currentRecordLines, ...sessionFooters].join('\n'));
        } else if (sessionHeaders.length > 0 && finalSegments.length === 0) {
            finalSegments.push([...sessionHeaders, ...sessionFooters].join('\n'));
        }
    });
    return finalSegments.filter(s => s.trim().length > 0);
};

const userText = `**Bad Debt, Unclaimed and Balik Client Transfer Text Update**

Good Morning Sir/Ma'am;
    
Date of Request: February 10, 2026

Op'n-Div-Reg-Area: DDO2-Div15-Reg30 
Branch Code: B0772
Branch Name:
New Bataan

Concern Category: Assigning Bad Debt
Concerning Staff: Levy Perez(BH) 
    
Client Reference: B0772-0016339
Client Name: Hany Mae Gabato
Name of MFO:Ailyn Montecillo
MFO: 3
Group: Peace
    
Remarks: No Assign Group Name
    

Thank You.

Good morning Sir/Ma'am;
    
Date of Request: February 10, 2026

Op'n-Div-Reg-Area: M2-Div15-Reg95-Davao City VII
Branch Code: B0190
Branch Name: Davao City V Tibungco

Concern Category: Balik Client Transfer
Concerning Staff: Edbhing Abamonga (BM)
    
Client Reference: B0262-0034736
Client Name: ROSE MARIE PALOMAR
Name of MFO: IAN PAUL BANDIALA 
MFO: MFO 1
Group: MAGNOLIA
    
Remarks: Closed Account from Previous branch B0262 Cagayan De Oro III(BOGO) dated 11/3/24 with loan amount of 8000
    
Thanks.
Good Afternoon Sir/Ma'am;
    
Date of Request: February 10, 2026

Op'n-Div-Reg-Area: M2-Div15-Reg95-Davao Del Norte II
Branch Code: B0423
Branch Name:
Samal city I (Babak)

Concern Category: Assigning Branch Staff
Concern Details: assigned as BM
Concerning Staff: Dores Jane Lagare
Designation: BM

Staff Name: Dores Jane Lagare 
ID Number: 17171
Corporate Email: dores.lagare@asaphil.org
Birthdate: 04/05/1997
Contact Number: 09355174948
Assigned As: BM

Remarks: Staff already resumed 

Thanks.
Good evening Sir/Ma'am;
    
Date of Request: February 10, 2026

Op'n-Div-Reg-Area: L2-Div15-Reg95-DAVAO DEL NORTE II
Branch Code: B1185
Branch Name: STO.TOMAS II

Concern Category: Assigning Bad Debt
Concerning Staff: Ricky Pesudas (BM)
    
Client Reference: B1185-0012799
Client Name: Lisa Colas
Name of MFO: Glend Philip Roluma
MFO: MFO 3
Group: Dahlia 
Sl#: 21
    
Remarks: Assigning Bad debt to entry Collection
    
Thank You.,
Good morning Sir/Ma'am

Date of Request: February 10, 2026

Op'n-Div-Reg-Area:
M2-Div15-Reg20-Davao IV
Branch Code: B1008 
Branch Name: Davao City IX(Mintal) 

Concern Category: Assigning Branch Staff
Concern Details: EMFOR Access 
Concerning Staff: Kygin S. Aigen 

Staff Name:  Kygin Segarino Aigen 
ID Number: 08000
kygin.aigen@asaphil.org 
Birthdate: 01/30/1995
Contact Number: 09951545642
Assigned As: Assign to MFO2


Remarks: MFO is on leave 


Thank you`;

const segments = splitLogData(userText);
console.log(\`Found \${segments.length} segments\`);

segments.forEach((seg, i) => {
    const type = identifyLogType(seg);
    console.log(\`Segment \${i+1} [Type: \${type}]:\`);
    // console.log(seg.substring(0, 50).replace(/\\n/g, ' ') + '...');
    const fields = extractFields(seg);
    console.log(\`  Keys: \${Object.keys(fields).join(', ')}\`);
});
