// ========== RENDER PAGE ROUTER ==========
function renderPage() {
  destroyCharts();
  const c = document.getElementById('pageContainer');
  switch (APP.currentPage) {
    case 'dashboard': c.innerHTML = renderDashboard(); initDashboardCharts(); break;
    case 'leads': c.innerHTML = renderLeads(); break;
    case 'pipeline': c.innerHTML = renderPipeline(); break;
    case 'calling': c.innerHTML = renderCallingQueue(); break;
    case 'workHistory': c.innerHTML = renderWorkHistory(); break;
    case 'reports': c.innerHTML = renderReports(); break;
    case 'team': c.innerHTML = renderTeam(); break;
    case 'allocations': c.innerHTML = renderAllocations(); break;
    case 'settings': c.innerHTML = renderSettings(); break;
    default: c.innerHTML = renderDashboard(); initDashboardCharts();
  }
  // Animate in
  c.querySelector('.fade-in')?.classList.add('fade-in');
}

// Initial App load
initApp();

function destroyCharts() {
  Object.values(APP.charts).forEach(c => c.destroy());
  APP.charts = {};
}

// ========== DASHBOARD ==========
