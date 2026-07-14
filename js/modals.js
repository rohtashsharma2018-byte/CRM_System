// ========== MODALS & ACTIONS ==========
function showAddMemberModal() {
  document.getElementById('memberEditId').value = '';
  document.getElementById('memberForm').reset();
  document.getElementById('memberModalTitle').textContent = 'Add New Member';
  document.getElementById('memberSubmitBtn').textContent = 'Add Member';
  
  // Set password field to required for new user
  const pwdLabel = document.getElementById('memberPasswordLabel');
  const pwdInput = document.getElementById('memberPassword');
  if (pwdLabel && pwdInput) {
    pwdLabel.textContent = 'Password *';
    pwdInput.required = true;
    pwdInput.placeholder = 'Min 6 characters (e.g. Paisa@123)';
    pwdInput.type = 'password';
    const eyeIcon = document.getElementById('memberPasswordEyeIcon');
    if (eyeIcon) eyeIcon.className = 'fas fa-eye text-sm';
  }

  // Populate Team Select dynamically based on TEAMS
  const teamSelect = document.getElementById('memberTeam');
  teamSelect.innerHTML = '<option value="">No Team</option>' + TEAMS.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  
  openModal('addMemberModal');
}

function showEditMemberModal(userId) {
  const user = getUser(userId);
  if (!user) return;
  document.getElementById('memberEditId').value = userId;
  document.getElementById('memberModalTitle').textContent = 'Edit Member';
  document.getElementById('memberSubmitBtn').textContent = 'Save Changes';
  
  document.getElementById('memberName').value = user.name;
  document.getElementById('memberEmail').value = user.email;
  document.getElementById('memberRole').value = user.role;
  
  // Set password field to optional for edit user
  const pwdLabel = document.getElementById('memberPasswordLabel');
  const pwdInput = document.getElementById('memberPassword');
  if (pwdLabel && pwdInput) {
    pwdLabel.textContent = 'New Password (optional)';
    pwdInput.required = false;
    pwdInput.placeholder = 'Leave blank to keep unchanged';
    pwdInput.value = '';
    pwdInput.type = 'password';
    const eyeIcon = document.getElementById('memberPasswordEyeIcon');
    if (eyeIcon) eyeIcon.className = 'fas fa-eye text-sm';
  }

  const teamSelect = document.getElementById('memberTeam');
  teamSelect.innerHTML = '<option value="">No Team</option>' + TEAMS.map(t => `<option value="${t.id}" ${t.id === user.team_id ? 'selected' : ''}>${t.name}</option>`).join('');
  
  openModal('addMemberModal');
}

