// ========== LEADS TABLE ==========
let leadsFilter = { status: [], loanType: [], source: [], agent: [], aging: [], search: '', sort: 'created_at', dir: 'desc' };


function getFilteredLeads() {
  return leads;
}


function renderLeads() {
  const vl = getFilteredLeads();
  const allVisible = getVisibleLeads();
  const now = Date.now();
  const allSelected = vl.length > 0 && vl.every(l => selectedLeadIds.includes(l.id || l._id));
  
  const uniqueAgingDays = [...new Set(allVisible.map(l => {
    if (!l.assigned_at) return null;
    const start = new Date(l.assigned_at).getTime();
    if (isNaN(start)) return null;
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  }).filter(d => d !== null))].sort((a, b) => a - b);
  
  const canManage = APP.currentRole !== 'agent';
  const agents = APP.currentRole === 'admin' ? USERS.filter(u => u.role === 'agent' && u.active) : APP.currentRole === 'tl' ? USERS.filter(u => u.role === 'agent' && u.active && u.team_id === getUser(APP.currentUserId)?.team_id) : [];

  return `
    <div class="fade-in">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="font-display font-bold text-2xl text-white">Leads</h2>
          <p id="leadsCount" class="text-surface-400 text-sm mt-1">${APP.totalLeads || vl.length} leads found ${selectedLeadIds.length > 0 ? `· <span class="text-brand-400 font-semibold">${selectedLeadIds.length} selected</span>` : ''}</p>
        </div>
        <div class="flex gap-2">
          ${selectedLeadIds.length > 0 ? `
            <div class="flex items-center gap-2 bg-brand-900/20 border border-brand-800/30 p-1 rounded-lg px-2 mr-2">
              <span class="text-xs text-brand-300 font-medium mr-1">Bulk Actions:</span>
              <button class="btn btn-secondary btn-sm" onclick="exportLeadsCSV(true)"><i class="fas fa-download"></i> Export</button>
              ${canManage ? `
                <button class="btn btn-secondary btn-sm" onclick="showBulkReassignModal()"><i class="fas fa-exchange-alt"></i> Assign</button>
                <button class="btn btn-danger btn-sm" onclick="bulkDeleteLeads()"><i class="fas fa-trash"></i> Delete</button>
              ` : ''}
              <button class="btn-ghost btn-sm text-surface-400" onclick="selectedLeadIds=[];renderPage()">Cancel</button>
            </div>
          ` : ''}
          <button class="btn btn-secondary btn-sm" onclick="exportLeadsCSV()"><i class="fas fa-download"></i> Export CSV</button>
           <button class="btn btn-secondary btn-sm" onclick="downloadCSVTemplate()"><i class="fas fa-file-download"></i> Download Template</button>
           ${canManage ? `<button class="btn btn-secondary btn-sm" onclick="openModal('importModal')"><i class="fas fa-file-import"></i> Import CSV</button>` : ''}
          <button class="btn btn-primary btn-sm" onclick="showAddLeadModal()"><i class="fas fa-plus"></i> Add Lead</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="flex flex-wrap gap-3">
          <input type="text" class="form-input py-2 text-sm w-64" placeholder="Search name or phone..." value="${leadsFilter.search}" oninput="handleLeadsSearch(this.value)">
          
          ${renderMultiSelect('status', 'Status', [...new Set(leads.map(l => l.status || 'new'))].map(s => ({ value: s, label: STATUS_LABELS[s] || s })))}
          ${renderMultiSelect('loanType', 'Loan Type', [...new Set(leads.map(l => l.loan_type || 'personal'))].map(s => ({ value: s, label: LOAN_LABELS[s] || s })))}
          ${renderMultiSelect('source', 'Source', [...new Set(leads.map(l => l.source || 'website'))].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })))}
          
          ${canManage ? renderMultiSelect('agent', 'Agent', agents.map(a => ({ value: a.id, label: a.name }))) : ''}
          
          

          <button class="btn btn-ghost btn-sm" onclick="leadsFilter={status:[],loanType:[],source:[],agent:[],aging:[],search:'',sort:'created_at',dir:'desc',page:1,limit:50};refreshLeadsData()"><i class="fas fa-times"></i> Clear</button>
        </div>
      </div>

      <!-- Table -->
      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead id="leadsTableHead">
              <tr>
                <th class="w-10">
                  <input type="checkbox" class="w-4 h-4 rounded border-surface-700 bg-surface-800 text-brand-500 focus:ring-brand-500/20" 
                    ${allSelected ? 'checked' : ''} onchange="toggleAllLeads(this.checked)">
                </th>
                <th class="cursor-pointer" onclick="toggleSort('name')">Name ${sortIcon('name')}</th>
                <th>Phone</th>
                <th>Email</th>
                <th class="cursor-pointer" onclick="toggleSort('loan_type')">Loan Type ${sortIcon('loan_type')}</th>
                <th class="cursor-pointer" onclick="toggleSort('amount_requested')">Amount ${sortIcon('amount_requested')}</th>
                <th class="cursor-pointer" onclick="toggleSort('status')">Status ${sortIcon('status')}</th>
                <th class="cursor-pointer" onclick="toggleSort('source')">Source ${sortIcon('source')}</th>
                ${canManage ? '<th>Agent</th>' : ''}
                <th>Aging</th>
                <th class="cursor-pointer" onclick="toggleSort('assigned_at')">Assigned Date ${sortIcon('assigned_at')}</th>
                <th class="cursor-pointer" onclick="toggleSort('created_at')">Created ${sortIcon('created_at')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="leadsTableBody">
              ${vl.length === 0 ? `<tr><td colspan="${canManage?12:11}" class="text-center py-12 text-surface-500">No leads found</td></tr>` :
              vl.map(l => renderLeadRow(l, canManage)).join('')}
            </tbody>
          
          </table>
        </div>
        
        <div class="flex items-center justify-between p-4 border-t border-surface-800 bg-surface-900/30 rounded-b-xl">
          <div class="text-sm text-surface-400">
            Showing <span class="font-medium text-white">${vl.length > 0 ? ((leadsFilter.page || 1) - 1) * (leadsFilter.limit || 50) + 1 : 0}</span> 
            to <span class="font-medium text-white">${Math.min(((leadsFilter.page || 1) - 1) * (leadsFilter.limit || 50) + (leadsFilter.limit || 50), APP.totalLeads || vl.length)}</span> 
            of <span class="font-medium text-white">${APP.totalLeads || vl.length}</span> results
          </div>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" onclick="changePage(-1)" ${(leadsFilter.page || 1) === 1 ? 'disabled' : ''}>
              <i class="fas fa-chevron-left"></i> Previous
            </button>
            <span class="flex items-center px-3 text-sm text-surface-300">
              Page ${leadsFilter.page || 1} of ${APP.totalPages || 1}
            </span>
            <button class="btn btn-secondary btn-sm" onclick="changePage(1)" ${(leadsFilter.page || 1) >= (APP.totalPages || 1) ? 'disabled' : ''}>
              Next <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

    </div>
  `;
}

