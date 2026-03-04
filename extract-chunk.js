const fs = require('fs');
const files = require('child_process').execSync('dir /s /b .next\\static\\chunks\\_app-pages-browser_components_flights_EnhancedSearchBar_tsx.js').toString().trim().split('\r\n');
const chunk = fs.readFileSync(files[0], 'utf8');
const searchString = '"(app-pages-browser)/./components/flights/EnhancedSearchBar.tsx":';
const start = chunk.indexOf(searchString);
if (start > -1) {
    const end = chunk.indexOf('/***/ }),', start);
    let mod = chunk.substring(start, end);
    fs.writeFileSync('chunk_output.js', mod);
    console.log('Wrote to chunk_output.js');
} else {
    console.log('Mod not found');
}
