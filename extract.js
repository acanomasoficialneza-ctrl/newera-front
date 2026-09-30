const fs = require('fs');
const tsPath = 'e:/casino/newEra/front/newera-web/src/app/features/admin-global/admin-global.component.ts';
const htmlPath = 'e:/casino/newEra/front/newera-web/src/app/features/admin-global/admin-global.component.html';
let content = fs.readFileSync(tsPath, 'utf8');

const match = content.match(/template:\s*`([\s\S]*?)`/);
if (match) {
  fs.writeFileSync(htmlPath, match[1], 'utf8');
  content = content.replace(/template:\s*`[\s\S]*?`/, "templateUrl: './admin-global.component.html'");
  fs.writeFileSync(tsPath, content, 'utf8');
  console.log('Extracted template successfully');
} else {
  console.log('No template found');
}
