// ========== NOTIFICATIONS ==========
function generateNotifications() {
  const list = [];
  const currentUser = getUser(APP.currentUserId);
  const currentRole = APP.currentRole;
  
  // 1. Lead assignments
  if (Array.isArray(allocationHistory)) {
    allocationHistory.forEach(al => {
      const isToMe = al.to_user_id === APP.currentUserId;
      const lead = leads.find(l => l.id === al.lead_id || l._id === al.lead_id);
      if (lead) {
        let shouldNotify = false;
        if (isToMe) {
          shouldNotify = true;
        } else if (currentRole === 'admin') {
          shouldNotify = true;
        } else if (currentRole === 'tl' && currentUser) {
          const agent = getUser(al.to_user_id);
          const tlTeamId = currentUser.team_id && typeof currentUser.team_id === 'object' ? (currentUser.team_id._id || currentUser.team_id.id) : currentUser.team_id;
          const agentTeamId = agent && agent.team_id && typeof agent.team_id === 'object' ? (agent.team_id._id || agent.team_id.id) : (agent ? agent.team_id : null);
          if (agentTeamId === tlTeamId) {
            shouldNotify = true;
          }
        }

        if (shouldNotify) {
          list.push({
            id: 'notif_alloc_' + al.id,
            type: 'lead_assigned',
            message: isToMe 
              ? `New lead assigned to you: <strong>${lead.name}</strong> (${LOAN_LABELS[lead.loan_type] || lead.loan_type})`
              : `Lead assigned to ${getUser(al.to_user_id)?.name || 'Agent'}: <strong>${lead.name}</strong>`,
            time: al.created_at,
            read: false
          });
        }
      }
    });
  }

  // 2. Follow-ups
  if (Array.isArray(callLogs)) {
    callLogs.forEach(c => {
      if (c.follow_up_at) {
        const followUpDate = new Date(c.follow_up_at);
        const today = new Date();
        const isToday = followUpDate.toDateString() === today.toDateString();
        
        if (isToday) {
          const lead = leads.find(l => l.id === c.lead_id || l._id === c.lead_id);
          if (lead) {
            const isMyLead = lead.assigned_agent_id === APP.currentUserId;
            let shouldNotify = false;
            
            if (isMyLead) {
              shouldNotify = true;
            } else if (currentRole === 'admin') {
              shouldNotify = true;
            } else if (currentRole === 'tl' && currentUser) {
              const agent = getUser(lead.assigned_agent_id);
              const tlTeamId = currentUser.team_id && typeof currentUser.team_id === 'object' ? (currentUser.team_id._id || currentUser.team_id.id) : currentUser.team_id;
              const agentTeamId = agent && agent.team_id && typeof agent.team_id === 'object' ? (agent.team_id._id || agent.team_id.id) : (agent ? agent.team_id : null);
              if (agentTeamId === tlTeamId) {
                shouldNotify = true;
              }
            }

            if (shouldNotify) {
              list.push({
                id: 'notif_follow_' + c._id + '_' + c.follow_up_at,
                type: 'followup',
                message: isMyLead
                  ? `Follow-up due today with <strong>${lead.name}</strong>`
                  : `Follow-up due for ${getUser(lead.assigned_agent_id)?.name || 'Agent'} with <strong>${lead.name}</strong>`,
                time: c.follow_up_at,
                read: false
              });
            }
          }
        }
      }
    });
  }

  // 3. Conversion / Won
  if (Array.isArray(leads)) {
    leads.forEach(l => {
      if (l.status === 'disbursed') {
        const isMyLead = l.assigned_agent_id === APP.currentUserId;
        let shouldNotify = false;
        
        if (isMyLead) {
          shouldNotify = true;
        } else if (currentRole === 'admin') {
          shouldNotify = true;
        } else if (currentRole === 'tl' && currentUser) {
          const agent = getUser(l.assigned_agent_id);
          const tlTeamId = currentUser.team_id && typeof currentUser.team_id === 'object' ? (currentUser.team_id._id || currentUser.team_id.id) : currentUser.team_id;
          const agentTeamId = agent && agent.team_id && typeof agent.team_id === 'object' ? (agent.team_id._id || agent.team_id.id) : (agent ? agent.team_id : null);
          if (agentTeamId === tlTeamId) {
            shouldNotify = true;
          }
        }

        if (shouldNotify) {
          list.push({
            id: 'notif_conv_' + l.id,
            type: 'conversion',
            message: `Lead successfully disbursed: <strong>${l.name}</strong> (Amount: ₹${l.amount_requested?.toLocaleString() || l.amount_requested})`,
            time: l.updated_at || l.created_at,
            read: false
          });
        }
      }
    });
  }

  // 4. Aging leads
  const agingDays = parseInt(DISTRIBUTION_RULES.aging_days) || 3;
  if (Array.isArray(leads)) {
    leads.forEach(l => {
      if (['new', 'contacted'].includes(l.status)) {
        const updatedDate = new Date(l.updated_at || l.created_at);
        const diffDays = Math.floor((new Date() - updatedDate) / (1000 * 60 * 60 * 24));
        if (diffDays >= agingDays) {
          const isMyLead = l.assigned_agent_id === APP.currentUserId;
          let shouldNotify = false;
          
          if (isMyLead) {
            shouldNotify = true;
          } else if (currentRole === 'admin') {
            shouldNotify = true;
          } else if (currentRole === 'tl' && currentUser) {
            const agent = getUser(l.assigned_agent_id);
            const tlTeamId = currentUser.team_id && typeof currentUser.team_id === 'object' ? (currentUser.team_id._id || currentUser.team_id.id) : currentUser.team_id;
            const agentTeamId = agent && agent.team_id && typeof agent.team_id === 'object' ? (agent.team_id._id || agent.team_id.id) : (agent ? agent.team_id : null);
            if (agentTeamId === tlTeamId) {
              shouldNotify = true;
            }
          }

          if (shouldNotify) {
            list.push({
              id: 'notif_aging_' + l.id,
              type: 'aging',
              message: `Lead aging alert: <strong>${l.name}</strong> has been inactive for ${diffDays} days`,
              time: l.updated_at || l.created_at,
              read: false
            });
          }
        }
      }
    });
  }

  // Sort by time descending
  list.sort((a, b) => new Date(b.time) - new Date(a.time));

  // Retrieve read notifications list from localStorage
  const readNotifs = JSON.parse(localStorage.getItem('read_notifications') || '[]');
  list.forEach(n => {
    if (readNotifs.includes(n.id)) {
      n.read = true;
    }
  });

  NOTIFICATIONS = list.slice(0, 50); // limit to top 50
  
  // Update badge dot
  const hasUnread = NOTIFICATIONS.some(n => !n.read);
  const dot = document.getElementById('notifDot');
  if (dot) {
    if (hasUnread) {
      dot.classList.remove('hidden');
    } else {
      dot.classList.add('hidden');
    }
  }
}

