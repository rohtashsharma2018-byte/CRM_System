import fs from 'fs';

let content = fs.readFileSync('js/utils.js', 'utf8');

const regex = /const \[\s*leadsData, usersData, teamsData, loanTypesData, sourcesData, distRulesData,\s*allocHistoryData, callsData, loanLabelsData, companyProfileData,\s*leadStatusesData, leadStatusLabelsData, leadPrioritiesData, leadPriorityLabelsData,\s*targetsData\s*\] = await Promise.all\(\[[\s\S]*?\]\);/g;

const replacement = `const [
      leadsData, dashboardData, usersData, teamsData, loanTypesData, sourcesData, distRulesData,
      allocHistoryData, callsData, loanLabelsData, companyProfileData,
      leadStatusesData, leadStatusLabelsData, leadPrioritiesData, leadPriorityLabelsData,
      targetsData
    ] = await Promise.all([
      fetchAPI('/leads?page=1&limit=50'),
      fetchAPI('/dashboard').catch(() => ({})),
      fetchAPI('/users'),
      fetchAPI('/teams'),
      fetchAPI('/settings/loan_types'),
      fetchAPI('/settings/sources'),
      fetchAPI('/settings/distribution_rules'),
      fetchAPI('/settings/allocation_history').catch(() => []),
      fetchAPI('/calls').catch(() => []),
      fetchAPI('/settings/loan_labels').catch(() => ({})),
      fetchAPI('/settings/company_profile').catch(() => ({})),
      fetchAPI('/settings/lead_statuses').catch(() => []),
      fetchAPI('/settings/lead_status_labels').catch(() => ({})),
      fetchAPI('/settings/lead_priorities').catch(() => []),
      fetchAPI('/settings/lead_priority_labels').catch(() => ({})),
      fetchAPI('/settings/targets').catch(() => ({}))
    ]);
    
    APP.dashboardStats = dashboardData || {};`;

content = content.replace(regex, replacement);
fs.writeFileSync('js/utils.js', content);
