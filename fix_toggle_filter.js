import fs from 'fs';
let content = fs.readFileSync('js/leads.js', 'utf8');

// replace renderPage() in Clear button
content = content.replace(/leadsFilter\['\$\{key\}'\]=\[\];renderPage\(\)/g, "leadsFilter['${key}']=[];leadsFilter.page=1;refreshLeadsData()");

// let's see where toggleFilterValue is defined