function renderNotifications() {
  const list = document.getElementById('notifList');
  if (!list) return;
  if (NOTIFICATIONS.length === 0) {
    list.innerHTML = '<p class="text-surface-500 text-center py-8">No notifications</p>';
    return;
  }
  list.innerHTML = NOTIFICATIONS.map(n => {
    const iconMap = { lead_assigned: 'user-plus text-brand-400', followup: 'clock text-amber-400', aging: 'exclamation-triangle text-rose-400', conversion: 'trophy text-brand-400' };
    const icon = iconMap[n.type] || 'bell text-surface-400';
    return `
      <div class="flex items-start gap-3 py-3 border-b border-surface-800 last:border-0 ${n.read ? 'opacity-60' : ''}">
        <div class="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center flex-shrink-0 mt-0.5"><i class="fas fa-${icon} text-xs"></i></div>
        <div class="flex-1">
          <p class="text-sm ${n.read ? 'text-surface-400' : 'text-white'}">${n.message}</p>
          <p class="text-xs text-surface-500 mt-0.5">${timeAgo(n.time)}</p>
        </div>
        ${!n.read ? '<div class="w-2 h-2 rounded-full bg-brand-400 mt-2 flex-shrink-0"></div>' : ''}
      </div>
    `;
  }).join('');
}

async function saveTargets() {
  const inputs = document.querySelectorAll('.target-input');
  const newTargets = { teams: {}, agents: {} };
  
  inputs.forEach(input => {
    const type = input.dataset.type;
    const id = input.dataset.id;
    const val = input.value ? Number(input.value) : null;
    if (val !== null) {
      if (type === 'team') newTargets.teams[id] = val;
      if (type === 'agent') newTargets.agents[id] = val;
    }
  });

  TARGETS = newTargets;
  toast('Saving targets...', 'info');
  try {
    await fetchAPI('/settings/targets', {
      method: 'POST',
      body: JSON.stringify({ value: TARGETS })
    });
    toast('Targets saved successfully');
    renderPage();
  } catch (err) {
    console.error(err);
    toast('Failed to save targets', 'error');
  }
}

