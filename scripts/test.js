const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.html'), 'utf8');

if (!html.includes('GitHub') || !html.includes('Jenkins') || !html.includes('Kubernetes')) {
  console.error('Homepage must describe the CI/CD flow.');
  process.exit(1);
}

console.log('Test passed: homepage contains CI/CD flow keywords.');
