import fs from 'fs';

let content = fs.readFileSync('js/dashboard.js', 'utf8');

const regex = /function renderDashboard\(\) \{[\s\S]*?(?=\/\/ Pipeline chart)/;

const replacement = `function renderDashboard() {
  const stats = APP.dashboardStats || {};
  const totalLeads = stats.totalLeads || 0;
  const contacted = stats.contacted || 0;
  const converted = stats.converted || 0;
  const hotLeads = stats.hotLeads || 0;
  const totalAmount = stats.totalAmount || 0;
  const convRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : 0;
  
  // Dashboard agent leaderboard can use local data for now, or we skip it / simplify it
  let leaderboardHTML = '';
  // Pipeline chart
`;

content = content.replace(regex, replacement);
fs.writeFileSync('js/dashboard.js', content);
