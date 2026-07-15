// ========== LEADS TABLE ==========
let leadsFilter = { status: [], loanType: [], source: [], agent: [], aging: [], search: '', sort: 'created_at', dir: 'desc' };

function getFilteredLeads() {
  let vl = getVisibleLeads();

  // Global Search
  if (APP.searchQuery) {
    vl = vl.filter(l => l.name.toLowerCase().includes(APP.searchQuery) || l.phone.includes(APP.searchQuery) || l.city.toLowerCase().includes(APP.searchQuery) || l.email.toLowerCase().includes(APP.searchQuery));
  }

  // Local Search
  if (leadsFilter.search) {
    const q = leadsFilter.search.toLowerCase();
    vl = vl.filter(l => l.name.toLowerCase().includes(q) || l.phone.includes(q));
  }

  // Filters
  if (leadsFilter.status.length > 0) vl = vl.filter(l => leadsFilter.status.includes(l.status));
  if (leadsFilter.loanType.length > 0) vl = vl.filter(l => leadsFilter.loanType.includes(l.loan_type));
  if (leadsFilter.source.length > 0) vl = vl.filter(l => leadsFilter.source.includes(l.source));
  if (leadsFilter.agent.length > 0 && (APP.currentRole === 'admin' || APP.currentRole === 'tl')) vl = vl.filter(l => leadsFilter.agent.includes(l.assigned_agent_id));
  
  if (leadsFilter.aging.length > 0) {
    const now = Date.now();
    vl = vl.filter(l => {
      if (!l.assigned_at) return false;
      const start = new Date(l.assigned_at).getTime();
      if (isNaN(start)) return false;
      const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      return leadsFilter.aging.includes(String(days));
    });
  }

  // Sort
  vl.sort((a, b) => {
    let va = a[leadsFilter.sort], vb = b[leadsFilter.sort];
    if (leadsFilter.sort === 'amount_requested') return leadsFilter.dir === 'asc' ? va - vb : vb - va;
    va = String(va); vb = String(vb);
    return leadsFilter.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
  });
  return vl;
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
          <p id="leadsCount" class="text-surface-400 text-sm mt-1">${vl.length} leads found ${selectedLeadIds.length > 0 ? `· <span class="text-brand-400 font-semibold">${selectedLeadIds.length} selected</span>` : ''}</p>
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
          
          ${renderMultiSelect('aging', 'Aging', uniqueAgingDays.map(d => ({ value: String(d), label: `${d} Days` })))}

          <button class="btn btn-ghost btn-sm" onclick="leadsFilter={status:[],loanType:[],source:[],agent:[],aging:[],search:'',sort:'created_at',dir:'desc'};renderPage()"><i class="fas fa-times"></i> Clear</button>
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

function handleLeadsSearch(val) {
  leadsFilter.search = val;
  const vl = getFilteredLeads();
  const canManage = APP.currentRole !== 'agent';
  
  const countEl = document.getElementById('leadsCount');
  if (countEl) countEl.textContent = `${vl.length} leads found`;
  
  const tbody = document.getElementById('leadsTableBody');
  if (tbody) {
    tbody.innerHTML = vl.length === 0 ? `<tr><td colspan="${canManage?9:8}" class="text-center py-12 text-surface-500">No leads found</td></tr>` :
    vl.map(l => renderLeadRow(l, canManage)).join('');
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
          ${selected.length > 0 ? `<button class="text-[10px] text-brand-400 hover:underline" onclick="leadsFilter['${key}']=[];renderPage()">Clear</button>` : ''}
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
  renderPage();
}
function sortIcon(field) {
  if (leadsFilter.sort !== field) return '<i class="fas fa-sort text-surface-600 ml-1 text-[10px]"></i>';
  return leadsFilter.dir === 'asc' ? '<i class="fas fa-sort-up text-brand-400 ml-1 text-[10px]"></i>' : '<i class="fas fa-sort-down text-brand-400 ml-1 text-[10px]"></i>';
}

function toggleSort(field) {
  if (leadsFilter.sort === field) leadsFilter.dir = leadsFilter.dir === 'asc' ? 'desc' : 'asc';
  else { leadsFilter.sort = field; leadsFilter.dir = 'asc'; }
  renderPage();
}

