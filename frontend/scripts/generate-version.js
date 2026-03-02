const fs = require('fs');
const path = require('path');

const version = Date.now().toString();
const outputPath = path.join(__dirname, '../public/version.json');

fs.writeFileSync(outputPath, JSON.stringify({ version }));
console.log(`Generated version: ${version}`);
