import fs from 'fs';
let content = fs.readFileSync('js/leads.js', 'utf8');

content = content.replace(/leadsFilter\['\$\{key\}'\]=\[\];renderPage\(\)/g, "leadsFilter['${key}']=[];leadsFilter.page=1;refreshLeadsData()");

fs.writeFileSync('js/leads.js', content);
