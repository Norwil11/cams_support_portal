const fs = require('fs');

const userText = fs.readFileSync('d:/cams-support-portal/user_input.txt', 'utf8');
const initialSegments = userText.split(/(?=--\|\||Good\s+(?:morning|day|afternoon|evening))/i).filter(s => s.trim().length > 5);

console.log('SEGMENT 1 RAW LINES:');
const lines = initialSegments[1].split('\n');
lines.forEach((line, idx) => {
    const cleanLine = line.replace(/\r/g, '');
    const hasMatch = !!line.match(/^\s*([^:]+):\s*(.*)$/);
    console.log(`L${idx}: [${hasMatch ? 'MATCH' : 'FAIL '}] "${cleanLine}"`);
    if (!hasMatch && line.includes(':')) {
        console.log(`  Hex: ${Buffer.from(line).toString('hex')}`);
    }
});
