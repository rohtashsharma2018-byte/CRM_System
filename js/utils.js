// ========== UTILITY FUNCTIONS ==========
async function fetchAPI(endpoint, options = {}) {
  const url = `/api${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(APP.token ? { 'Authorization': `Bearer ${APP.token}` } : {}),
    ...options.headers
  };
  
  try {
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 && APP.token) {
      handleLogout();
      return null;
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  } catch (err) {
    toast(err.message, 'error');
    throw err;
  }
}

function toggleLoginPassword() {
  const pwdInput = document.getElementById('loginPassword');
  const eyeIcon = document.getElementById('passwordEyeIcon');
  if (pwdInput && eyeIcon) {
    if (pwdInput.type === 'password') {
      pwdInput.type = 'text';
      eyeIcon.className = 'fas fa-eye-slash text-sm';
    } else {
      pwdInput.type = 'password';
      eyeIcon.className = 'fas fa-eye text-sm';
    }
  }
}

function togglePasswordVisibility(inputId, iconId) {
  const pwdInput = document.getElementById(inputId);
  const eyeIcon = document.getElementById(iconId);
  if (pwdInput && eyeIcon) {
    if (pwdInput.type === 'password') {
      pwdInput.type = 'text';
      eyeIcon.className = 'fas fa-eye-slash text-sm';
    } else {
      pwdInput.type = 'password';
      eyeIcon.className = 'fas fa-eye text-sm';
    }
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginSubmitBtn');
  
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
  
  try {
    const res = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (res && res.token) {
      APP.token = res.token;
      APP.currentUserId = res.user.id;
      APP.currentRole = res.user.role;
      APP.userName = res.user.name;
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      
      document.getElementById('loginOverlay').style.display = 'none';
      toast('Login successful');
      await initApp();
    }
  } catch (err) {
    // Error handled by fetchAPI toast
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
  }
}

function handleLogout() {
  APP.token = null;
  APP.currentUserId = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('loginOverlay').style.display = 'flex';
  toast('Logged out successfully', 'info');
}

function setLeads(leadsData) {
  leads = (leadsData || []).map(l => ({ ...l, id: l._id }));
}

async function initApp() {
  initTheme();
  if (!APP.token) {
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('loginOverlay').style.display = 'flex';
    return;
  }
  
  document.getElementById('loginOverlay').style.display = 'none';
  document.getElementById('appContainer').style.display = 'block';
  initSidebar();
  
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      APP.currentUserId = user.id;
      APP.currentRole = user.role;
      APP.userName = user.name;
    }

    const [
      leadsData, dashboardData, usersData, teamsData, loanTypesData, sourcesData, distRulesData,
      allocHistoryData, callsData, loanLabelsData, companyProfileData,
      leadStatusesData, leadStatusLabelsData, leadPrioritiesData, leadPriorityLabelsData,
      targetsData
    ] = await Promise.all([
      fetchAPI('/leads?page=1&limit=50'),
      fetchAPI('/dashboard').catch(() => ({})),
      fetchAPI('/users'),
      fetchAPI('/teams'),
      fetchAPI('/settings/loan_types'),
      fetchAPI('/settings/sources'),
      fetchAPI('/settings/distribution_rules'),
      fetchAPI('/settings/allocation_history').catch(() => []),
      fetchAPI('/calls').catch(() => []),
      fetchAPI('/settings/loan_labels').catch(() => ({})),
      fetchAPI('/settings/company_profile').catch(() => ({})),
      fetchAPI('/settings/lead_statuses').catch(() => []),
      fetchAPI('/settings/lead_status_labels').catch(() => ({})),
      fetchAPI('/settings/lead_priorities').catch(() => []),
      fetchAPI('/settings/lead_priority_labels').catch(() => ({})),
      fetchAPI('/settings/targets').catch(() => ({}))
    ]);
    
    APP.dashboardStats = dashboardData || {};
    
    setLeads(leadsData.leads || leadsData); APP.totalLeads = leadsData.total || 0;
    USERS = (usersData || []).map(u => ({ ...u, id: u._id }));
    TEAMS = (teamsData || []).map(t => ({ ...t, id: t._id }));
    allocationHistory = Array.isArray(allocHistoryData) ? allocHistoryData : [];
    callLogs = Array.isArray(callsData) ? callsData : [];
    LOAN_TYPES = loanTypesData && loanTypesData.length > 0 ? loanTypesData : ['personal', 'home', 'business', 'lap', 'credit_card'];
    if (loanLabelsData && typeof loanLabelsData === 'object' && !Array.isArray(loanLabelsData)) {
      LOAN_LABELS = { ...LOAN_LABELS, ...loanLabelsData };
    }
    SOURCES = sourcesData && sourcesData.length > 0 ? sourcesData : ['website', 'referral', 'campaign', 'facebook', 'google', 'walkin'];
    if (distRulesData && distRulesData.method) DISTRIBUTION_RULES = distRulesData;
    
    if (companyProfileData && typeof companyProfileData === 'object' && !Array.isArray(companyProfileData)) {
      COMPANY_PROFILE = { ...COMPANY_PROFILE, ...companyProfileData };
    }

    if (leadStatusesData && leadStatusesData.length > 0) {
      STATUSES = leadStatusesData;
    }
    if (leadStatusLabelsData && typeof leadStatusLabelsData === 'object' && !Array.isArray(leadStatusLabelsData)) {
      STATUS_LABELS = { ...STATUS_LABELS, ...leadStatusLabelsData };
    }
    if (targetsData && typeof targetsData === 'object' && !Array.isArray(targetsData)) {
      TARGETS = { ...TARGETS, ...targetsData };
    }
    if (leadPrioritiesData && leadPrioritiesData.length > 0) {
      PRIORITIES = leadPrioritiesData;
    }
    if (leadPriorityLabelsData && typeof leadPriorityLabelsData === 'object' && !Array.isArray(leadPriorityLabelsData)) {
      PRIORITY_LABELS = { ...PRIORITY_LABELS, ...leadPriorityLabelsData };
    }
    
    updateUserUI();
    navigateTo('dashboard');
  } catch (err) {
    console.error('App init error:', err);
  }
}

function toast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
  t.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.style.animation = 'toastOut .3s ease forwards'; setTimeout(() => t.remove(), 300); }, 3500);
}

function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function showChangePasswordModal() {
  document.getElementById('changePasswordForm').reset();
  openModal('changePasswordModal');
}

async function handleChangePasswordSubmit(e) {
  e.preventDefault();
  const newPassword = document.getElementById('newPasswordInput').value;
  const confirmNewPassword = document.getElementById('confirmNewPasswordInput').value;

  if (newPassword !== confirmNewPassword) {
    toast('New passwords do not match', 'error');
    return;
  }

  if (newPassword.length < 6) {
    toast('New password must be at least 6 characters', 'error');
    return;
  }

  const btn = document.getElementById('changePasswordSubmitBtn');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    await fetchAPI('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    });
    toast('Password changed successfully');
    closeModal('changePasswordModal');
  } catch (err) {
    // Error handled by fetchAPI
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

let currentConfirmCallback = null;

function showConfirmModal(title, message, callback) {
  document.getElementById('confirmModalTitle').textContent = title;
  document.getElementById('confirmModalMessage').textContent = message;
  currentConfirmCallback = callback;
  
  const btn = document.getElementById('confirmModalBtn');
  btn.disabled = false;
  btn.classList.remove('opacity-50', 'cursor-not-allowed');
  
  openModal('confirmModal');
}
function executeConfirm() {
  if (currentConfirmCallback) currentConfirmCallback();
  closeModal('confirmModal');
}

function getUser(id) {
  if (!id) return null;
  const targetId = typeof id === 'object' ? (id._id || id.id) : id;
  return USERS.find(u => u.id === targetId || u._id === targetId);
}
function getTeam(id) {
  if (!id) return null;
  const targetId = typeof id === 'object' ? (id._id || id.id) : id;
  return TEAMS.find(t => t.id === targetId || t._id === targetId);
}
function getLeadCalls(leadId) { return callLogs.filter(c => c.lead_id === leadId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at)); }

function toggleLeadSelection(id, checked) {
  if (checked) {
    if (!selectedLeadIds.includes(id)) selectedLeadIds.push(id);
  } else {
    selectedLeadIds = selectedLeadIds.filter(lid => lid !== id);
  }
  renderPage();
}

function toggleAllLeads(checked) {
  const vl = getFilteredLeads();
  if (checked) {
    selectedLeadIds = vl.map(l => l.id || l._id);
  } else {
    selectedLeadIds = [];
  }
  renderPage();
}

async function bulkDeleteLeads() {
  if (selectedLeadIds.length === 0) return;
  showConfirmModal('Bulk Delete', `Are you sure you want to delete ${selectedLeadIds.length} leads?`, async () => {
    let successCount = 0;
    const total = selectedLeadIds.length;
    
    // We'll do it sequentially to keep it simple and follow current pattern
    // In a real app we'd have a bulk endpoint
    for (const id of selectedLeadIds) {
      try {
        await fetchAPI(`/leads/${id}`, { method: 'DELETE' });
        leads = leads.filter(l => l.id !== id && l._id !== id);
        callLogs = callLogs.filter(c => c.lead_id !== id);
        successCount++;
      } catch (err) {
        console.error(`Failed to delete lead ${id}`, err);
      }
    }
    
    toast(`Successfully deleted ${successCount} of ${total} leads`);
    selectedLeadIds = [];
    renderPage();
  });
}

function showBulkReassignModal() {
  if (selectedLeadIds.length === 0) return;
  const agents = getAssignableAgents();
  
  const html = `
    <div class="p-6 border-b border-surface-800 flex items-center justify-between">
      <h3 class="font-display font-bold text-lg text-white">Bulk Reassign Leads</h3>
      <button class="btn-ghost rounded-lg" onclick="closeModal('leadDetailModal')"><i class="fas fa-times"></i></button>
    </div>
    <div class="p-6">
      <p class="text-white mb-4 font-medium">Reassigning ${selectedLeadIds.length} selected leads</p>
      
      <label class="block text-sm text-surface-400 mb-1.5">Assign to:</label>
      <select class="form-input mb-4" id="reassignSelect">
        <option value="">Unassigned</option>
        ${agents.map(a => `<option value="${a.id}">${a.name} (${getTeam(a.team_id)?.name})</option>`).join('')}
      </select>
      
      <div class="flex gap-3 mt-6">
        <button class="btn btn-primary flex-1" onclick="handleBulkReassign()">Apply Reassignment</button>
        <button class="btn btn-secondary flex-1" onclick="closeModal('leadDetailModal')">Cancel</button>
      </div>
    </div>
  `;
  
  const modal = document.getElementById('leadDetailModal');
  document.getElementById('leadDetailContent').innerHTML = html;
  modal.classList.add('show');
}

async function handleBulkReassign() {
  const agentId = document.getElementById('reassignSelect').value;
  let successCount = 0;
  const total = selectedLeadIds.length;
  
  for (const id of selectedLeadIds) {
    try {
      await fetchAPI(`/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          assigned_agent_id: agentId || null,
          assigned_at: agentId ? new Date().toISOString() : null
        })
      });
      
      const idx = leads.findIndex(l => l.id === id || l._id === id);
      if (idx !== -1) {
        leads[idx].assigned_agent_id = agentId || null;
        leads[idx].assigned_at = agentId ? new Date().toISOString() : null;
      }
      successCount++;
    } catch (err) {
      console.error(`Failed to reassign lead ${id}`, err);
    }
  }
  
  toast(`Successfully reassigned ${successCount} of ${total} leads`);
  closeModal('leadDetailModal');
  selectedLeadIds = [];
  renderPage();
}

function getVisibleLeads() {
  if (APP.currentRole === 'admin') return leads;
  if (APP.currentRole === 'tl') {
    const tl = getUser(APP.currentUserId);
    if (!tl) return [];
    return leads.filter(l => {
      const agent = getUser(l.assigned_agent_id);
      return agent && agent.team_id === tl.team_id;
    });
  }
  return leads.filter(l => l.assigned_agent_id === APP.currentUserId);
}

function getStatusBadgeClass(status) {
  return 'badge badge-' + status.replace('_', '-');
}

function getPriorityDot(priority) {
  return `<span class="priority-dot priority-${priority}" title="${priority}"></span>`;
}

