// ========== STATE ==========
const APP = {
  currentPage: 'dashboard',
  currentRole: 'admin',
  currentUserId: null,
  userName: '',
  token: localStorage.getItem('token'),
  charts: {},
  searchQuery: '',
  teamRoleFilter: 'all',
  teamViewMode: 'list',
  theme: localStorage.getItem('theme') || 'dark',
  activeSettingsTab: 'general'
};

function setTheme(theme) {
  APP.theme = theme;
  localStorage.setItem('theme', theme);
  if (theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
  // Update charts if they exist
  if (APP.currentPage === 'dashboard') initDashboardCharts();
  
  if (APP.currentPage === 'settings') renderPage();
}

function changeSettingsTab(tabId) {
  APP.activeSettingsTab = tabId;
  renderPage();
}

function getChartTheme() {
  const isLight = APP.theme === 'light';
  return {
    gridColor: isLight ? '#e7e5e4' : '#292524',
    tickColor: isLight ? '#78716c' : '#a8a29e',
    labelColor: isLight ? '#1c1917' : '#e7e5e4',
    mutedTickColor: isLight ? '#a8a29e' : '#57534e'
  };
}

function initTheme() {
  if (APP.theme === 'light') {
    document.body.classList.add('light-theme');
  }
}

