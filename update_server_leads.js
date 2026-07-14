import fs from 'fs';

let content = fs.readFileSync('server.js', 'utf8');

// Replace GET /api/leads
const getLeadsRegex = /app\.get\('\/api\/leads',\s*authenticate,\s*async\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?\}\);/;
const newGetLeads = `app.get('/api/leads', authenticate, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'agent') {
      query.assigned_agent_id = req.user.id;
    } else if (req.user.role === 'tl' && req.user.team_id) {
      const agentsInTeam = await User.find({ team_id: req.user.team_id }).select('_id');
      const agentIds = agentsInTeam.map(a => a._id);
      query.assigned_agent_id = { $in: agentIds };
    }
    
    // Server-side filters
    if (req.query.search) {
      const q = new RegExp(req.query.search, 'i');
      query.$or = [{ name: q }, { phone: q }, { email: q }, { city: q }];
    }
    if (req.query.status) {
      query.status = { $in: req.query.status.split(',') };
    }
    if (req.query.loanType) {
      query.loan_type = { $in: req.query.loanType.split(',') };
    }
    if (req.query.source) {
      query.source = { $in: req.query.source.split(',') };
    }
    if (req.query.agent) {
      query.assigned_agent_id = { $in: req.query.agent.split(',') };
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Sort
    let sortField = req.query.sort || 'created_at';
    let sortDir = req.query.dir === 'asc' ? 1 : -1;
    let sortObj = {};
    sortObj[sortField] = sortDir;

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query).sort(sortObj).skip(skip).limit(limit);
    
    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      leads
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});`;

content = content.replace(getLeadsRegex, newGetLeads);

// Add GET /api/dashboard
const dashboardEndpoint = `
app.get('/api/dashboard', authenticate, async (req, res) => {
  try {
    let match = {};
    if (req.user.role === 'agent') {
      match.assigned_agent_id = req.user.id;
    } else if (req.user.role === 'tl' && req.user.team_id) {
      const agents = await User.find({ team_id: req.user.team_id }).select('_id');
      match.assigned_agent_id = { $in: agents.map(a => a._id.toString()) }; // Depending on how it's stored
    }
    
    const totalLeads = await Lead.countDocuments(match);
    const converted = await Lead.countDocuments({ ...match, status: 'disbursed' });
    const contacted = await Lead.countDocuments({ ...match, status: { $in: ['contacted','interested','documents_pending','login_done','disbursed'] } });
    const hotLeads = await Lead.countDocuments({ ...match, priority: 'hot', status: { $nin: ['disbursed','rejected','dead','not_interested'] } });
    
    // Pipeline aggregate
    const pipeline = await Lead.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 }, totalAmount: { $sum: "$amount_requested" } } }
    ]);
    
    // Source aggregate
    const sourceStats = await Lead.aggregate([
      { $match: match },
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]);

    // Amount total
    const amountTotalAgg = await Lead.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount_requested" } } }
    ]);
    
    res.json({
      totalLeads,
      converted,
      contacted,
      hotLeads,
      totalAmount: amountTotalAgg.length ? amountTotalAgg[0].total : 0,
      pipeline,
      sourceStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
`;
content = content.replace('// --- TEAMS ROUTES ---', dashboardEndpoint + '\n// --- TEAMS ROUTES ---');

fs.writeFileSync('server.js', content);
