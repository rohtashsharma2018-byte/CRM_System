import fs from 'fs';

let content = fs.readFileSync('js/dashboard.js', 'utf8');

const regex = /function renderDashboard\(\) \{[\s\S]*?(?=return `)/;

const replacement = `function renderDashboard() {
  const stats = APP.dashboardStats || {};
  const totalLeads = stats.totalLeads || 0;
  const contacted = stats.contacted || 0;
  const converted = stats.converted || 0;
  const hotLeads = stats.hotLeads || 0;
  const totalAmount = stats.totalAmount || 0;
  const convRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : 0;
  
  // Followups - simplified to 0 for now since we don't fetch all calls globally
  const todayFollowups = 0;
  
  let leaderboardHTML = '';
  
  const followupHTML = \`<div class="flex items-center gap-3">\` +
      \`<div class="w-10 h-10 rounded-lg flex items-center justify-center bg-brand-500/20 text-brand-400">\` +
        \`<i class="fas fa-calendar-day"></i>\` +
      \`</div>\` +
      \`<div>\` +
        \`<div class="text-xs text-surface-400 font-medium">Scheduled</div>\` +
        \`<div class="text-xl font-bold text-white">\${todayFollowups}</div>\` +
      \`</div>\` +
    \`</div>\`;

  const hotHTML = \`<div class="flex items-center gap-3">\` +
      \`<div class="w-10 h-10 rounded-lg flex items-center justify-center bg-rose-500/20 text-rose-400">\` +
        \`<i class="fas fa-fire"></i>\` +
      \`</div>\` +
      \`<div>\` +
        \`<div class="text-xs text-surface-400 font-medium">Priority</div>\` +
        \`<div class="text-xl font-bold text-white">\${hotLeads}</div>\` +
      \`</div>\` +
    \`</div>\`;

  const activityHTML = \`<div class="flex items-center gap-3">\` +
      \`<div class="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/20 text-blue-400">\` +
        \`<i class="fas fa-bolt"></i>\` +
      \`</div>\` +
      \`<div>\` +
        \`<div class="text-xs text-surface-400 font-medium">Activity</div>\` +
        \`<div class="text-xl font-bold text-white">0</div>\` +
      \`</div>\` +
    \`</div>\`;

`;

content = content.replace(regex, replacement);
fs.writeFileSync('js/dashboard.js', content);