function renderLeadRow(l, canManage) {
  const isSelected = selectedLeadIds.includes(l.id || l._id);
  return `<tr class="${isSelected ? 'bg-brand-500/5' : ''}">
    <td>
      <input type="checkbox" class="w-4 h-4 rounded border-surface-700 bg-surface-800 text-brand-500 focus:ring-brand-500/20" 
        ${isSelected ? 'checked' : ''} onchange="toggleLeadSelection('${l.id || l._id}', this.checked)">
    </td>
    <td>
      <div class="flex items-center gap-2">
        ${getPriorityDot(l.priority)}
        <div>
          <p class="font-medium text-white">${l.name}</p>
          <p class="text-xs text-surface-500">${l.city}</p>
        </div>
      </div>
    </td>
    <td class="font-mono text-sm">${l.phone}</td>
    <td class="text-sm text-surface-400 max-w-[150px] truncate" title="${l.email || ''}">${l.email || '—'}</td>
    <td><span class="text-sm">${LOAN_LABELS[l.loan_type] || l.loan_type}</span></td>
    <td class="font-medium text-white">${formatCurrency(l.amount_requested)}</td>
    <td><span class="${getStatusBadgeClass(l.status || 'new')}">${STATUS_LABELS[l.status] || l.status || '—'}</span></td>
    <td class="text-sm text-surface-400">${l.source || '—'}</td>
    ${canManage ? `<td class="text-sm text-surface-400">${getUser(l.assigned_agent_id)?.name || 'Unassigned'}</td>` : ''}
    <td class="text-sm">
      <span class="text-surface-400">${getAging(l.assigned_at)}</span>
    </td>
    <td class="text-sm text-surface-400">${formatDate(l.assigned_at)}</td>
    <td class="text-sm text-surface-400">${formatDate(l.created_at)}</td>
    <td>
      <div class="flex gap-1">
        <button class="btn-ghost rounded text-xs text-blue-600" onclick="showLeadDetail('${l.id}')" title="View"><i class="fas fa-eye"></i></button>
        ${APP.currentRole !== 'agent' ? `<button class="btn-ghost rounded text-xs text-red-600" onclick="showEditLeadModal('${l.id}')" title="Edit"><i class="fas fa-edit"></i></button>` : ''}
        <button class="btn-ghost rounded text-xs text-brand-400" onclick="showCallLogModal('${l.id}')" title="Log Call"><i class="fas fa-phone-alt"></i></button>
        ${canManage ? `<button class="btn-ghost rounded text-xs text-amber-400" onclick="showReassignModal('${l.id}')" title="Reassign"><i class="fas fa-exchange-alt"></i></button>` : ''}
      </div>
    </td>
  </tr>`;
}


