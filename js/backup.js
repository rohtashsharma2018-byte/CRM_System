// ========== JSON BACKUP & RESTORE ==========
let restoreData = null;

async function backupDataJSON() {
  const startDate = document.getElementById('backupStartDate').value;
  const endDate = document.getElementById('backupEndDate').value;
  let url = '/backup';
  const params = [];
  if (startDate) params.push(`start_date=${startDate}`);
  if (endDate) params.push(`end_date=${endDate}`);
  if (params.length > 0) url += '?' + params.join('&');

  try {
    const data = await fetchAPI(url);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `paisaneed_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast('JSON Backup exported successfully');
  } catch (err) {
    console.error('Backup failed:', err);
  }
}

function handleJSONRestore(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      restoreData = JSON.parse(event.target.result);
      document.getElementById('restoreFileInfo').textContent = `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      document.getElementById('restoreConfirmBtn').classList.remove('hidden');
    } catch (err) {
      toast('Invalid JSON file', 'error');
      restoreData = null;
      document.getElementById('restoreFileInfo').textContent = '';
      document.getElementById('restoreConfirmBtn').classList.add('hidden');
    }
  };
  reader.readAsText(file);
}

async function confirmJSONRestore() {
  if (!restoreData) return;
  if (!confirm('WARNING: This will replace your existing data with the content of the backup. Are you sure you want to proceed?')) return;

  const btn = document.getElementById('restoreConfirmBtn');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Restoring...';

  try {
    await fetchAPI('/restore', {
      method: 'POST',
      body: JSON.stringify(restoreData)
    });
    toast('Data restored successfully! The app will reload.', 'success');
    setTimeout(() => location.reload(), 2000);
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

