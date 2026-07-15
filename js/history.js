// ========== WORK HISTORY ==========
let workHistoryFilter = {
  search: '',
  agentId: 'all',
  dateRange: '30',
  startDate: '',
  endDate: '',
  outcome: 'all',
  priority: 'all'
};

let workHistoryColumns = {
  dateTime: { label: 'Date & Time', visible: true },
  agent: { label: 'Agent', visible: true },
  team: { label: 'Team Name', visible: true },
  lead: { label: 'Lead', visible: true },
  phone: { label: 'Phone', visible: true },
  email: { label: 'Email', visible: true },
  loanAmount: { label: 'Loan Amount', visible: true },
  loanType: { label: 'Loan Type', visible: true },
  leadStatus: { label: 'Lead Status', visible: true },
  priority: { label: 'Priority', visible: true },
  aging: { label: 'Aging', visible: true },
  outcome: { label: 'Call Outcome', visible: true },
  notes: { label: 'Notes', visible: true },
  followUp: { label: 'Follow-up Due', visible: true }
};

let showColumnSelector = false;

function toggleWorkHistoryColumn(key) {
  if (workHistoryColumns[key]) {
    workHistoryColumns[key].visible = !workHistoryColumns[key].visible;
    const visibleCount = Object.values(workHistoryColumns).filter(c => c.visible).length;
    if (visibleCount === 0) {
      workHistoryColumns[key].visible = true;
      toast('At least one column must be visible', 'warning');
      return;
    }
    renderPage();
  }
}

function selectAllColumns(val) {
  if (!val) {
    Object.keys(workHistoryColumns).forEach((key, index) => {
      workHistoryColumns[key].visible = (index === 0);
    });
    toast('Cleared all except Date & Time', 'info');
  } else {
    Object.keys(workHistoryColumns).forEach(key => {
      workHistoryColumns[key].visible = true;
    });
  }
  renderPage();
}

function resetWorkHistoryColumns() {
  Object.keys(workHistoryColumns).forEach(key => {
    workHistoryColumns[key].visible = true;
  });
  renderPage();
}

const OUTCOME_LABELS = {
  answered: 'Answered',
  not_answered: 'Not Answered',
  busy: 'Busy',
  wrong_number: 'Wrong Number',
  callback_requested: 'Callback Requested'
};

function getOutcomeBadgeClass(outcome) {
  switch (outcome) {
    case 'answered':
      return 'badge-new';
    case 'not_answered':
      return 'badge-rejected';
    case 'busy':
      return 'badge-documents-pending';
    case 'wrong_number':
      return 'badge-dead';
    case 'callback_requested':
      return 'badge-contacted';
    default:
      return 'badge-new';
  }
}

function getFilteredCalls() {
  let list = [...callLogs];

  if (APP.currentRole === 'tl') {
    const tl = getUser(APP.currentUserId);
    if (tl) {
      const tlTeamId = tl.team_id && typeof tl.team_id === 'object' ? (tl.team_id._id || tl.team_id.id) : tl.team_id;
      list = list.filter(c => {
        const agent = getUser(c.agent_id);
        if (!agent) return false;
        const agentTeamId = agent.team_id && typeof agent.team_id === 'object' ? (agent.team_id._id || agent.team_id.id) : agent.team_id;
        return agentTeamId === tlTeamId || agent.id === tl.id;
      });
    } else {
      list = [];
    }
  } else if (APP.currentRole === 'agent') {
    list = list.filter(c => c.agent_id === APP.currentUserId);
  }

  if (workHistoryFilter.agentId !== 'all') {
    list = list.filter(c => c.agent_id === workHistoryFilter.agentId);
  }

  if (workHistoryFilter.outcome !== 'all') {
    list = list.filter(c => c.outcome === workHistoryFilter.outcome);
  }

  if (workHistoryFilter.priority !== 'all') {
    list = list.filter(c => {
      const lead = leads.find(l => l.id === c.lead_id || l._id === c.lead_id);
      return lead && (lead.priority || 'cold').toLowerCase().trim() === workHistoryFilter.priority;
    });
  }

  const now = new Date();
  if (workHistoryFilter.dateRange === 'all') {
    // No filtering
  } else if (workHistoryFilter.dateRange === 'custom') {
    if (workHistoryFilter.startDate) {
      const start = new Date(workHistoryFilter.startDate);
      start.setHours(0, 0, 0, 0);
      list = list.filter(c => new Date(c.created_at) >= start);
    }
    if (workHistoryFilter.endDate) {
      const end = new Date(workHistoryFilter.endDate);
      end.setHours(23, 59, 59, 999);
      list = list.filter(c => new Date(c.created_at) <= end);
    }
  } else {
    const filterDate = new Date();
    filterDate.setDate(now.getDate() - parseInt(workHistoryFilter.dateRange));
    list = list.filter(c => new Date(c.created_at) >= filterDate);
  }

  if (workHistoryFilter.search) {
    const q = workHistoryFilter.search.toLowerCase().trim();
    list = list.filter(c => {
      const lead = leads.find(l => l.id === c.lead_id || l._id === c.lead_id);
      const agent = getUser(c.agent_id);
      const teamId = agent ? (agent.team_id && typeof agent.team_id === 'object' ? (agent.team_id._id || agent.team_id.id) : agent.team_id) : null;
      const team = getTeam(teamId);
      const loanTypeLabel = lead ? (LOAN_LABELS[lead.loan_type] || lead.loan_type || '') : '';
      return (
        (lead && lead.name.toLowerCase().includes(q)) ||
        (lead && lead.phone.includes(q)) ||
        (lead && lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead && loanTypeLabel.toLowerCase().includes(q)) ||
        (agent && agent.name.toLowerCase().includes(q)) ||
        (team && team.name.toLowerCase().includes(q)) ||
        (c.outcome && c.outcome.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q))
      );
    });
  }

  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return list;
}

