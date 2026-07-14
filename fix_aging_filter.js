import fs from 'fs';
let content = fs.readFileSync('js/leads.js', 'utf8');

const regex1 = /\$\{renderMultiSelect\('aging', 'Aging', uniqueAgingDays\.map\(d => \(\{ value: String\(d\), label: \`\$\{d\} Days\` \}\)\)\)\}/;
content = content.replace(regex1, '');

const regex2 = /leadsFilter=\{status:\[\],loanType:\[\],source:\[\],agent:\[\],aging:\[\],search:'',sort:'created_at',dir:'desc'\};renderPage\(\)/;
content = content.replace(regex2, 'leadsFilter={status:[],loanType:[],source:[],agent:[],aging:[],search:\'\',sort:\'created_at\',dir:\'desc\',page:1,limit:50};refreshLeadsData()');

fs.writeFileSync('js/leads.js', content);
