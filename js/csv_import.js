// ========== CSV IMPORT ==========
let importData = [];

function parseCSVRow(rowText) {
  const result = [];
  let insideQuote = false;
  let currentCell = '';
  for (let i = 0; i < rowText.length; i++) {
    const char = rowText[i];
    if (char === '"') {
      insideQuote = !insideQuote;
    } else if (char === ',' && !insideQuote) {
      result.push(currentCell.replace(/^["']|["']$/g, '').trim());
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  result.push(currentCell.replace(/^["']|["']$/g, '').trim());
  return result;
}

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  const zone = document.getElementById('csvDropZone');
  if (zone) {
    zone.classList.remove('border-surface-700');
    zone.classList.add('border-brand-500', 'bg-brand-600/5');
  }
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  const zone = document.getElementById('csvDropZone');
  if (zone) {
    zone.classList.remove('border-brand-500', 'bg-brand-600/5');
    zone.classList.add('border-surface-700');
  }
}

function handleCSVDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  const zone = document.getElementById('csvDropZone');
  if (zone) {
    zone.classList.remove('border-brand-500', 'bg-brand-600/5');
    zone.classList.add('border-surface-700');
  }
  
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    if (file.name.toLowerCase().endsWith('.csv')) {
      const input = document.getElementById('csvInput');
      try {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
      } catch (err) {
        console.error('DataTransfer assignment failed:', err);
      }
      const mockEvent = { target: { files: [file] } };
      handleCSVImport(mockEvent);
    } else {
      toast('Please upload a valid CSV file', 'error');
    }
  }
}

function handleCSVImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const text = ev.target.result;
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) { toast('CSV file is empty or has no data rows', 'error'); return; }
    
    // Parse header row and validate
    const rawHeaders = parseCSVRow(lines[0]);
    const headers = rawHeaders.map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''));
    const required = ['name', 'phone'];
    const missing = required.filter(r => !headers.includes(r));
    if (missing.length > 0) {
      toast('Missing required columns: ' + missing.join(', '), 'error');
      return;
    }
    
    importData = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVRow(lines[i]);
      if (cols.length < 2) continue;
      const row = {};
      headers.forEach((h, idx) => { row[h] = cols[idx] || ''; });
      importData.push(row);
    }
    
    document.getElementById('importCount').textContent = importData.length;
    document.getElementById('importPreview').classList.remove('hidden');
    document.getElementById('importTable').innerHTML = `
      <table class="data-table">
        <thead><tr><th>Name</th><th>Phone</th><th>City</th><th>Email</th><th>Status</th><th>Loan Type</th><th>Amount</th><th>Source</th></tr></thead>
        <tbody>${importData.slice(0, 10).map(r => `<tr>
          <td class="text-white">${r.name || '—'}</td>
          <td>${r.phone || '—'}</td>
          <td>${r.city || '—'}</td>
          <td>${r.email || '—'}</td>
          <td>${r.status || '—'}</td>
          <td>${r.loantype || '—'}</td>
          <td>${r.amount ? formatCurrency(r.amount) : '—'}</td>
          <td>${r.source || '—'}</td>
        </tr>`).join('')}${importData.length > 10 ? `<tr><td colspan="8" class="text-center text-surface-500">...and ${importData.length - 10} more</td></tr>` : ''}</tbody>
      </table>
    `;
  };
  reader.readAsText(file);
}

async function confirmImport() {
  if (importData.length === 0) return;
  performImport(false);
}

async function performImport(confirm) {
  try {
    const res = await fetchAPI('/leads/import', {
      method: 'POST',
      body: JSON.stringify({ leads: importData, confirm })
    });

    if (res.status === 'duplicate_found') {
      const modal = document.getElementById('confirmModal');
      modal.querySelector('.p-6').innerHTML = `
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 rounded-full bg-amber-600/20 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-exclamation-triangle text-xl text-amber-400"></i>
          </div>
          <div>
            <h3 class="font-bold text-white text-lg">Duplicates Found</h3>
            <p class="text-surface-400 text-sm">${res.duplicatesCount} leads are already in the system. Would you like to import the ${res.newLeadsCount} new leads?</p>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button class="btn-ghost" onclick="closeModal('confirmModal')">Cancel</button>
          <button class="btn-primary bg-amber-600 hover:bg-amber-700" onclick="performImport(true); closeModal('confirmModal')">Import Only New</button>
        </div>
      `;
      openModal('confirmModal');
      return;
    }
    
    toast(`${res.imported} leads imported successfully. ${res.failed} failed.`);
    if (res.errors && res.errors.length > 0) {
        const errorList = document.getElementById('importErrorsList');
        errorList.innerHTML = res.errors.map(err => `<p class="text-red-400">${err}</p>`).join('');
        openModal('importErrorsModal');
    }
    
    importData = [];
    closeModal('importModal');
    document.getElementById('importPreview').classList.add('hidden');
    const fileInput = document.getElementById('csvInput');
    if (fileInput) fileInput.value = '';
    renderPage();
    updateUserUI();
  } catch (err) {
    toast('Import failed: ' + err.message, 'error');
  }
}

