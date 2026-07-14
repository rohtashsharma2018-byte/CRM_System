import fs from 'fs';
let content = fs.readFileSync('js/leads.js', 'utf8');

const leadsCountRegex = /\$\{vl\.length\} leads found/g;
content = content.replace(leadsCountRegex, '${APP.totalLeads || vl.length} leads found');

const tableEndRegex = /<\/table>\s*<\/div>\s*<\/div>/;
const paginationHtml = `
          </table>
        </div>
        
        <div class="flex items-center justify-between p-4 border-t border-surface-800 bg-surface-900/30 rounded-b-xl">
          <div class="text-sm text-surface-400">
            Showing <span class="font-medium text-white">\${vl.length > 0 ? ((leadsFilter.page || 1) - 1) * (leadsFilter.limit || 50) + 1 : 0}</span> 
            to <span class="font-medium text-white">\${Math.min(((leadsFilter.page || 1) - 1) * (leadsFilter.limit || 50) + (leadsFilter.limit || 50), APP.totalLeads || vl.length)}</span> 
            of <span class="font-medium text-white">\${APP.totalLeads || vl.length}</span> results
          </div>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" onclick="changePage(-1)" \${(leadsFilter.page || 1) === 1 ? 'disabled' : ''}>
              <i class="fas fa-chevron-left"></i> Previous
            </button>
            <span class="flex items-center px-3 text-sm text-surface-300">
              Page \${leadsFilter.page || 1} of \${APP.totalPages || 1}
            </span>
            <button class="btn btn-secondary btn-sm" onclick="changePage(1)" \${(leadsFilter.page || 1) >= (APP.totalPages || 1) ? 'disabled' : ''}>
              Next <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
`;
content = content.replace(tableEndRegex, paginationHtml);

fs.writeFileSync('js/leads.js', content);
