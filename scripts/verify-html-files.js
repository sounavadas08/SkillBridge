import fs from 'fs';

const pages = ['index.html', 'login.html', 'onboarding.html', 'portal.html'];
let failed = false;
for (const p of pages) {
  if (!fs.existsSync(p)) {
    console.error(`FAIL: ${p} does not exist`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log('PASS: All 4 HTML files exist');
