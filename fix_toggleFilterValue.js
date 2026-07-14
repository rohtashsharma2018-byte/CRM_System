import fs from 'fs';
let content = fs.readFileSync('js/leads.js', 'utf8');

const regex = /function toggleFilterValue\(key, value\) \{[\s\S]*?renderPage\(\);\n\}/;
const replacement = `function toggleFilterValue(key, value) {
  const idx = leadsFilter[key].indexOf(value);
  if (idx === -1) {
    leadsFilter[key].push(value);
  } else {
    leadsFilter[key].splice(idx, 1);
  }
  leadsFilter.page = 1;
  refreshLeadsData();
}`;
content = content.replace(regex, replacement);

fs.writeFileSync('js/leads.js', content);
