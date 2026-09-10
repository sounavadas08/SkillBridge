import fs from 'fs';

const configContent = fs.readFileSync('vite.config.js', 'utf-8');
if (!configContent.includes('login.html') || !configContent.includes('portal.html')) {
  console.error('FAIL: vite.config.js missing multi-page rollup inputs');
  process.exit(1);
}
console.log('PASS: vite.config.js contains multi-page inputs');
