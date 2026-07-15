const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
    console.error("Usage: node check_braces.js <file>");
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
let openBraces = 0;
let closeBraces = 0;
let inComment = false;
let inString = false;
let stringChar = '';

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const prev = content[i - 1];
    const next = content[i + 1];

    if (inComment) {
        if (char === '*' && next === '/') {
            inComment = false;
            i++;
        }
        continue;
    }

    if (inString) {
        if (char === stringChar && prev !== '\\') {
            inString = false;
        }
        continue;
    }

    if (char === '/' && next === '*') {
        inComment = true;
        i++;
        continue;
    }

    if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
        continue;
    }

    if (char === '{') openBraces++;
    if (char === '}') closeBraces++;
}

console.log(`File: ${filePath}`);
console.log(`Open braces: ${openBraces}`);
console.log(`Close braces: ${closeBraces}`);
if (openBraces !== closeBraces) {
    console.log("ERROR: Unbalanced braces!");
} else {
    console.log("Braces are balanced.");
}
