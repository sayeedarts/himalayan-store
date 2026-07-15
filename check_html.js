const fs = require('fs');

const filePath = process.argv[2];
if (!filePath) {
    console.error("Usage: node check_html.js <file>");
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

// Simple regex for div. fails on comments/strings but usually liquid files are clean-ish.
// We'll try to be robust enough.

let divOpen = 0;
let divClose = 0;

// Remove liquid tags first to avoid confusion? {{ ... }} ok, {% ... %} ok. 
// But what if {% if %} contains <div>? 
// We just want to count raw <div> in the file.

// Naive counting
const matchesOpen = content.match(/<div\b/gi);
const matchesClose = content.match(/<\/div>/gi);

divOpen = matchesOpen ? matchesOpen.length : 0;
divClose = matchesClose ? matchesClose.length : 0;

console.log(`File: ${filePath}`);
console.log(`Open divs: ${divOpen}`);
console.log(`Close divs: ${divClose}`);

if (divOpen !== divClose) {
    console.log("ERROR: Unbalanced DIVs!");
} else {
    console.log("DIVs seem balanced.");
}
