// ========== SETTINGS ==========
function renderSettings() {
  return `
    <div class="fade-in">
      <h2 class="font-display font-bold text-2xl text-white mb-6">Settings</h2>
      
      <!-- Tab Navigation -->
      <div class="flex border-b border-surface-800 mb-6 gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button onclick="changeSettingsTab('general')" class="px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${APP.activeSettingsTab === 'general' ? 'border-brand-500 text-brand-400 font-semibold' : 'border-transparent text-surface-400 hover:text-white'} flex items-center gap-2 whitespace-nowrap">
          <i class="fas fa-cog"></i> General
        </button>
        <button onclick="changeSettingsTab('leads')" class="px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${APP.activeSettingsTab === 'leads' ? 'border-brand-500 text-brand-400 font-semibold' : 'border-transparent text-surface-400 hover:text-white'} flex items-center gap-2 whitespace-nowrap">
          <i class="fas fa-filter"></i> Leads Config
        </button>
        <button onclick="changeSettingsTab('teams')" class="px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${APP.activeSettingsTab === 'teams' ? 'border-brand-500 text-brand-400 font-semibold' : 'border-transparent text-surface-400 hover:text-white'} flex items-center gap-2 whitespace-nowrap">
          <i class="fas fa-users"></i> Teams
        </button>
        <button onclick="changeSettingsTab('system')" class="px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${APP.activeSettingsTab === 'system' ? 'border-brand-500 text-brand-400 font-semibold' : 'border-transparent text-surface-400 hover:text-white'} flex items-center gap-2 whitespace-nowrap">
          <i class="fas fa-database"></i> Automation & Backup
        </button>
        <button onclick="changeSettingsTab('targets')" class="px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${APP.activeSettingsTab === 'targets' ? 'border-brand-500 text-brand-400 font-semibold' : 'border-transparent text-surface-400 hover:text-white'} flex items-center gap-2 whitespace-nowrap">
          <i class="fas fa-bullseye"></i> Targets
        </button>
      </div>

      <div class="space-y-4 max-w-2xl">
        ${APP.activeSettingsTab === 'general' ? `
          <div class="card">
            <h3 class="font-display font-semibold text-white mb-4">Appearance</h3>
            <div class="flex items-center gap-4">
              <button class="flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${APP.theme === 'dark' ? 'border-brand-500 bg-brand-500/10' : 'border-surface-800 hover:border-surface-700'}" onclick="setTheme('dark')">
                <div class="w-12 h-12 rounded-lg bg-surface-900 flex items-center justify-center text-white">
                  <i class="fas fa-moon"></i>
                </div>
                <span class="font-medium ${APP.theme === 'dark' ? 'text-brand-400' : 'text-surface-400'}">Dark Mode</span>
              </button>
              <button class="flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${APP.theme === 'light' ? 'border-brand-500 bg-brand-500/10' : 'border-surface-800 hover:border-surface-700'}" onclick="setTheme('light')">
                <div class="w-12 h-12 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-surface-900">
                  <i class="fas fa-sun"></i>
                </div>
                <span class="font-medium ${APP.theme === 'light' ? 'text-brand-400' : 'text-surface-400'}">Light Mode</span>
              </button>
            </div>
          </div>

          <div class="card">
            <h3 class="font-display font-semibold text-white mb-4">Company Profile</h3>
            <form onsubmit="handleCompanyProfileSubmit(event)" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-surface-400 mb-1.5">Company Name *</label>
                  <input type="text" class="form-input" id="cp_name" value="${COMPANY_PROFILE.name}" required placeholder="e.g. Paisaneed CRM">
                </div>
                <div>
                  <label class="block text-sm font-medium text-surface-400 mb-1.5">Contact Person</label>
                  <input type="text" class="form-input" id="cp_contact_person" value="${COMPANY_PROFILE.contact_person || ''}" placeholder="e.g. John Doe">
                </div>
                <div>
                  <label class="block text-sm font-medium text-surface-400 mb-1.5">Email *</label>
                  <input type="email" class="form-input" id="cp_email" value="${COMPANY_PROFILE.email}" required placeholder="support@company.com">
                </div>
                <div>
                  <label class="block text-sm font-medium text-surface-400 mb-1.5">Mobile *</label>
                  <input type="text" class="form-input" id="cp_mobile" value="${COMPANY_PROFILE.mobile}" required placeholder="+91 98765 43210">
                </div>
                <div>
                  <label class="block text-sm font-medium text-surface-400 mb-1.5">Website</label>
                  <input type="text" class="form-input" id="cp_website" value="${COMPANY_PROFILE.website}" placeholder="www.company.com">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-surface-400 mb-1.5">Address</label>
                <textarea class="form-input min-h-[80px]" id="cp_address" placeholder="Company address...">${COMPANY_PROFILE.address}</textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-surface-400 mb-1.5">Other Information</label>
                <textarea class="form-input min-h-[80px]" id="cp_other" placeholder="GSTIN, Tax ID, etc...">${COMPANY_PROFILE.other}</textarea>
              </div>
              <div class="flex justify-end">
                <button type="submit" class="btn btn-primary" id="saveCompanyProfileBtn">Save Profile</button>
              </div>
            </form>
          </div>
        ` : ''}

        ${APP.activeSettingsTab === 'leads' ? `
          <div class="card">
            <h3 class="font-display font-semibold text-white mb-4">Lead Statuses</h3>
            <div class="space-y-2 max-h-60 overflow-y-auto">
              ${STATUSES.map(s => `
                <div class="flex items-center justify-between py-2 border-b border-surface-800 last:border-0">
                  <div class="flex items-center gap-3">
                    <i class="fas fa-grip-vertical text-surface-600"></i>
                    <span class="text-white">${STATUS_LABELS[s] || s} <span class="text-xs text-surface-500">(${s})</span></span>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn-ghost btn-sm text-xs" onclick="showEditLeadStatusModal('${s}')"><i class="fas fa-edit"></i></button>
                    ${STATUSES.length > 1 ? `<button class="btn-ghost btn-sm text-xs text-rose-400" onclick="deleteLeadStatus('${s}')"><i class="fas fa-trash"></i></button>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
            <button class="btn btn-secondary btn-sm mt-3" onclick="showAddLeadStatusModal()"><i class="fas fa-plus"></i> Add Lead Status</button>
          </div>

          <div class="card">
            <h3 class="font-display font-semibold text-white mb-4">Lead Priorities</h3>
            <div class="space-y-2">
              ${PRIORITIES.map(p => `
                <div class="flex items-center justify-between py-2 border-b border-surface-800 last:border-0">
                  <div class="flex items-center gap-3">
                    <i class="fas fa-grip-vertical text-surface-600"></i>
                    <span class="text-white">${PRIORITY_LABELS[p] || p} <span class="text-xs text-surface-500">(${p})</span></span>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn-ghost btn-sm text-xs" onclick="showEditLeadPriorityModal('${p}')"><i class="fas fa-edit"></i></button>
                    ${PRIORITIES.length > 1 ? `<button class="btn-ghost btn-sm text-xs text-rose-400" onclick="deleteLeadPriority('${p}')"><i class="fas fa-trash"></i></button>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
            <button class="btn btn-secondary btn-sm mt-3" onclick="showAddLeadPriorityModal()"><i class="fas fa-plus"></i> Add Lead Priority</button>
          </div>

          <div class="card">
            <h3 class="font-display font-semibold text-white mb-4">Lead Sources</h3>
            <div class="flex flex-wrap gap-2">
              ${SOURCES.map(s => `
                <div class="flex items-center gap-1.5 px-3 py-1.5 bg-surface-800 rounded-full text-sm text-surface-300">
                  <span>${s.charAt(0).toUpperCase() + s.slice(1)}</span>
                  <button class="text-xs text-surface-500 hover:text-rose-400 ml-1 focus:outline-none" onclick="deleteSource('${s}')" title="Delete Source"><i class="fas fa-times"></i></button>
                </div>
              `).join('')}
            </div>
            <button class="btn btn-secondary btn-sm mt-3" onclick="showAddSourceModal()"><i class="fas fa-plus"></i> Add Source</button>
          </div>

          <div class="card">
            <h3 class="font-display font-semibold text-white mb-4">Loan Types</h3>
            <div class="space-y-2">
              ${LOAN_TYPES.map((lt, i) => `
                <div class="flex items-center justify-between py-2 border-b border-surface-800 last:border-0">
                  <div class="flex items-center gap-3">
                    <i class="fas fa-grip-vertical text-surface-600"></i>
                    <span class="text-white">${LOAN_LABELS[lt] || lt}</span>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn-ghost btn-sm text-xs" onclick="showEditLoanTypeModal('${lt}')"><i class="fas fa-edit"></i></button>
                    ${LOAN_TYPES.length > 1 ? `<button class="btn-ghost btn-sm text-xs text-rose-400" onclick="deleteLoanType('${lt}')"><i class="fas fa-trash"></i></button>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
            <button class="btn btn-secondary btn-sm mt-3" onclick="showAddLoanTypeModal()"><i class="fas fa-plus"></i> Add Loan Type</button>
          </div>
        ` : ''}

        ${APP.activeSettingsTab === 'teams' ? `
          <div class="card">
            <h3 class="font-display font-semibold text-white mb-4">Teams</h3>
            <div class="space-y-2">
              ${TEAMS.map(t => {
                 const teamMembers = USERS.filter(u => {
                   const uTid = u.team_id && typeof u.team_id === 'object' ? (u.team_id._id || u.team_id.id) : u.team_id;
                   return uTid === t.id;
                 });

                 return `
                   <div class="flex items-center justify-between py-3 border-b border-surface-800 last:border-0">
                     <div class="flex items-center gap-3">
                       <div class="w-8 h-8 rounded bg-surface-800 flex items-center justify-center text-surface-400">
                         <i class="fas fa-users text-sm"></i>
                       </div>
                       <div>
                         <div class="flex items-center gap-2">
                           <span class="font-medium text-white">${t.name}</span>
                           <span class="text-xs text-surface-500">Leader: ${getUser(t.leader_id)?.name || 'Unassigned'}</span>
                         </div>
                         <div class="flex items-center gap-3 mt-1 text-[11px] text-surface-400">
                           <span>Members: <strong class="text-white">${teamMembers.length}</strong></span>
                         </div>
                       </div>
                     </div>
                     <div class="flex gap-2">
                       <button class="btn-ghost btn-sm text-xs" onclick="showEditTeamModal('${t.id}')" title="Edit Team"><i class="fas fa-edit"></i></button>
                       ${TEAMS.length > 1 ? `<button class="btn-ghost btn-sm text-xs text-rose-400" onclick="deleteTeam('${t.id}')" title="Delete Team"><i class="fas fa-trash"></i></button>` : ''}
                     </div>
                   </div>
                 `;
              }).join('')}
            </div>
            <button class="btn btn-secondary btn-sm mt-3" onclick="showAddTeamModal()"><i class="fas fa-plus"></i> Add Team Name</button>
          </div>
        ` : ''}

        ${APP.activeSettingsTab === 'targets' ? `
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-display font-semibold text-white">Monthly Disbursed Amount Targets</h3>
              <button class="btn btn-primary text-sm py-1.5" onclick="saveTargets()">Save Targets</button>
            </div>
            
            <div class="space-y-6">
              <div>
                <h4 class="text-sm font-semibold text-surface-300 mb-3 border-b border-surface-800 pb-2">Team Targets</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${TEAMS.map(t => `
                    <div>
                      <label class="block text-xs font-medium text-surface-400 mb-1">${t.name}</label>
                      <div class="relative">
                        <span class="absolute left-3 top-2 text-surface-500">₹</span>
                        <input type="number" class="form-input pl-7 target-input" data-type="team" data-id="${t.id}" value="${TARGETS.teams[t.id] || ''}" placeholder="e.g. 5000000">
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div>
                <h4 class="text-sm font-semibold text-surface-300 mb-3 border-b border-surface-800 pb-2">Agent Targets</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  ${USERS.filter(u => u.role === 'agent' && u.active).map(a => `
                    <div>
                      <label class="block text-xs font-medium text-surface-400 mb-1">${a.name} <span class="text-surface-600 text-[10px]">(${TEAMS.find(t=>t.id===a.team_id)?.name || 'No Team'})</span></label>
                      <div class="relative">
                        <span class="absolute left-3 top-2 text-surface-500">₹</span>
                        <input type="number" class="form-input pl-7 target-input" data-type="agent" data-id="${a.id}" value="${TARGETS.agents[a.id] || ''}" placeholder="e.g. 1000000">
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        ` : ''}
        ${APP.activeSettingsTab === 'system' ? `
          <div class="card">
            <h3 class="font-display font-semibold text-white mb-4">Distribution Rules</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-surface-400 mb-1.5">Allocation Method</label>
                <select id="settingAllocationMethod" class="form-input w-auto">
                  <option value="round_robin" ${DISTRIBUTION_RULES.method === 'round_robin' ? 'selected' : ''}>Round Robin</option>
                  <option value="weighted" ${DISTRIBUTION_RULES.method === 'weighted' ? 'selected' : ''}>Weighted (by conversion rate)</option>
                  <option value="least_load" ${DISTRIBUTION_RULES.method === 'least_load' ? 'selected' : ''}>Least Load First</option>
                  <option value="manual" ${DISTRIBUTION_RULES.method === 'manual' ? 'selected' : ''}>Manual Only</option>
                </select>
              </div>
              <div>
                <label class="block text-sm text-surface-400 mb-1.5">Max Active Leads per Agent</label>
                <input type="number" id="settingMaxLeads" class="form-input w-auto" value="${DISTRIBUTION_RULES.max_leads}" min="1">
              </div>
              <div>
                <label class="block text-sm text-surface-400 mb-1.5">Lead Aging Alert (days)</label>
                <input type="number" id="settingLeadAging" class="form-input w-auto" value="${DISTRIBUTION_RULES.aging_days}" min="1">
              </div>
            </div>
            <button class="btn btn-primary btn-sm mt-4" id="saveSettingsBtn" onclick="saveDistributionSettings()"><i class="fas fa-check"></i> Save Settings</button>
          </div>

          <div class="card">
            <h3 class="font-display font-semibold text-white mb-4">Backup & Restore</h3>
            <div class="space-y-6">
              <div>
                <p class="text-sm text-surface-400 mb-3">Download a complete JSON backup of all application data (Leads, Users, Teams, Settings, Call Logs).</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label class="block text-[11px] text-surface-500 uppercase tracking-wider mb-1">Start Date (Optional)</label>
                    <input type="date" id="backupStartDate" class="form-input text-sm">
                  </div>
                  <div>
                    <label class="block text-[11px] text-surface-500 uppercase tracking-wider mb-1">End Date (Optional)</label>
                    <input type="date" id="backupEndDate" class="form-input text-sm">
                  </div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="backupDataJSON()">
                  <i class="fas fa-file-export"></i> Download JSON Backup
                </button>
              </div>
              
              <div class="pt-6 border-t border-surface-800">
                <h4 class="text-sm font-medium text-white mb-2">Restore from Backup</h4>
                <p class="text-xs text-surface-500 mb-3">Upload a previously downloaded JSON backup file. This will replace existing data.</p>
                <div class="flex items-center gap-3">
                  <input type="file" id="restoreInput" accept=".json" class="hidden" onchange="handleJSONRestore(event)">
                  <button class="btn btn-secondary btn-sm" onclick="document.getElementById('restoreInput').click()">
                    <i class="fas fa-file-import"></i> Select Backup File
                  </button>
                  <div id="restoreFileInfo" class="text-xs text-surface-400 italic"></div>
                </div>
                <button id="restoreConfirmBtn" class="btn btn-primary btn-sm mt-4 hidden" onclick="confirmJSONRestore()">
                  <i class="fas fa-upload"></i> Restore Data Now
                </button>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

async function saveDistributionSettings() {
  const method = document.getElementById('settingAllocationMethod').value;
  const max_leads = parseInt(document.getElementById('settingMaxLeads').value);
  const aging_days = parseInt(document.getElementById('settingLeadAging').value);
  
  const btn = document.getElementById('saveSettingsBtn');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  
  try {
    const newVal = { method, max_leads, aging_days };
    await fetchAPI('/settings/distribution_rules', {
      method: 'POST',
      body: JSON.stringify({ value: newVal })
    });
    DISTRIBUTION_RULES = newVal;
    toast('Distribution settings saved successfully');
  } catch (err) {
    // Error handled by fetchAPI toast
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

