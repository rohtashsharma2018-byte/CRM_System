import fs from 'fs';

let content = fs.readFileSync('js/utils.js', 'utf8');
content = content.replace("fetchAPI('/leads')", "fetchAPI('/leads?page=1&limit=50')");
content = content.replace("setLeads(leadsData);", "setLeads(leadsData.leads || leadsData); APP.totalLeads = leadsData.total || 0;");
fs.writeFileSync('js/utils.js', content);
