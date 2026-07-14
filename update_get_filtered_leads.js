import fs from 'fs';
let content = fs.readFileSync('js/leads.js', 'utf8');

const regex = /function getFilteredLeads\(\) \{[\s\S]*?return vl;\n\}/;
const newGetFiltered = `
function getFilteredLeads() {
  return leads;
}
`;
content = content.replace(regex, newGetFiltered);
fs.writeFileSync('js/leads.js', content);
