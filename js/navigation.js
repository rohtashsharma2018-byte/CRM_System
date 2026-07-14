// ========== NAVIGATION ==========
function navigateTo(page) {
  const isAlreadyActive = APP.currentPage === page;
  APP.currentPage = page;
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.toggle('active', l.dataset.page === page));
  
  // Show/hide team submenu
  const submenu = document.getElementById('teamSubmenu');
  const chevron = document.getElementById('teamChevron');
  if (submenu) {
    if (page === 'team') {
      if (isAlreadyActive) {
        const isHidden = submenu.classList.contains('hidden');
        if (isHidden) {
          submenu.style.display = 'flex';
          submenu.classList.remove('hidden');
          if (chevron) chevron.style.transform = 'rotate(180deg)';
        } else {
          submenu.style.display = 'none';
          submenu.classList.add('hidden');
          if (chevron) chevron.style.transform = 'rotate(0deg)';
        }
      } else {
        submenu.style.display = 'flex';
        submenu.classList.remove('hidden');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
      }
    } else {
      submenu.style.display = 'none';
      submenu.classList.add('hidden');
      if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
  }

  renderPage();
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

function initSidebar() {
  const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  if (sidebar && mainContent) {
    if (isCollapsed && window.innerWidth > 1024) {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('expanded');
    } else {
      sidebar.classList.remove('collapsed');
      mainContent.classList.remove('expanded');
    }
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  if (sidebar && mainContent) {
    if (window.innerWidth <= 1024) {
      sidebar.classList.toggle('open');
      sidebar.classList.remove('collapsed');
      mainContent.classList.remove('expanded');
    } else {
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded');
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');
    }
  }
}

function toggleNotifications() {
  const panel = document.getElementById('notifPanel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    // Mark all as read when opened
    const readNotifs = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    NOTIFICATIONS.forEach(n => {
      if (!readNotifs.includes(n.id)) {
        readNotifs.push(n.id);
      }
    });
    localStorage.setItem('read_notifications', JSON.stringify(readNotifs));
    generateNotifications();
    renderNotifications();
  }
}

function showRoleSwitcher() { openModal('roleSwitcher'); }

function switchRole(role) {
  APP.currentRole = role;
  if (role === 'admin') { APP.currentUserId = 'u1'; }
  else if (role === 'tl') { APP.currentUserId = 'u2'; }
  else { APP.currentUserId = 'u4'; }
  updateUserUI();
  closeModal('roleSwitcher');
  navigateTo('dashboard');
  toast(`Switched to ${role === 'admin' ? 'Admin' : role === 'tl' ? 'Team Leader' : 'Agent'} view`, 'info');
}

function updateUserUI() {
  document.getElementById('userName').textContent = APP.userName || 'User';
  document.getElementById('userRole').textContent = APP.currentRole === 'tl' ? 'Team Leader' : APP.currentRole === 'agent' ? 'Agent' : 'Admin';
  document.getElementById('userAvatar').textContent = (APP.userName || 'U').charAt(0);
  // Show/hide management nav
  const isManager = APP.currentRole === 'admin' || APP.currentRole === 'tl';
  document.getElementById('navTeam').style.display = isManager ? 'flex' : 'none';
  document.getElementById('navAllocations').style.display = isManager ? 'flex' : 'none';
  document.getElementById('navSettings').style.display = APP.currentRole === 'admin' ? 'flex' : 'none';
  document.getElementById('manageLabel').style.display = isManager ? 'block' : 'none';
  document.getElementById('addLeadBtn').style.display = APP.currentRole === 'agent' ? 'none' : 'inline-flex';
  
  // Keep team submenu in sync
  const submenu = document.getElementById('teamSubmenu');
  const chevron = document.getElementById('teamChevron');
  if (submenu) {
    if (isManager && APP.currentPage === 'team') {
      submenu.style.display = 'flex';
      submenu.classList.remove('hidden');
      if (chevron) chevron.style.transform = 'rotate(180deg)';
    } else {
      submenu.style.display = 'none';
      submenu.classList.add('hidden');
      if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
  }

  // Update calling count
  const myLeads = getVisibleLeads().filter(l => l.status !== 'disbursed' && l.status !== 'rejected' && l.status !== 'dead' && l.status !== 'not_interested');
  document.getElementById('callingCount').textContent = myLeads.length;

  // Generate real-time notifications based on loaded data
  generateNotifications();
}

function handleGlobalSearch(q) {
  APP.searchQuery = q.toLowerCase();
  if (APP.currentPage === 'leads') renderPage();
}

