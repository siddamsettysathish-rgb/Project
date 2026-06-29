const fs = require('fs');
const path = require('path');

const requiredFiles = ['index.html', 'styles.css', 'app.js'];
const srcDir = path.join(__dirname, '..', 'src');

for (const file of requiredFiles) {
  const fullPath = path.join(srcDir, file);
  if (!fs.existsSync(fullPath)) {
    console.error(`Missing required file: ${file}`);
    process.exit(1);
  }
}

console.log('Lint check passed: required static files are present.');