function handleWorkHistorySearch(val) {
  workHistoryFilter.search = val;
  const list = getFilteredCalls();
  
  const countEl = document.getElementById('workHistoryCount');
  if (countEl) countEl.textContent = `${list.length} calls recorded`;
  
  const tbody = document.getElementById('workHistoryTableBody');
  if (tbody) {
    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="12" class="text-center py-12 text-surface-500">
            <div class="flex flex-col items-center justify-center">
              <i class="fas fa-phone-slash text-4xl mb-3 text-surface-600"></i>
              <p class="font-medium text-surface-400">No call history found</p>
              <p class="text-xs text-surface-600 mt-1">Try adjusting your filters or search term</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = list.map(c => {
        const lead = leads.find(l => l.id === c.lead_id || l._id === c.lead_id);
        const agent = getUser(c.agent_id);
        
        const leadName = lead ? `<span class="text-white hover:underline cursor-pointer font-medium" onclick="showLeadDetail('${lead.id || lead._id}')">${lead.name}</span>` : '<span class="text-surface-500 italic">Unknown Lead</span>';
        const leadPhone = lead ? lead.phone : '—';
        const leadStatus = lead ? `<span class="badge ${getStatusBadgeClass(lead.status)}">${STATUS_LABELS[lead.status] || lead.status}</span>` : '—';
        const loanType = lead ? (LOAN_LABELS[lead.loan_type] || lead.loan_type || '—') : '—';
        
        const leadPriorityVal = lead ? (lead.priority || 'cold').toLowerCase().trim() : 'cold';
        let priorityBadgeClass = 'badge-contacted'; // cold
        if (leadPriorityVal === 'hot') priorityBadgeClass = 'badge-hot';
        else if (leadPriorityVal === 'warm') priorityBadgeClass = 'badge-documents-pending';
        const leadPriority = lead ? `<span class="badge ${priorityBadgeClass}">${PRIORITY_LABELS[leadPriorityVal] || leadPriorityVal}</span>` : '—';

        const agentName = agent ? agent.name : '<span class="text-surface-500 italic">Unknown Agent</span>';
        const teamId = agent ? (agent.team_id && typeof agent.team_id === 'object' ? (agent.team_id._id || agent.team_id.id) : agent.team_id) : null;
        const team = getTeam(teamId);
        const teamName = team ? team.name : '—';
        
        const formattedTime = new Date(c.created_at).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const outcomeBadge = `<span class="badge ${getOutcomeBadgeClass(c.outcome)}">${OUTCOME_LABELS[c.outcome] || c.outcome}</span>`;
        const followUpBadge = c.follow_up_at ? `<span class="badge badge-documents-pending"><i class="fas fa-calendar-alt mr-1 text-[10px]"></i> ${new Date(c.follow_up_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>` : '—';
        
        return `
          <tr class="hover:bg-surface-800/30">
            <td class="text-surface-400 whitespace-nowrap text-xs">${formattedTime}</td>
            <td class="text-white font-medium whitespace-nowrap">${agentName}</td>
            <td class="text-surface-400 whitespace-nowrap text-sm">${teamName}</td>
            <td class="text-white whitespace-nowrap">${leadName}</td>
            <td class="text-surface-400 whitespace-nowrap text-sm">${leadPhone}</td>
            <td class="font-medium text-white whitespace-nowrap">${lead ? formatCurrency(lead.amount_requested) : '—'}</td>
            <td class="text-surface-400 whitespace-nowrap text-sm capitalize">${loanType}</td>
            <td class="whitespace-nowrap">${leadStatus}</td>
            <td class="whitespace-nowrap">${leadPriority}</td>
            <td class="whitespace-nowrap">${outcomeBadge}</td>
            <td class="text-surface-300 text-sm max-w-xs truncate" title="${c.notes || ''}">${c.notes || '—'}</td>
            <td class="whitespace-nowrap">${followUpBadge}</td>
          </tr>
        `;
      }).join('');
    }
  }
}