let searchTimeout;
function handleLeadsSearch(val) {
  leadsFilter.search = val;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    leadsFilter.page = 1;
    refreshLeadsData();
  }, 300);
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

function renderMultiSelect(key, label, options) {
  const selected = leadsFilter[key];
  const labelText = selected.length === 0 ? `All ${label}s` : selected.length === 1 ? options.find(o => o.value === selected[0])?.label : `${selected.length} ${label}s`;
  
  return `
    <div class="relative group">
      <button class="form-input py-2 text-sm w-auto flex items-center justify-between gap-2 min-w-[140px] text-left">
        <span class="truncate">${labelText}</span>
        <i class="fas fa-chevron-down text-[10px] opacity-50"></i>
      </button>
      <div class="absolute left-0 top-full mt-1 w-56 bg-surface-800 border border-surface-700 rounded-lg shadow-xl z-50 hidden group-hover:block max-h-64 overflow-y-auto p-1">
        <div class="p-2 border-b border-surface-700 flex justify-between items-center">
          <span class="text-xs font-bold text-surface-500 uppercase tracking-wider">${label}</span>
          ${selected.length > 0 ? `<button class="text-[10px] text-brand-400 hover:underline" onclick="leadsFilter['${key}']=[];leadsFilter.page=1;refreshLeadsData()">Clear</button>` : ''}
        </div>
        <div class="py-1">
          ${options.map(o => `
            <label class="flex items-center px-3 py-2 hover:bg-surface-700 rounded cursor-pointer transition-colors">
              <input type="checkbox" class="rounded border-surface-600 text-brand-600 focus:ring-brand-500/20 bg-surface-900" 
                ${selected.includes(o.value) ? 'checked' : ''} 
                onchange="toggleFilterValue('${key}', '${o.value}')">
              <span class="ml-2 text-sm text-surface-200">${o.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function toggleFilterValue(key, value) {
  const idx = leadsFilter[key].indexOf(value);
  if (idx === -1) {
    leadsFilter[key].push(value);
  } else {
    leadsFilter[key].splice(idx, 1);
  }
  leadsFilter.page = 1;
  refreshLeadsData();
}
function sortIcon(field) {
  if (leadsFilter.sort !== field) return '<i class="fas fa-sort text-surface-600 ml-1 text-[10px]"></i>';
  return leadsFilter.dir === 'asc' ? '<i class="fas fa-sort-up text-brand-400 ml-1 text-[10px]"></i>' : '<i class="fas fa-sort-down text-brand-400 ml-1 text-[10px]"></i>';
}


function toggleSort(field) {
  if (leadsFilter.sort === field) {
    leadsFilter.dir = leadsFilter.dir === 'asc' ? 'desc' : 'asc';
  } else {
    leadsFilter.sort = field;
    leadsFilter.dir = 'asc';
  }
  leadsFilter.page = 1;
  refreshLeadsData();
}


