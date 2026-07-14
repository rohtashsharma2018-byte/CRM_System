// ========== INIT ==========
function init() {
  initSidebar();
  updateUserUI();
  renderPage();
  // Keyboard shortcut
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
      document.getElementById('notifPanel').classList.add('hidden');
    }
  });

  // Drag and drop setup for CSV import
  const dropZone = document.getElementById('csvDropZone');
  if (dropZone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('border-brand-500', 'bg-brand-600/10');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('border-brand-500', 'bg-brand-600/10');
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        const fileInput = document.getElementById('csvInput');
        if (fileInput) {
          fileInput.files = files;
          const event = { target: { files: files } };
          handleCSVImport(event);
        }
      }
    }, false);
  }
}

initTheme();
init();