function exportWorkHistoryToCSV() {
  const list = getFilteredCalls();
  if (list.length === 0) {
    toast('No data to export', 'warning');
    return;
  }

  const columnDefs = [
    { key: 'dateTime', label: 'Date & Time' },
    { key: 'agent', label: 'Agent' },
    { key: 'team', label: 'Team Name' },
    { key: 'lead', label: 'Lead' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'loanAmount', label: 'Loan Amount' },
    { key: 'loanType', label: 'Loan Type' },
    { key: 'leadStatus', label: 'Lead Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'aging', label: 'Aging' },
    { key: 'outcome', label: 'Call Outcome' },
    { key: 'notes', label: 'Notes' },
    { key: 'followUp', label: 'Follow-up Due' }
  ];

  const activeCols = columnDefs.filter(col => workHistoryColumns[col.key] && workHistoryColumns[col.key].visible);

  if (activeCols.length === 0) {
    toast('No visible columns to export', 'warning');
    return;
  }

  const headers = activeCols.map(col => col.label);

  const rows = list.map(c => {
    const lead = leads.find(l => l.id === c.lead_id || l._id === c.lead_id);
    const agent = getUser(c.agent_id);
    const teamId = agent ? (agent.team_id && typeof agent.team_id === 'object' ? (agent.team_id._id || agent.team_id.id) : agent.team_id) : null;
    const team = getTeam(teamId);

    const formattedTime = new Date(c.created_at).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const agentName = agent ? agent.name : 'Unknown Agent';
    const teamName = team ? team.name : '—';
    const leadName = lead ? lead.name : 'Unknown Lead';
    const leadPhone = lead ? lead.phone : '—';
    const leadEmail = lead ? (lead.email || '—') : '—';
    const loanAmount = lead ? lead.amount_requested : 0;
    const loanTypeVal = lead ? (LOAN_LABELS[lead.loan_type] || lead.loan_type || '—') : '—';
    const leadStatusVal = lead ? (STATUS_LABELS[lead.status] || lead.status || '—') : '—';
    const leadPriorityVal = lead ? (PRIORITY_LABELS[lead.priority] || lead.priority || 'cold') : '—';
    const outcomeVal = OUTCOME_LABELS[c.outcome] || c.outcome || '—';
    const notesVal = c.notes || '—';
    const followUpVal = c.follow_up_due ? new Date(c.follow_up_due).toLocaleDateString() : '—';

    return activeCols.map(col => {
      switch (col.key) {
        case 'dateTime': return formattedTime;
        case 'agent': return agentName;
        case 'team': return teamName;
        case 'lead': return leadName;
        case 'phone': return leadPhone;
        case 'email': return leadEmail;
        case 'loanAmount': return loanAmount;
        case 'loanType': return loanTypeVal;
        case 'leadStatus': return leadStatusVal;
        case 'priority': return leadPriorityVal;
        case 'aging': return lead ? getAging(lead.assigned_at) : '—';
        case 'outcome': return outcomeVal;
        case 'notes': return notesVal;
        case 'followUp': return followUpVal;
        default: return '';
      }
    });
  });

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    str = str.replace(/"/g, '""');
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      str = `"${str}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  link.setAttribute('download', `work_history_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast('Work history exported to CSV successfully');
}

