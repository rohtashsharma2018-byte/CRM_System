// ========== DATA ==========
let TEAMS = [];
let USERS = [];
let LOAN_TYPES = [];
let LOAN_LABELS = { personal: 'Personal Loan', home: 'Home Loan', business: 'Business Loan', lap: 'Loan Against Property', credit_card: 'Credit Card' };
let STATUSES = ['new', 'contacted', 'interested', 'documents_pending', 'login_done', 'disbursed', 'rejected', 'not_interested', 'dead'];
let STATUS_LABELS = { new: 'New', contacted: 'Contacted', interested: 'Interested', documents_pending: 'Docs Pending', login_done: 'Login Done', disbursed: 'Disbursed', rejected: 'Rejected', not_interested: 'Not Interested', dead: 'Dead' };
let PRIORITIES = ['cold', 'warm', 'hot'];
let PRIORITY_LABELS = { cold: 'Cold', warm: 'Warm', hot: 'Hot' };
let SOURCES = [];

let leads = [];
let selectedLeadIds = [];
let callLogs = [];
let allocationHistory = [];
let NOTIFICATIONS = [];
let TARGETS = { teams: {}, agents: {} };
let DISTRIBUTION_RULES = { method: 'round_robin', max_leads: 15, aging_days: 3 };
let REPORTS_FILTER = { dateRange: 'all_time', teamId: 'all', agentId: 'all', startDate: '', endDate: '' };
let leadIdCounter = 1;
let callIdCounter = 1;
let allocIdCounter = 1;

let COMPANY_PROFILE = {
  name: '',
  contact_person: '',
  email: '',
  mobile: '',
  address: '',
  website: '',
  other: ''
};

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomPhone() { return '9' + Array.from({length:9}, () => randomInt(0,9)).join(''); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); }
function daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString(); }
function formatCurrency(n) { return Number(n).toLocaleString('en-IN'); }
function formatDate(iso) { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
function formatDateTime(iso) { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
function getAging(assignedAt) {
  if (!assignedAt) return '—';
  const start = new Date(assignedAt);
  const now = new Date();
  const diffTime = Math.max(0, now - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} Days`;
}
function timeAgo(iso) {
  if (!iso) return '—';
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s/60) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  return Math.floor(s/86400) + 'd ago';
}

