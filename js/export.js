// ========== EXPORT ==========
function downloadCSVTemplate() {
  const templateCSV = `Name,Phone,Email,City,Loan Type,Amount,Source,Status
Aarav Sharma,9876543210,aarav.sharma@email.com,Mumbai,Home Loan,5000000,Facebook,New
Priya Patel,9123456789,priya.patel@email.com,Delhi,Personal Loan,200000,Website,New
Rohan Gupta,9988776655,rohan.gupta@email.com,Bangalore,Car Loan,800000,Referral,New
Sneha Singh,9876501234,sneha.singh@email.com,Hyderabad,Business Loan,1500000,Website,New
Amit Verma,9112233445,amit.verma@email.com,Chennai,Home Loan,3000000,Google,New
Megha Reddy,9001122334,megha.reddy@email.com,Pune,Personal Loan,500000,Facebook,New
Vikram Iyer,9887766554,vikram.iyer@email.com,Kolkata,Education Loan,1000000,Website,New
Anjali Das,9776655443,anjali.das@email.com,Ahmedabad,Car Loan,700000,Google,New
Rahul Kumar,9665544332,rahul.kumar@email.com,Jaipur,Personal Loan,300000,Referral,New
Sonia Rao,9554433221,sonia.rao@email.com,Lucknow,Home Loan,4000000,Facebook,New`;

  const blob = new Blob([templateCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'leads_template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportLeadsCSV(selectedOnly = false) {
  const vl = selectedOnly ? leads.filter(l => selectedLeadIds.includes(l.id || l._id)) : getFilteredLeads();
  let csv = 'Name,Phone,Email,City,Loan Type,Amount,Source,Status,Agent,Aging,Assigned At,Created At\n';
  vl.forEach(l => {
    const escapedName = (l.name || '').replace(/"/g, '""');
    const escapedPhone = (l.phone || '').replace(/"/g, '""');
    const escapedEmail = (l.email || '').replace(/"/g, '""');
    const escapedCity = (l.city || '').replace(/"/g, '""');
    const escapedLoanType = (LOAN_LABELS[l.loan_type] || l.loan_type || '').replace(/"/g, '""');
    const escapedAmount = l.amount_requested || 0;
    const escapedSource = (l.source || '').replace(/"/g, '""');
    const escapedStatus = (STATUS_LABELS[l.status] || l.status || '').replace(/"/g, '""');
    const escapedAgentName = (getUser(l.assigned_agent_id)?.name || '').replace(/"/g, '""');
    const aging = getAging(l.assigned_at);
    const assignedAt = formatDate(l.assigned_at);
    const createdAt = formatDate(l.created_at);
    
    csv += `"${escapedName}","${escapedPhone}","${escapedEmail}","${escapedCity}","${escapedLoanType}","${escapedAmount}","${escapedSource}","${escapedStatus}","${escapedAgentName}","${aging}","${assignedAt}","${createdAt}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'paisaneed_leads_export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('CSV exported successfully');
}