async function handleMemberSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('memberEditId').value;
  const name = document.getElementById('memberName').value.trim();
  const email = document.getElementById('memberEmail').value.trim();
  const role = document.getElementById('memberRole').value;
  const teamId = document.getElementById('memberTeam').value || null;
  const password = document.getElementById('memberPassword').value.trim();

  const btn = e.submitter;
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    const payload = { name, email, role, team_id: teamId };
    if (password) {
      payload.password = password;
    }

    if (editId) {
      await fetchAPI(`/users/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast('Member updated successfully');
    } else {
      // Check if email already exists locally first
      const emailExists = USERS.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        toast('A user with this email already exists', 'error');
        return;
      }
      await fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      toast('Member added successfully');
    }

    // Refresh users
    const usersData = await fetchAPI('/users');
    USERS = (usersData || []).map(u => ({ ...u, id: u._id }));
    
    closeModal('addMemberModal');
    renderPage();
    updateUserUI();
  } catch (err) {
    // Error handled by fetchAPI
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

function populateLoanTypeSelect(selectedId) {
  const sel = document.getElementById('leadLoanType');
  if (sel) {
    sel.innerHTML = '<option value="">Select loan type</option>' + LOAN_TYPES.map(lt => `<option value="${lt}" ${lt === selectedId ? 'selected' : ''}>${LOAN_LABELS[lt] || lt}</option>`).join('');
  }
}

function populateSourceSelect(selectedId) {
  const sel = document.getElementById('leadSource');
  if (sel) {
    sel.innerHTML = SOURCES.map(s => `<option value="${s}" ${s === selectedId ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('');
  }
}

function populateStatusSelect(selectedId) {
  const sel = document.getElementById('leadStatus');
  if (sel) {
    const val = selectedId || 'new';
    sel.innerHTML = STATUSES.map(s => `<option value="${s}" ${s === val ? 'selected' : ''}>${STATUS_LABELS[s] || s}</option>`).join('');
  }
}

function populatePrioritySelect(selectedId) {
  const sel = document.getElementById('leadPriority');
  if (sel) {
    const val = selectedId || 'cold';
    sel.innerHTML = PRIORITIES.map(p => `<option value="${p}" ${p === val ? 'selected' : ''}>${PRIORITY_LABELS[p] || p}</option>`).join('');
  }
}

function populateCallStatusSelect(selectedId) {
  const sel = document.getElementById('callStatusUpdate');
  if (sel) {
    const val = selectedId || 'new';
    sel.innerHTML = STATUSES.map(s => `<option value="${s}" ${s === val ? 'selected' : ''}>${STATUS_LABELS[s] || s}</option>`).join('');
  }
}

function populateCallPrioritySelect(selectedId) {
  const sel = document.getElementById('callPriorityUpdate');
  if (sel) {
    const val = selectedId || 'cold';
    sel.innerHTML = PRIORITIES.map(p => `<option value="${p}" ${p === val ? 'selected' : ''}>${PRIORITY_LABELS[p] || p}</option>`).join('');
  }
}

function showAddLeadModal() {
  document.getElementById('leadEditId').value = '';
  document.getElementById('leadForm').reset();
  document.getElementById('leadModalTitle').textContent = 'Add New Lead';
  document.getElementById('leadSubmitBtn').textContent = 'Add Lead';
  document.getElementById('duplicateWarning').classList.add('hidden');
  document.getElementById('leadDeleteBtn').classList.add('hidden');
  populateAgentSelect();
  populateLoanTypeSelect();
  populateSourceSelect();
  populateStatusSelect();
  populatePrioritySelect();
  openModal('addLeadModal');
}

function showEditLeadModal(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  document.getElementById('leadEditId').value = id;
  document.getElementById('leadModalTitle').textContent = 'Edit Lead';
  document.getElementById('leadSubmitBtn').textContent = 'Save Changes';
  document.getElementById('leadName').value = lead.name;
  document.getElementById('leadPhone').value = lead.phone;
  document.getElementById('leadEmail').value = lead.email || '';
  document.getElementById('leadCity').value = lead.city || '';
  populateLoanTypeSelect(lead.loan_type);
  document.getElementById('leadAmount').value = lead.amount_requested;
  populateSourceSelect(lead.source);
  populateStatusSelect(lead.status);
  populatePrioritySelect(lead.priority);
  document.getElementById('leadNotes').value = lead.notes || '';
  document.getElementById('duplicateWarning').classList.add('hidden');
  
  const deleteBtn = document.getElementById('leadDeleteBtn');
  if (APP.currentRole !== 'agent') {
    deleteBtn.classList.remove('hidden');
  } else {
    deleteBtn.classList.add('hidden');
  }
  
  populateAgentSelect(lead.assigned_agent_id);
  openModal('addLeadModal');
}

function populateAgentSelect(selectedId) {
  const sel = document.getElementById('leadAgent');
  const agents = getAssignableAgents();
  sel.innerHTML = '<option value="">Auto-assign</option>' + agents.map(a => `<option value="${a.id}" ${a.id === selectedId ? 'selected' : ''}>${a.name}</option>`).join('');
}

// --- Loan Type Modals and Actions ---
function showAddLoanTypeModal() {
  document.getElementById('loanTypeEditKey').value = '';
  document.getElementById('loanTypeForm').reset();
  document.getElementById('loanTypeKey').disabled = false;
  document.getElementById('loanTypeModalTitle').textContent = 'Add Loan Type';
  document.getElementById('loanTypeSubmitBtn').textContent = 'Add Loan Type';
  openModal('addLoanTypeModal');
}

function showEditLoanTypeModal(key) {
  const label = LOAN_LABELS[key] || key;
  document.getElementById('loanTypeEditKey').value = key;
  document.getElementById('loanTypeKey').value = key;
  document.getElementById('loanTypeKey').disabled = true;
  document.getElementById('loanTypeName').value = label;
  document.getElementById('loanTypeModalTitle').textContent = 'Edit Loan Type';
  document.getElementById('loanTypeSubmitBtn').textContent = 'Save Changes';
  openModal('addLoanTypeModal');
}

async function handleLoanTypeSubmit(e) {
  e.preventDefault();
  const editKey = document.getElementById('loanTypeEditKey').value;
  const key = document.getElementById('loanTypeKey').value.trim().toLowerCase().replace(/\s+/g, '_');
  const name = document.getElementById('loanTypeName').value.trim();

  if (!key) {
    toast('Invalid loan type key', 'error');
    return;
  }

  const btn = e.submitter;
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    if (editKey) {
      LOAN_LABELS[editKey] = name;
    } else {
      if (LOAN_TYPES.includes(key)) {
        toast('Loan Type code already exists', 'error');
        return;
      }
      LOAN_TYPES.push(key);
      LOAN_LABELS[key] = name;
    }

    await Promise.all([
      fetchAPI('/settings/loan_types', { method: 'POST', body: JSON.stringify({ value: LOAN_TYPES }) }),
      fetchAPI('/settings/loan_labels', { method: 'POST', body: JSON.stringify({ value: LOAN_LABELS }) })
    ]);
    toast(editKey ? 'Loan Type updated successfully' : 'Loan Type added successfully');
    closeModal('addLoanTypeModal');
    renderPage();
  } catch (err) {
    // Error handled by fetchAPI
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

async function deleteLoanType(key) {
  if (LOAN_TYPES.length <= 1) {
    toast('Cannot delete the last remaining loan type', 'error');
    return;
  }
  
  const leadUsing = leads.some(l => l.loan_type === key);
  if (leadUsing) {
    toast('Cannot delete: Loan type is currently assigned to one or more leads.', 'error');
    return;
  }

  showConfirmModal('Delete Loan Type', `Are you sure you want to delete ${LOAN_LABELS[key] || key}?`, async () => {
    try {
      const index = LOAN_TYPES.indexOf(key);
      if (index > -1) {
        LOAN_TYPES.splice(index, 1);
        delete LOAN_LABELS[key];
        await Promise.all([
          fetchAPI('/settings/loan_types', { method: 'POST', body: JSON.stringify({ value: LOAN_TYPES }) }),
          fetchAPI('/settings/loan_labels', { method: 'POST', body: JSON.stringify({ value: LOAN_LABELS }) })
        ]);
        toast('Loan Type deleted successfully');
        renderPage();
      }
    } catch (err) {
      initApp();
    }
  });
}

// --- Lead Status Modals and Actions ---
function showAddLeadStatusModal() {
  document.getElementById('leadStatusEditKey').value = '';
  document.getElementById('leadStatusForm').reset();
  document.getElementById('leadStatusKey').disabled = false;
  document.getElementById('leadStatusModalTitle').textContent = 'Add Lead Status';
  document.getElementById('leadStatusSubmitBtn').textContent = 'Add Lead Status';
  openModal('addLeadStatusModal');
}

function showEditLeadStatusModal(key) {
  const label = STATUS_LABELS[key] || key;
  document.getElementById('leadStatusEditKey').value = key;
  document.getElementById('leadStatusKey').value = key;
  document.getElementById('leadStatusKey').disabled = true;
  document.getElementById('leadStatusName').value = label;
  document.getElementById('leadStatusModalTitle').textContent = 'Edit Lead Status';
  document.getElementById('leadStatusSubmitBtn').textContent = 'Save Changes';
  openModal('addLeadStatusModal');
}

async function handleLeadStatusSubmit(e) {
  e.preventDefault();
  const editKey = document.getElementById('leadStatusEditKey').value;
  const key = document.getElementById('leadStatusKey').value.trim().toLowerCase().replace(/\s+/g, '_');
  const name = document.getElementById('leadStatusName').value.trim();

  if (!key) {
    toast('Invalid status key', 'error');
    return;
  }

  const btn = e.submitter;
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    if (editKey) {
      STATUS_LABELS[editKey] = name;
    } else {
      if (STATUSES.includes(key)) {
        toast('Lead Status code already exists', 'error');
        return;
      }
      STATUSES.push(key);
      STATUS_LABELS[key] = name;
    }

    await Promise.all([
      fetchAPI('/settings/lead_statuses', { method: 'POST', body: JSON.stringify({ value: STATUSES }) }),
      fetchAPI('/settings/lead_status_labels', { method: 'POST', body: JSON.stringify({ value: STATUS_LABELS }) })
    ]);
    toast(editKey ? 'Lead Status updated successfully' : 'Lead Status added successfully');
    closeModal('addLeadStatusModal');
    renderPage();
  } catch (err) {
    // Handled by fetchAPI
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

async function deleteLeadStatus(key) {
  if (STATUSES.length <= 1) {
    toast('Cannot delete the last remaining lead status', 'error');
    return;
  }

  const leadUsing = leads.some(l => (l.status || 'new').toLowerCase().trim() === key.toLowerCase().trim());
  if (leadUsing) {
    toast('Cannot delete: Status is currently assigned to one or more leads.', 'error');
    return;
  }

  showConfirmModal('Delete Lead Status', `Are you sure you want to delete ${STATUS_LABELS[key] || key}?`, async () => {
    try {
      const index = STATUSES.indexOf(key);
      if (index > -1) {
        STATUSES.splice(index, 1);
        delete STATUS_LABELS[key];
        await Promise.all([
          fetchAPI('/settings/lead_statuses', { method: 'POST', body: JSON.stringify({ value: STATUSES }) }),
          fetchAPI('/settings/lead_status_labels', { method: 'POST', body: JSON.stringify({ value: STATUS_LABELS }) })
        ]);
        toast('Lead Status deleted successfully');
        renderPage();
      }
    } catch (err) {
      initApp();
    }
  });
}

// --- Lead Priority Modals and Actions ---
function showAddLeadPriorityModal() {
  document.getElementById('leadPriorityEditKey').value = '';
  document.getElementById('leadPriorityForm').reset();
  document.getElementById('leadPriorityKey').disabled = false;
  document.getElementById('leadPriorityModalTitle').textContent = 'Add Lead Priority';
  document.getElementById('leadPrioritySubmitBtn').textContent = 'Add Lead Priority';
  openModal('addLeadPriorityModal');
}

function showEditLeadPriorityModal(key) {
  const label = PRIORITY_LABELS[key] || key;
  document.getElementById('leadPriorityEditKey').value = key;
  document.getElementById('leadPriorityKey').value = key;
  document.getElementById('leadPriorityKey').disabled = true;
  document.getElementById('leadPriorityName').value = label;
  document.getElementById('leadPriorityModalTitle').textContent = 'Edit Lead Priority';
  document.getElementById('leadPrioritySubmitBtn').textContent = 'Save Changes';
  openModal('addLeadPriorityModal');
}

async function handleLeadPrioritySubmit(e) {
  e.preventDefault();
  const editKey = document.getElementById('leadPriorityEditKey').value;
  const key = document.getElementById('leadPriorityKey').value.trim().toLowerCase().replace(/\s+/g, '_');
  const name = document.getElementById('leadPriorityName').value.trim();

  if (!key) {
    toast('Invalid priority key', 'error');
    return;
  }

  const btn = e.submitter;
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    if (editKey) {
      PRIORITY_LABELS[editKey] = name;
    } else {
      if (PRIORITIES.includes(key)) {
        toast('Lead Priority code already exists', 'error');
        return;
      }
      PRIORITIES.push(key);
      PRIORITY_LABELS[key] = name;
    }

    await Promise.all([
      fetchAPI('/settings/lead_priorities', { method: 'POST', body: JSON.stringify({ value: PRIORITIES }) }),
      fetchAPI('/settings/lead_priority_labels', { method: 'POST', body: JSON.stringify({ value: PRIORITY_LABELS }) })
    ]);
    toast(editKey ? 'Lead Priority updated successfully' : 'Lead Priority added successfully');
    closeModal('addLeadPriorityModal');
    renderPage();
  } catch (err) {
    // Handled by fetchAPI
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

async function deleteLeadPriority(key) {
  if (PRIORITIES.length <= 1) {
    toast('Cannot delete the last remaining lead priority', 'error');
    return;
  }

  const leadUsing = leads.some(l => (l.priority || 'cold').toLowerCase().trim() === key.toLowerCase().trim());
  if (leadUsing) {
    toast('Cannot delete: Priority is currently assigned to one or more leads.', 'error');
    return;
  }

  showConfirmModal('Delete Lead Priority', `Are you sure you want to delete ${PRIORITY_LABELS[key] || key}?`, async () => {
    try {
      const index = PRIORITIES.indexOf(key);
      if (index > -1) {
        PRIORITIES.splice(index, 1);
        delete PRIORITY_LABELS[key];
        await Promise.all([
          fetchAPI('/settings/lead_priorities', { method: 'POST', body: JSON.stringify({ value: PRIORITIES }) }),
          fetchAPI('/settings/lead_priority_labels', { method: 'POST', body: JSON.stringify({ value: PRIORITY_LABELS }) })
        ]);
        toast('Lead Priority deleted successfully');
        renderPage();
      }
    } catch (err) {
      initApp();
    }
  });
}

async function handleCompanyProfileSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('saveCompanyProfileBtn');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  const newProfile = {
    name: document.getElementById('cp_name').value,
    contact_person: document.getElementById('cp_contact_person').value,
    email: document.getElementById('cp_email').value,
    mobile: document.getElementById('cp_mobile').value,
    website: document.getElementById('cp_website').value,
    address: document.getElementById('cp_address').value,
    other: document.getElementById('cp_other').value
  };

  try {
    const savedProfile = await fetchAPI('/settings/company_profile', { 
      method: 'POST', 
      body: JSON.stringify({ value: newProfile }) 
    });
    if (savedProfile) {
      COMPANY_PROFILE = { ...COMPANY_PROFILE, ...newProfile };
      toast('Company Profile updated successfully');
    }
  } catch (err) {
    console.error('Error saving company profile:', err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

// --- Lead Source Modals and Actions ---
function showAddSourceModal() {
  document.getElementById('sourceEditKey').value = '';
  document.getElementById('sourceForm').reset();
  document.getElementById('sourceModalTitle').textContent = 'Add Lead Source';
  document.getElementById('sourceSubmitBtn').textContent = 'Add Source';
  openModal('addSourceModal');
}

async function handleSourceSubmit(e) {
  e.preventDefault();
  const key = document.getElementById('sourceKey').value.trim().toLowerCase().replace(/\s+/g, '_');

  if (!key) {
    toast('Invalid source key', 'error');
    return;
  }

  if (SOURCES.includes(key)) {
    toast('Lead source already exists', 'error');
    return;
  }

  const btn = e.submitter;
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    SOURCES.push(key);
    await fetchAPI('/settings/sources', { method: 'POST', body: JSON.stringify({ value: SOURCES }) });
    toast('Lead Source added successfully');
    closeModal('addSourceModal');
    renderPage();
  } catch (err) {
    SOURCES.pop();
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

async function deleteSource(key) {
  if (SOURCES.length <= 1) {
    toast('Cannot delete the last remaining lead source', 'error');
    return;
  }

  const leadUsing = leads.some(l => l.source === key);
  if (leadUsing) {
    toast('Cannot delete: Lead source is currently assigned to one or more leads.', 'error');
    return;
  }
  
  showConfirmModal('Delete Source', `Are you sure you want to delete ${key}?`, async () => {
    try {
      const index = SOURCES.indexOf(key);
      if (index > -1) {
        SOURCES.splice(index, 1);
        await fetchAPI('/settings/sources', { method: 'POST', body: JSON.stringify({ value: SOURCES }) });
        toast('Lead Source deleted successfully');
        renderPage();
      }
    } catch (err) {
      initApp();
    }
  });
}

// --- Team Modals and Actions ---
function showAddTeamModal() {
  document.getElementById('teamEditId').value = '';
  document.getElementById('teamForm').reset();
  document.getElementById('teamModalTitle').textContent = 'Add Team Name';
  document.getElementById('teamSubmitBtn').textContent = 'Add Team Name';
  
  // Populate Team Leader dropdown
  const tlSelect = document.getElementById('teamLeaderSelect');
  const tls = USERS.filter(u => u.role === 'tl');
  tlSelect.innerHTML = '<option value="">Unassigned</option>' + tls.map(tl => `<option value="${tl.id}">${tl.name}</option>`).join('');
  
  openModal('addTeamModal');
}

function showEditTeamModal(id) {
  const team = getTeam(id);
  if (!team) return;
  document.getElementById('teamEditId').value = id;
  document.getElementById('teamModalTitle').textContent = 'Edit Team Name';
  document.getElementById('teamSubmitBtn').textContent = 'Save Changes';
  
  document.getElementById('teamNameInput').value = team.name;
  
  // Populate Team Leader dropdown
  const tlSelect = document.getElementById('teamLeaderSelect');
  const tls = USERS.filter(u => u.role === 'tl');
  const currentLeaderId = team.leader_id && typeof team.leader_id === 'object' ? (team.leader_id._id || team.leader_id.id) : team.leader_id;
  tlSelect.innerHTML = '<option value="">Unassigned</option>' + tls.map(tl => `<option value="${tl.id}" ${tl.id === currentLeaderId ? 'selected' : ''}>${tl.name}</option>`).join('');
  
  openModal('addTeamModal');
}

async function handleTeamSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('teamEditId').value;
  const name = document.getElementById('teamNameInput').value.trim();
  const leaderId = document.getElementById('teamLeaderSelect').value || null;

  if (!name) {
    toast('Team name is required', 'error');
    return;
  }

  const btn = e.submitter;
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    const payload = { name, leader_id: leaderId };
    let result;
    if (editId) {
      result = await fetchAPI(`/teams/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast('Team updated successfully');
    } else {
      result = await fetchAPI('/teams', { method: 'POST', body: JSON.stringify(payload) });
      toast('Team added successfully');
    }

    // Refresh teams
    const teamsData = await fetchAPI('/teams');
    TEAMS = (teamsData || []).map(t => ({ ...t, id: t._id }));
    
    closeModal('addTeamModal');
    renderPage();
    updateUserUI();
  } catch (err) {
    // Error handled by fetchAPI
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

async function deleteTeam(id) {
  if (TEAMS.length <= 1) {
    toast('Cannot delete the last remaining team', 'error');
    return;
  }
  
  const hasUsers = USERS.some(u => u.team_id === id);
  const msg = hasUsers 
    ? 'This team currently has members assigned to it. Are you sure you want to delete it? Members will be set to no team.'
    : 'Are you sure you want to delete this team?';
    
  showConfirmModal('Delete Team', msg, async () => {
    try {
      await fetchAPI(`/teams/${id}`, { method: 'DELETE' });
      toast('Team deleted successfully');
      
      // Refresh teams
      const teamsData = await fetchAPI('/teams');
      TEAMS = (teamsData || []).map(t => ({ ...t, id: t._id }));
      
      renderPage();
      updateUserUI();
    } catch (err) {
      // Error handled by fetchAPI
    }
  });
}

async function handleLeadSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('leadEditId').value;
  const name = document.getElementById('leadName').value.trim();
  const phone = document.getElementById('leadPhone').value.trim();
  const email = document.getElementById('leadEmail').value.trim();
  const city = document.getElementById('leadCity').value.trim();
  const loanType = document.getElementById('leadLoanType').value;
  const amount = parseInt(document.getElementById('leadAmount').value);
  const source = document.getElementById('leadSource').value;
  const status = document.getElementById('leadStatus').value;
  const priority = document.getElementById('leadPriority').value;
  const notes = document.getElementById('leadNotes').value.trim();
  const agentId = document.getElementById('leadAgent').value;

  const btn = e.submitter;
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    const payload = {
      name, phone, email, city,
      loan_type: loanType,
      amount_requested: amount,
      source, status, priority, notes,
      assigned_agent_id: agentId || null
    };

    let result;
    if (editId) {
      const oldLead = leads.find(l => l.id === editId || l._id === editId);
      const oldAgentId = oldLead ? (oldLead.assigned_agent_id && typeof oldLead.assigned_agent_id === 'object' ? (oldLead.assigned_agent_id._id || oldLead.assigned_agent_id.id) : oldLead.assigned_agent_id) : null;
      const targetAgentId = agentId || null;

      result = await fetchAPI(`/leads/${editId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      toast('Lead updated successfully');

      if (oldAgentId !== targetAgentId) {
        await addAllocationEvent(editId, oldAgentId, targetAgentId);
      }
    } else {
      result = await fetchAPI('/leads', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      toast('Lead added successfully');

      if (agentId) {
        await addAllocationEvent(result._id || result.id, null, agentId);
      }
    }

    // Refresh leads list
    const leadsData = await fetchAPI('/leads');
    setLeads(leadsData);
    
    closeModal('addLeadModal');
    renderPage();
    updateUserUI();
  } catch (err) {
    // Error handled by fetchAPI toast
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

// Phone/Email duplicate detection on input
document.addEventListener('input', function(e) {
  if (e.target.id === 'leadPhone' || e.target.id === 'leadEmail') {
    const phone = document.getElementById('leadPhone').value.trim();
    const email = document.getElementById('leadEmail').value.trim();
    const editId = document.getElementById('leadEditId').value;
    
    let dup = null;
    let matchType = '';
    
    if (phone && phone.length >= 10) {
      dup = leads.find(l => l.phone === phone && (!editId || (l.id !== editId && l._id !== editId)));
      if (dup) matchType = 'Phone';
    }
    
    if (!dup && email && email.length > 5) {
      dup = leads.find(l => (l.email && l.email.toLowerCase() === email.toLowerCase()) && (!editId || (l.id !== editId && l._id !== editId)));
      if (dup) matchType = 'Email';
    }

    if (dup) {
      document.getElementById('duplicateWarning').classList.remove('hidden');
      document.getElementById('duplicateMsg').textContent = `Duplicate ${matchType} detected: ${dup.name} (${STATUS_LABELS[dup.status]}, ${LOAN_LABELS[dup.loan_type] || dup.loan_type}, ${formatDate(dup.created_at)})`;
    } else {
      document.getElementById('duplicateWarning').classList.add('hidden');
    }
  }
});

function showCallLogModal(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  document.getElementById('callLeadId').value = leadId;
  document.getElementById('callLeadName').textContent = lead.name;
  document.getElementById('callLeadPhone').textContent = lead.phone + ' — ' + (LOAN_LABELS[lead.loan_type] || lead.loan_type) + ' — ' + formatCurrency(lead.amount_requested);
  document.getElementById('callOutcome').value = '';
  populateCallStatusSelect((lead.status || 'new').toLowerCase().trim());
  populateCallPrioritySelect((lead.priority || 'cold').toLowerCase().trim());
  document.getElementById('callNotes').value = '';
  document.getElementById('callFollowUp').value = '';
  openModal('callLogModal');
}

async function handleCallLogSubmit(e) {
  e.preventDefault();
  const leadId = document.getElementById('callLeadId').value;
  const outcome = document.getElementById('callOutcome').value;
  const statusUpdate = document.getElementById('callStatusUpdate').value;
  const priorityUpdate = document.getElementById('callPriorityUpdate').value;
  const notes = document.getElementById('callNotes').value.trim();
  const followUp = document.getElementById('callFollowUp').value;

  const btn = e.submitter;
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    await fetchAPI('/calls', {
      method: 'POST',
      body: JSON.stringify({
        lead_id: leadId,
        outcome,
        notes,
        follow_up_at: followUp || null,
        new_status: statusUpdate || null,
        new_priority: priorityUpdate || null
      })
    });

    toast('Call logged successfully');
    
    // Refresh leads to get updated status
    const [leadsData, callsData] = await Promise.all([
      fetchAPI('/leads'),
      fetchAPI('/calls').catch(() => [])
    ]);
    setLeads(leadsData);
    callLogs = Array.isArray(callsData) ? callsData : [];
    
    closeModal('callLogModal');
    renderPage();
    updateUserUI();
  } catch (err) {
    // Error handled by fetchAPI toast
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

async function showLeadDetail(id) {
  const lead = leads.find(l => l.id === id || l._id === id);
  if (!lead) return;
  
  // Show modal with loading state for calls
  document.getElementById('leadDetailContent').innerHTML = `
    <div class="p-12 text-center">
      <i class="fas fa-spinner fa-spin text-4xl text-brand-500 mb-4"></i>
      <p class="text-surface-400">Loading details...</p>
    </div>
  `;
  openModal('leadDetailModal');

  try {
    const calls = await fetchAPI(`/calls/${lead.id || lead._id}`);
    const agent = getUser(lead.assigned_agent_id);
    const canManage = APP.currentRole !== 'agent';

    document.getElementById('leadDetailContent').innerHTML = `
      <div class="p-6 border-b border-surface-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-full bg-brand-600/20 flex items-center justify-center"><span class="text-lg font-bold text-brand-400">${lead.name.charAt(0)}</span></div>
          <div>
            <h3 class="font-display font-bold text-lg text-white">${lead.name}</h3>
            <p class="text-sm text-surface-400">${lead.city} — ${LOAN_LABELS[lead.loan_type] || lead.loan_type}</p>
          </div>
        </div>
        <button class="btn-ghost rounded-lg" onclick="closeModal('leadDetailModal')"><i class="fas fa-times"></i></button>
      </div>
      <div class="p-6">
        <!-- Info grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div><p class="text-xs text-surface-500 mb-1">Phone</p><p class="text-white font-medium">${lead.phone}</p></div>
          <div><p class="text-xs text-surface-500 mb-1">Email</p><p class="text-white font-medium">${lead.email || '—'}</p></div>
          <div><p class="text-xs text-surface-500 mb-1">Amount</p><p class="text-white font-medium text-lg">${formatCurrency(lead.amount_requested)}</p></div>
          <div><p class="text-xs text-surface-500 mb-1">Source</p><p class="text-white font-medium">${lead.source}</p></div>
          <div><p class="text-xs text-surface-500 mb-1">Status</p><span class="${getStatusBadgeClass(lead.status || 'new')}">${STATUS_LABELS[lead.status] || lead.status || '—'}</span></div>
          <div><p class="text-xs text-surface-500 mb-1">Assigned To</p><p class="text-white font-medium">${agent?.name || 'Unassigned'}</p></div>
          <div><p class="text-xs text-surface-500 mb-1">Priority</p>${getPriorityDot(lead.priority || 'cold')} <span class="text-white capitalize">${lead.priority || 'cold'}</span></div>
          <div><p class="text-xs text-surface-500 mb-1">Created</p><p class="text-white font-medium">${formatDateTime(lead.created_at)}</p></div>
          <div><p class="text-xs text-surface-500 mb-1">Aging</p><p class="text-white font-medium">${getAging(lead.assigned_at)}</p></div>
        </div>


        ${lead.notes ? `<div class="mb-6"><p class="text-xs text-surface-500 mb-1">Notes</p><p class="text-sm text-surface-300">${lead.notes}</p></div>` : ''}

        <!-- Call history -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-display font-semibold text-white">Call History (${calls ? calls.length : 0})</h4>
            <button class="btn btn-primary btn-sm" onclick="closeModal('leadDetailModal');showCallLogModal('${lead.id || lead._id}')"><i class="fas fa-phone-alt"></i> Log Call</button>
          </div>
          ${!calls || calls.length === 0 ? '<p class="text-surface-500 text-sm py-4 text-center">No calls logged yet</p>' : `
            <div class="space-y-3 max-h-64 overflow-y-auto">
              ${calls.map(c => `
                <div class="bg-surface-800/50 rounded-lg p-3">
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2">
                      <i class="fas fa-phone-alt text-xs ${c.outcome === 'answered' ? 'text-brand-400' : 'text-surface-500'}"></i>
                      <span class="text-sm text-white font-medium capitalize">${c.outcome.replace('_',' ')}</span>
                    </div>
                    <span class="text-xs text-surface-500">${formatDateTime(c.created_at)}</span>
                  </div>
                  ${c.notes ? `<p class="text-sm text-surface-400 mt-1">${c.notes}</p>` : ''}
                  ${c.follow_up_at ? `<p class="text-xs text-amber-400 mt-1"><i class="fas fa-clock mr-1"></i>Follow-up: ${formatDateTime(c.follow_up_at)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>

        ${canManage ? `
          <div class="mt-6 pt-4 border-t border-surface-800">
            <h4 class="font-display font-semibold text-white mb-3">Quick Actions</h4>
            <div class="flex flex-wrap gap-2">
              <button class="btn btn-sm text-white bg-blue-600 hover:bg-blue-700" onclick="showEditLeadModal('${lead.id || lead._id}');closeModal('leadDetailModal')"><i class="fas fa-edit"></i> Edit Lead</button>
              <button class="btn btn-sm text-white bg-yellow-600 hover:bg-yellow-700" onclick="showReassignModal('${lead.id || lead._id}')"><i class="fas fa-exchange-alt"></i> Reassign</button>
              <button class="btn btn-sm text-white bg-red-600 hover:bg-red-700" onclick="quickStatusChange('${lead.id || lead._id}', 'rejected')"><i class="fas fa-times"></i> Reject</button>
              <button class="btn btn-sm text-white bg-green-600 hover:bg-green-700" onclick="quickStatusChange('${lead.id || lead._id}', 'not_interested')"><i class="fas fa-user-slash"></i> Not Interested</button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  } catch (err) {
    console.error('Show lead detail error:', err);
  }
}

function quickStatusChange(leadId, newStatus) {
  const lead = leads.find(l => l.id === leadId);
  lead.status = newStatus;
  lead.updated_at = new Date().toISOString();
  toast(`Status updated to ${STATUS_LABELS[newStatus]}`);
  closeModal('leadDetailModal');
  renderPage();
}

async function deleteLead(id) {
  const lead = leads.find(l => l.id === id || l._id === id);
  if (!lead) {
    toast('Lead not found locally', 'error');
    return false;
  }
  
  try {
    await fetchAPI(`/leads/${id}`, { method: 'DELETE' });
    toast('Lead deleted successfully');
    leads = leads.filter(l => l.id !== id && l._id !== id);
    callLogs = callLogs.filter(c => c.lead_id !== id);
    renderPage();
    return true;
  } catch (err) {
    return false;
  }
}

async function handleModalDelete() {
  const id = document.getElementById('leadEditId').value;
  if (!id) return;
  const lead = leads.find(l => l.id === id || l._id === id);
  if (!lead) return;

  showConfirmModal('Delete Lead', `Are you sure you want to delete lead: ${lead.name}?`, async () => {
    const success = await deleteLead(id);
    if (success) {
      closeModal('addLeadModal');
    }
  });
}

function showReassignModal(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  const agents = getAssignableAgents();
  // Create a simple inline reassign using a prompt-like approach but in-modal
  const html = `
    <div class="p-6 border-b border-surface-800 flex items-center justify-between">
      <h3 class="font-display font-bold text-lg text-white">Reassign Lead</h3>
      <button class="btn-ghost rounded-lg" onclick="closeModal('leadDetailModal')"><i class="fas fa-times"></i></button>
    </div>
    <div class="p-6">
      <p class="text-white mb-1 font-medium">${lead.name}</p>
      <p class="text-sm text-surface-400 mb-4">Currently assigned to: ${getUser(lead.assigned_agent_id)?.name || 'Unassigned'}</p>
      <label class="block text-sm text-surface-400 mb-1.5">Reassign to:</label>
      <select class="form-input mb-4" id="reassignSelect">
        ${agents.map(a => `<option value="${a.id}" ${a.id === lead.assigned_agent_id ? 'selected' : ''}>${a.name} (${getTeam(a.team_id)?.name})</option>`).join('')}
      </select>
      <div class="flex justify-end gap-2">
        <button class="btn btn-secondary" onclick="closeModal('leadDetailModal')">Cancel</button>
        <button class="btn btn-primary" onclick="reassignLead('${leadId}', document.getElementById('reassignSelect').value); closeModal('leadDetailModal')">Reassign</button>
      </div>
    </div>
  `;
  document.getElementById('leadDetailContent').innerHTML = html;
  openModal('leadDetailModal');
}

