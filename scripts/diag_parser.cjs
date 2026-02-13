const fs = require('fs');

const getCleanKey = (raw) => raw.trim().toLowerCase()
    .replace(/^\s*\d+[\s\.)-]+\s*/, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_');

const splitLogData = (text) => {
    const hardSplitRegex = /(?=--\|\||Good\s+(?:morning|day|afternoon|evening))/i;
    const initialSegments = text.split(hardSplitRegex).filter(s => s && s.trim().length > 5);

    const finalSegments = [];
    initialSegments.forEach(segment => {
        const lines = segment.split('\n');
        const keyCounts = {};
        const keyLines = [];
        lines.forEach((line, idx) => {
            const match = line.match(/^\s*([^:]+):\s*(.*)$/);
            if (match) {
                const cleanKey = getCleanKey(match[1]);
                keyCounts[cleanKey] = (keyCounts[cleanKey] || 0) + 1;
                keyLines.push({ line, idx, cleanKey });
            }
        });

        const repeatingKeys = new Set(Object.keys(keyCounts).filter(k => keyCounts[k] > 1));
        const ANCHOR_KEYS = new Set(['date_of_request', 'date', 'branch_code', 'concern_category', 'staff_name']);

        let firstRepeatIdx = lines.length;
        let lastRepeatIdx = -1;
        keyLines.forEach(kl => {
            if (repeatingKeys.has(kl.cleanKey) || ANCHOR_KEYS.has(kl.cleanKey)) {
                if (kl.idx < firstRepeatIdx) firstRepeatIdx = kl.idx;
                if (kl.idx > lastRepeatIdx) lastRepeatIdx = kl.idx;
            }
        });

        const sessionHeaders = lines.slice(0, firstRepeatIdx).filter(line => line.trim().length > 0);
        const sessionFooters = lines.slice(lastRepeatIdx + 1).filter(line => {
            const match = line.match(/^\s*([^:]+):\s*(.*)$/);
            return match && !repeatingKeys.has(getCleanKey(match[1]));
        });

        let currentRecordLines = [...sessionHeaders];
        let seenKeysInCurrent = new Set();
        lines.slice(firstRepeatIdx, lastRepeatIdx + 1).forEach(line => {
            const match = line.match(/^\s*([^:]+):\s*(.*)$/);
            if (match) {
                const cleanKey = getCleanKey(match[1]);
                const isRepeat = repeatingKeys.has(cleanKey) && seenKeysInCurrent.has(cleanKey);
                const isAnchorStart = ANCHOR_KEYS.has(cleanKey) && seenKeysInCurrent.size > 0 &&
                    (cleanKey === 'date_of_request' || cleanKey === 'date' || cleanKey === 'concern_category');
                if (isRepeat || isAnchorStart) {
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
        } else if (sessionHeaders.length > 0) {
            finalSegments.push([...sessionHeaders, ...sessionFooters].join('\n'));
        }
    });

    return finalSegments.filter(s => {
        const lowerS = s.toLowerCase();
        return lowerS.includes(':') && (lowerS.includes('branch') || lowerS.includes('concern') || lowerS.includes('staff') || lowerS.includes('client'));
    });
};

const userText = fs.readFileSync('d:/cams-support-portal/user_input.txt', 'utf8');
const segments = splitLogData(userText);
console.log('Result count:', segments.length);
segments.forEach((s, i) => console.log(`S${i + 1} starts with: ${s.trim().substring(0, 30)}`));
