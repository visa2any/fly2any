const fs = require('fs');
const files = require('child_process').execSync('dir /s /b .next\\static\\chunks\\_app-pages-browser_components_flights_EnhancedSearchBar_tsx.js').toString().trim().split('\r\n');
if(!files[0]) process.exit(1);
const chunk = fs.readFileSync(files[0], 'utf8');
const searchString = '"(app-pages-browser)/./components/flights/EnhancedSearchBar.tsx":';
const start = chunk.indexOf(searchString);
if (start > -1) {
    const end = chunk.indexOf('/***/ }),', start);
    let mod = chunk.substring(start, end);
    const startEval = mod.indexOf('eval(');
    if(startEval > -1) {
        // Find the first `"`, then find the last `"` before `)`
        const startStr = mod.indexOf('"', startEval);
        const endStr = mod.lastIndexOf('"', mod.length - 1);
        if(startStr > -1 && endStr > startStr) {
            let code = mod.substring(startStr + 1, endStr);
            // Decode \\n and \\" correctly
            code = code.split('\\n').join('\n').split('\\"').join('"').split('\\\\').join('\\');
            const lines = code.split('\n');
            console.log('--- LINES 15 to 25 ---');
            for(let i=14; i<25; i++) {
                if(lines[i]) console.log((i+1) + ': ' + lines[i].substring(0, 150));
            }
        }
    }
}
