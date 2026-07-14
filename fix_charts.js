import fs from 'fs';
let content = fs.readFileSync('js/dashboard.js', 'utf8');
const regex = /function initDashboardCharts\(\) \{[\s\S]*\}\}/;

const replacement = `function initDashboardCharts() {
  const theme = getChartTheme();
  const stats = APP.dashboardStats || {};
  const pipelineStats = stats.pipeline || [];
  const sourceStats = stats.sourceStats || [];
  
  // Funnel chart
  const funnelData = STATUSES.map(s => {
    const item = pipelineStats.find(p => p._id === s);
    return item ? item.count : 0;
  });
  const funnelLabels = STATUSES.map(s => STATUS_LABELS[s] || (s.charAt(0).toUpperCase() + s.slice(1)));
  const funnelColors = ['#34d399','#38bdf8','#c084fc','#fbbf24','#60a5fa','#6ee7b7','#fb7185','#f43f5e','#a855f7'];
  const ctx1 = document.getElementById('funnelChart');
  if (ctx1) {
    if (APP.charts.funnel) APP.charts.funnel.destroy();
    APP.charts.funnel = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: funnelLabels,
        datasets: [{ data: funnelData, backgroundColor: funnelColors, borderRadius: 6, borderSkipped: false }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: theme.gridColor }, ticks: { color: theme.tickColor } },
          y: { grid: { display: false }, ticks: { color: theme.labelColor, font: { size: 12 } } }
        }
      }
    });
  }

  // Secondary chart - Doughnut for sources
  const ctx2 = document.getElementById('secondaryChart');
  if (ctx2) {
    if (APP.charts.secondary) APP.charts.secondary.destroy();
    const sourceData = SOURCES.map(s => {
      const item = sourceStats.find(p => p._id === s);
      return item ? item.count : 0;
    });
    const sourceColors = ['#10b981','#f59e0b','#0ea5e9','#8b5cf6','#f43f5e','#78716c'];
    APP.charts.secondary = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: SOURCES.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        datasets: [{ data: sourceData, backgroundColor: sourceColors, borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '65%',
        plugins: { legend: { position: 'right', labels: { color: theme.tickColor, font: { size: 11 }, padding: 12, usePointStyle: true, pointStyleWidth: 8 } } }
      }
    });
  }
}`;
content = content.replace(regex, replacement);
fs.writeFileSync('js/dashboard.js', content);
