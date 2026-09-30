const fs = require('fs');
const path = 'e:/casino/newEra/front/newera-web/src/app/features/admin-global/admin-global.component.ts';
let content = fs.readFileSync(path, 'utf8');

const backticks = [...content.matchAll(/`/g)];
console.log('Total backticks:', backticks.length);
for (let b of backticks) {
  // Print line number
  const linesBefore = content.substring(0, b.index).split('\n').length;
  console.log('Backtick at line:', linesBefore);
}
