import fs from 'fs';
let content = fs.readFileSync('js/leads.js', 'utf8');

const regex = /function toggleSort\(field\) \{[\s\S]*?renderPage\(\);\n\}/;
const newSort = `
function toggleSort(field) {
  if (leadsFilter.sort === field) {
    leadsFilter.dir = leadsFilter.dir === 'asc' ? 'desc' : 'asc';
  } else {
    leadsFilter.sort = field;
    leadsFilter.dir = 'asc';
  }
  leadsFilter.page = 1;
  refreshLeadsData();
}
`;
content = content.replace(regex, newSort);
fs.writeFileSync('js/leads.js', content);
