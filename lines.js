const fs = require('fs');
const mod = fs.readFileSync('chunk_output.js', 'utf8');
const evalMatch = mod.match(/eval\([\s\S]*?"([\s\S]*?)"\)/);
if(evalMatch) {
    let code = evalMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    const lines = code.split('\n');
    lines.slice(10, 31).forEach((l, i) => console.log((i + 11) + ':', l.substring(0, 150)));
} else {
    console.log('No eval found');
}
