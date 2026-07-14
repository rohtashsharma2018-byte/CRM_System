import fs from 'fs';
let content = fs.readFileSync('js/utils.js', 'utf8');
content = content.replace("fetchAPI('/leads?page=1&limit=50')", "fetchAPI('/leads?page=1&limit=50'), fetchAPI('/dashboard')");
content = content.replace("fetchAPI('/calls').catch(() => [])", "fetchAPI('/calls').catch(() => []), fetchAPI('/dashboard').catch(() => ({}))");
fs.writeFileSync('js/utils.js', content);
