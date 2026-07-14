import fs from 'fs';
let content = fs.readFileSync('js/leads.js', 'utf8');

// Replace handleLeadsSearch to trigger API
const newSearch = `
let searchTimeout;
function handleLeadsSearch(val) {
  leadsFilter.search = val;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    leadsFilter.page = 1;
    refreshLeadsData();
  }, 300);
}

function handleLeadsSort(field) {
  if (leadsFilter.sort === field) {
    leadsFilter.dir = leadsFilter.dir === 'asc' ? 'desc' : 'asc';
  } else {
    leadsFilter.sort = field;
    leadsFilter.dir = 'desc';
  }
  leadsFilter.page = 1;
  refreshLeadsData();
}

function handleLeadsFilter(type, value) {
  const arr = leadsFilter[type];
  const idx = arr.indexOf(value);
  if (idx > -1) arr.splice(idx, 1);
  else arr.push(value);
  leadsFilter.page = 1;
  refreshLeadsData();
}

function changePage(diff) {
  const newPage = (leadsFilter.page || 1) + diff;
  if (newPage > 0 && newPage <= (APP.totalPages || 1)) {
    leadsFilter.page = newPage;
    refreshLeadsData();
  }
}

async function refreshLeadsData() {
  try {
    let queryParams = [];
    if (leadsFilter.search) queryParams.push('search=' + encodeURIComponent(leadsFilter.search));
    if (leadsFilter.status && leadsFilter.status.length) queryParams.push('status=' + leadsFilter.status.join(','));
    if (leadsFilter.loanType && leadsFilter.loanType.length) queryParams.push('loanType=' + leadsFilter.loanType.join(','));
    if (leadsFilter.source && leadsFilter.source.length) queryParams.push('source=' + leadsFilter.source.join(','));
    if (leadsFilter.agent && leadsFilter.agent.length) queryParams.push('agent=' + leadsFilter.agent.join(','));
    
    queryParams.push('page=' + (leadsFilter.page || 1));
    queryParams.push('limit=' + (leadsFilter.limit || 50));
    queryParams.push('sort=' + (leadsFilter.sort || 'created_at'));
    queryParams.push('dir=' + (leadsFilter.dir || 'desc'));
    
    const leadsData = await fetchAPI('/leads?' + queryParams.join('&'));
    setLeads(leadsData.leads || leadsData);
    APP.totalLeads = leadsData.total || 0;
    APP.totalPages = leadsData.totalPages || 1;
    leadsFilter.page = leadsData.page || 1;
    
    renderPage();
  } catch (err) {
    console.error(err);
  }
}
`;

content = content.replace(/function handleLeadsSearch\([^)]*\)\s*\{[\s\S]*?\}/, newSearch);
content = content.replace(/function handleLeadsSort\([^)]*\)\s*\{[\s\S]*?\}/, '');
content = content.replace(/function handleLeadsFilter\([^)]*\)\s*\{[\s\S]*?\}/, '');

fs.writeFileSync('js/leads.js', content);
