#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PAGES_DIR = join(__dirname, 'pages');
const CSS_PATH = '../css/theme.css';

function writePage(filename, html) {
  const path = join(PAGES_DIR, filename);
  writeFileSync(path, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${extractTitle(html)} | BlueSuite CRM</title>
  <link rel="stylesheet" href="${CSS_PATH}">
</head>
<body>
${html}
</body>
</html>
`);
  console.log(`  ✓ ${filename}`);
}

function extractTitle(html) {
  const m = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  return m ? m[1].trim() : 'Page';
}

function sidebar(activeLabel) {
  const items = [
    { icon: '📊', label: 'Dashboard', href: 'dashboard.html' },
    { icon: '👤', label: 'Contacts', href: 'contacts.html' },
    { icon: '🏢', label: 'Companies', href: 'companies.html' },
    { icon: '💰', label: 'Deals', href: 'deals.html' },
    { icon: '⭐', label: 'Leads', href: 'leads.html' },
    { icon: '📋', label: 'Tasks', href: 'tasks.html' },
    { icon: '📅', label: 'Calendar', href: 'calendar.html' },
    { icon: '📧', label: 'Campaigns', href: 'campaigns.html' },
    { icon: '📈', label: 'Reports', href: 'reports.html' },
    { icon: '⚙️', label: 'Settings', href: 'settings.html' },
  ];

  const navSections = [
    { label: 'Main Menu', items: items.slice(0, 7) },
    { label: 'Marketing', items: items.slice(7, 8) },
    { label: 'Analytics', items: items.slice(8, 9) },
    { label: 'System', items: items.slice(9, 10) },
  ];

  let navHtml = '';
  for (const section of navSections) {
    navHtml += `      <div class="nav-section">${section.label}</div>\n`;
    for (const item of section.items) {
      const active = item.label === activeLabel ? ' active' : '';
      navHtml += `      <a href="${item.href}" class="nav-item${active}">
        <span class="nav-icon">${item.icon}</span>
        ${item.label}
      </a>\n`;
    }
  }

  return `  <div class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">B</div>
      <span class="sidebar-brand">BlueSuite CRM</span>
    </div>
    <nav class="sidebar-nav">
${navHtml}    </nav>
    <div class="sidebar-footer">
      <div class="nav-item">
        <span class="nav-icon">🚪</span>
        Sign Out
      </div>
    </div>
  </div>`;
}

function topHeader() {
  return `  <header class="top-header">
    <button class="mobile-toggle" onclick="document.querySelector('.sidebar').classList.toggle('open')">☰</button>
    <div class="header-search">
      <span class="search-icon">🔍</span>
      <input type="text" placeholder="Search contacts, deals, tasks..." />
    </div>
    <div class="header-actions">
      <button class="header-btn">🔔<span class="dot"></span></button>
      <button class="header-btn">❓</button>
      <div class="avatar">RK</div>
    </div>
  </header>`;
}

function pageWrapper(title, subtitle, content, activeLabel = 'Dashboard') {
  return `${sidebar(activeLabel)}
  <div class="main-content">
    ${topHeader()}
    <div class="page-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">${title}</h1>
          ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ''}
        </div>
      </div>
      ${content}
    </div>
  </div>`;
}

function statsGrid(stats) {
  let html = '<div class="stats-grid">\n';
  for (const s of stats) {
    html += `      <div class="stat-card">
        <div class="stat-label">${s.label}</div>
        <div class="stat-value">${s.value}</div>
        <div class="stat-change ${s.trend}">${s.change}</div>
      </div>\n`;
  }
  return html + '    </div>';
}

function card(title, bodyHtml, footerHtml = '') {
  let h = `<div class="card">\n    <div class="card-header"><span class="card-title">${title}</span></div>\n    <div class="card-body">${bodyHtml}</div>\n`;
  if (footerHtml) h += `    <div class="card-footer">${footerHtml}</div>\n`;
  return h + '  </div>';
}

// ==================== PAGE GENERATORS ====================

function pageDashboard() {
  const s = statsGrid([
    { label: 'Total Contacts', value: '2,847', change: '+12.5% this month', trend: 'up' },
    { label: 'Active Deals', value: '₹84,62,000', change: '+8.2% this quarter', trend: 'up' },
    { label: 'Open Leads', value: '143', change: '-5.1% this week', trend: 'down' },
    { label: 'Tasks Due', value: '28', change: '+3 pending', trend: 'up' },
  ]);

  const recentActivity = `
    <div class="card" style="margin-top:24px">
      <div class="card-header"><span class="card-title">Recent Activity</span></div>
      <div class="card-body">
        <div class="activity-item">
          <div class="activity-icon">💰</div>
          <div class="activity-content"><strong>Deal Won:</strong> TechCorp Solutions — ₹12,50,000 closed by Rajesh Kumar</div>
          <div class="activity-time">2m ago</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon">👤</div>
          <div class="activity-content"><strong>New Contact:</strong> Priya Sharma added to Enterprise leads</div>
          <div class="activity-time">15m ago</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon">📋</div>
          <div class="activity-content"><strong>Task Completed:</strong> Follow-up call with ABC Corp marked done</div>
          <div class="activity-time">1h ago</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon">📧</div>
          <div class="activity-content"><strong>Campaign Sent:</strong> Q2 Newsletter — 2,450 recipients</div>
          <div class="activity-time">3h ago</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon">🏢</div>
          <div class="activity-content"><strong>New Company:</strong> Acme Technologies added by Amit Verma</div>
          <div class="activity-time">5h ago</div>
        </div>
      </div>
    </div>
  `;

  const pipelinePreview = `
    <div class="card" style="margin-top:24px">
      <div class="card-header"><span class="card-title">Pipeline Overview</span> <a href="deals.html" class="btn btn-sm btn-secondary">View All</a></div>
      <div class="card-body">
        <div class="kanban-board">
          <div class="kanban-column">
            <div class="kanban-header">Qualified <span class="kanban-count">12</span></div>
            <div class="kanban-cards">
              <div class="kanban-card"><div class="kanban-card-title">TechMahindra Deal</div><div class="kanban-card-meta">₹8,50,000</div></div>
              <div class="kanban-card"><div class="kanban-card-title">Infosys Consulting</div><div class="kanban-card-meta">₹15,00,000</div></div>
            </div>
          </div>
          <div class="kanban-column">
            <div class="kanban-header">Proposal <span class="kanban-count">8</span></div>
            <div class="kanban-cards">
              <div class="kanban-card"><div class="kanban-card-title">Wipro Enterprise</div><div class="kanban-card-meta">₹22,00,000</div></div>
              <div class="kanban-card"><div class="kanban-card-title">HCL Cloud Deal</div><div class="kanban-card-meta">₹5,00,000</div></div>
            </div>
          </div>
          <div class="kanban-column">
            <div class="kanban-header">Negotiation <span class="kanban-count">5</span></div>
            <div class="kanban-cards">
              <div class="kanban-card"><div class="kanban-card-title">TCS Digital</div><div class="kanban-card-meta">₹45,00,000</div></div>
              <div class="kanban-card"><div class="kanban-card-title">L&T Tech Deal</div><div class="kanban-card-meta">₹18,00,000</div></div>
            </div>
          </div>
          <div class="kanban-column">
            <div class="kanban-header">Closed Won <span class="kanban-count">3</span></div>
            <div class="kanban-cards">
              <div class="kanban-card"><div class="kanban-card-title">TechCorp Solutions</div><div class="kanban-card-meta">₹12,50,000 ✅</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return pageWrapper('Dashboard', 'Welcome back, Rajesh. Here is your CRM overview.', s + recentActivity + pipelinePreview, 'Dashboard');
}

function pageContacts() {
  const toolbarHtml = `<div class="toolbar"><input class="form-input" placeholder="Search contacts..." style="min-width:240px"><select class="form-select"><option>All Lists</option><option>Enterprise</option><option>SMB</option><option>Hot Leads</option></select><select class="form-select"><option>All Status</option><option>Active</option><option>Inactive</option></select><span class="toolbar-spacer"></span><button class="btn btn-primary">+ Add Contact</button></div>`;
  const tableHtml = `<div class="card"><div class="table-container"><table><thead><tr><th><div class="checkbox"><input type="checkbox"></div></th><th>Name</th><th>Email</th><th>Phone</th><th>Company</th><th>Status</th><th>Owner</th><th></th></tr></thead><tbody>
${[
  ['Rajesh Kumar', 'rajesh.kumar@example.com', '+91 98765 43210', 'TechCorp Solutions', '<span class="badge badge-green">Active</span>', 'Amit Verma'],
  ['Priya Sharma', 'priya.sharma@example.com', '+91 87654 32109', 'Acme Technologies', '<span class="badge badge-green">Active</span>', 'Sneha Patel'],
  ['Amit Singh', 'amit.singh@example.com', '+91 76543 21098', 'Innovatech India', '<span class="badge badge-yellow">Lead</span>', 'Rajesh Kumar'],
  ['Sneha Reddy', 'sneha.reddy@example.com', '+91 65432 10987', 'Global Solutions', '<span class="badge badge-green">Active</span>', 'Priya Sharma'],
  ['Vikram Patel', 'vikram.patel@example.com', '+91 54321 09876', 'Digital Ventures', '<span class="badge badge-gray">Inactive</span>', 'Amit Verma'],
  ['Ananya Gupta', 'ananya.gupta@example.com', '+91 43210 98765', 'NexGen Corp', '<span class="badge badge-green">Active</span>', 'Sneha Patel'],
  ['Rohit Joshi', 'rohit.joshi@example.com', '+91 32109 87654', 'Pinnacle Ltd', '<span class="badge badge-yellow">Lead</span>', 'Rajesh Kumar'],
].map(r => `<tr><td><div class="checkbox"><input type="checkbox"></div></td><td><a href="contact-detail.html"><strong>${r[0]}</strong></a></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td><td><button class="btn btn-sm btn-ghost">⋯</button></td></tr>`).join('\n')}
</tbody></table></div><div class="card-footer" style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:13px;color:var(--color-neutral-500)">Showing 1-7 of 2,847</span><div class="pagination"><button class="page-btn" disabled>‹</button><button class="page-btn active">1</button><button class="page-btn">2</button><button class="page-btn">3</button><button class="page-btn">⋯</button><button class="page-btn">›</button></div></div></div>`;
  return pageWrapper('Contacts', 'Manage your contact database.', toolbarHtml + tableHtml, 'Contacts');
}

function pageContactDetail() {
  const header = `<div class="detail-header">
    <div class="detail-avatar">RK</div>
    <div class="detail-info">
      <div class="detail-name">Rajesh Kumar</div>
      <div class="detail-role">Senior Software Engineer at TechCorp Solutions</div>
      <div class="detail-meta">
        <span class="detail-meta-item"><strong>Email:</strong> rajesh.kumar@example.com</span>
        <span class="detail-meta-item"><strong>Phone:</strong> +91 98765 43210</span>
        <span class="detail-meta-item"><strong>Location:</strong> Bengaluru, India</span>
        <span class="detail-meta-item"><strong>Owner:</strong> Amit Verma</span>
      </div>
    </div>
    <div class="detail-actions">
      <button class="btn btn-primary">✏️ Edit</button>
      <button class="btn btn-secondary">📧 Email</button>
      <button class="btn btn-secondary">📞 Call</button>
      <button class="btn btn-ghost">⋯</button>
    </div>
  </div>`;

  const tabs = `<div class="tabs"><button class="tab active">Activity</button><button class="tab">Deals</button><button class="tab">Tasks</button><button class="tab">Emails</button><button class="tab">Notes</button><button class="tab">Files</button></div>`;

  const activity = `<div class="card">
    <div class="card-header"><span class="card-title">Activity Timeline</span></div>
    <div class="card-body">
${[
  ['📞', 'Call completed — Discussed Q2 requirements', '2 hours ago'],
  ['📧', 'Sent proposal document for review', '1 day ago'],
  ['📋', 'Task completed — Follow-up on implementation timeline', '2 days ago'],
  ['💰', 'Deal updated — TechCorp Solutions moved to Negotiation', '3 days ago'],
  ['👤', 'Contact created by Amit Verma', '1 week ago'],
].map(a => `<div class="activity-item"><div class="activity-icon">${a[0]}</div><div class="activity-content">${a[1]}</div><div class="activity-time">${a[2]}</div></div>`).join('\n')}
    </div>
  </div>`;

  const details = `<div class="grid-2" style="margin-top:24px">
    ${card('Contact Information', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div><div class="form-label">Email</div><div>rajesh.kumar@example.com</div></div>
        <div><div class="form-label">Phone</div><div>+91 98765 43210</div></div>
        <div><div class="form-label">Mobile</div><div>+91 98765 43210</div></div>
        <div><div class="form-label">Department</div><div>Engineering</div></div>
        <div><div class="form-label">Designation</div><div>Senior Software Engineer</div></div>
        <div><div class="form-label">LinkedIn</div><div><a href="#">linkedin.com/in/rajeshkumar</a></div></div>
      </div>
    `)}
    ${card('Notes', `<p style="font-size:14px;color:var(--color-neutral-600);line-height:1.6">Rajesh is our primary contact at TechCorp for the digital transformation project. He is interested in our enterprise suite and has requested a demo for the full team. Follow-up scheduled for next week.</p><div style="margin-top:12px"><button class="btn btn-sm btn-ghost">+ Add Note</button></div>`)}
  </div>`;

  return pageWrapper('', '', header + tabs + activity + details, 'Contacts');
}

function pageContactCreate() {
  const form = `<div class="card">
    <div class="card-header"><span class="card-title">Contact Details</span></div>
    <div class="card-body">
      <div class="form-row">
        <div class="form-group"><label class="form-label">First Name *</label><input class="form-input" value="Rajesh" placeholder="Enter first name"></div>
        <div class="form-group"><label class="form-label">Last Name *</label><input class="form-input" value="Kumar" placeholder="Enter last name"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Email *</label><input class="form-input" type="email" value="rajesh.kumar@example.com" placeholder="Enter email"></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" value="+91 98765 43210" placeholder="Enter phone number"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Company</label><select class="form-select"><option>TechCorp Solutions</option><option>Acme Technologies</option><option>Innovatech India</option></select></div>
        <div class="form-group"><label class="form-label">Designation</label><input class="form-input" value="Senior Software Engineer" placeholder="Enter designation"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Owner</label><select class="form-select"><option>Amit Verma</option><option>Priya Sharma</option><option>Sneha Patel</option></select></div>
        <div class="form-group"><label class="form-label">Status</label><select class="form-select"><option>Active</option><option>Inactive</option><option>Lead</option></select></div>
      </div>
      <div class="form-group"><label class="form-label">Address</label><textarea class="form-textarea" placeholder="Enter full address"></textarea></div>
      <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" placeholder="Add notes about this contact"></textarea></div>
    </div>
    <div class="card-footer" style="display:flex;justify-content:flex-end;gap:8px">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">💾 Save Contact</button>
    </div>
  </div>`;

  return pageWrapper('Add Contact', 'Create a new contact record.', form, 'Contacts');
}

function pageCompanies() {
  const toolbarHtml = `<div class="toolbar"><input class="form-input" placeholder="Search companies..." style="min-width:240px"><select class="form-select"><option>All Industries</option><option>Technology</option><option>Finance</option><option>Healthcare</option></select><select class="form-select"><option>All Status</option><option>Active</option><option>Inactive</option></select><span class="toolbar-spacer"></span><button class="btn btn-primary">+ Add Company</button></div>`;
  const tableHtml = `<div class="card"><div class="table-container"><table><thead><tr><th><div class="checkbox"><input type="checkbox"></div></th><th>Company</th><th>Industry</th><th>Contacts</th><th>Deals</th><th>Revenue</th><th>Status</th><th></th></tr></thead><tbody>
${[
  ['TechCorp Solutions', 'Technology', '24', '3', '₹1,25,00,000', '<span class="badge badge-green">Active</span>'],
  ['Acme Technologies', 'Technology', '18', '2', '₹85,00,000', '<span class="badge badge-green">Active</span>'],
  ['Innovatech India', 'Technology', '12', '1', '₹45,00,000', '<span class="badge badge-yellow">Lead</span>'],
  ['Global Solutions Ltd', 'Finance', '8', '0', '—', '<span class="badge badge-gray">Inactive</span>'],
  ['Pinnacle Corp', 'Healthcare', '15', '4', '₹2,10,00,000', '<span class="badge badge-green">Active</span>'],
  ['Digital Ventures', 'Technology', '7', '1', '₹32,00,000', '<span class="badge badge-green">Active</span>'],
  ['NexGen Corporation', 'Finance', '11', '2', '₹67,00,000', '<span class="badge badge-yellow">Lead</span>'],
].map(r => `<tr><td><div class="checkbox"><input type="checkbox"></div></td><td><a href="company-detail.html"><strong>${r[0]}</strong></a></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td><td><button class="btn btn-sm btn-ghost">⋯</button></td></tr>`).join('\n')}
</tbody></table></div><div class="card-footer" style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:13px;color:var(--color-neutral-500)">Showing 1-7 of 156</span><div class="pagination"><button class="page-btn" disabled>‹</button><button class="page-btn active">1</button><button class="page-btn">2</button><button class="page-btn">3</button><button class="page-btn">⋯</button><button class="page-btn">›</button></div></div></div>`;
  return pageWrapper('Companies', 'Manage your company accounts.', toolbarHtml + tableHtml, 'Companies');
}

function pageCompanyDetail() {
  const header = `<div class="detail-header">
    <div class="detail-avatar" style="border-radius:var(--radius-lg);background:var(--color-primary-100);font-size:20px">TC</div>
    <div class="detail-info">
      <div class="detail-name">TechCorp Solutions</div>
      <div class="detail-role">Technology · Bengaluru, India</div>
      <div class="detail-meta">
        <span class="detail-meta-item"><strong>Website:</strong> <a href="#">www.techcorp.in</a></span>
        <span class="detail-meta-item"><strong>Phone:</strong> +91 080 4567 8900</span>
        <span class="detail-meta-item"><strong>Employees:</strong> 500-1000</span>
        <span class="detail-meta-item"><strong>Owner:</strong> Amit Verma</span>
      </div>
    </div>
    <div class="detail-actions">
      <button class="btn btn-primary">✏️ Edit</button>
      <button class="btn btn-secondary">📧 Email</button>
      <button class="btn btn-ghost">⋯</button>
    </div>
  </div>`;

  const tabs = `<div class="tabs"><button class="tab active">Contacts</button><button class="tab">Deals</button><button class="tab">Activities</button><button class="tab">Notes</button></div>`;

  const s = statsGrid([
    { label: 'Total Contacts', value: '24', change: '+3 this month', trend: 'up' },
    { label: 'Active Deals', value: '3', change: '₹1,25,00,000 total', trend: 'up' },
    { label: 'Open Tasks', value: '7', change: '2 overdue', trend: 'down' },
    { label: 'Lifetime Value', value: '₹3,45,00,000', change: '+18.5% YoY', trend: 'up' },
  ]);

  const contacts = `<div class="card"><div class="table-container"><table><thead><tr><th>Name</th><th>Designation</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead><tbody>
    <tr><td><a href="contact-detail.html">Rajesh Kumar</a></td><td>Senior Software Engineer</td><td>rajesh@techcorp.com</td><td>+91 98765 43210</td><td><span class="badge badge-green">Active</span></td></tr>
    <tr><td>Priya Singh</td><td>VP Engineering</td><td>priya@techcorp.com</td><td>+91 87654 32109</td><td><span class="badge badge-green">Active</span></td></tr>
    <tr><td>Amit Sharma</td><td>CTO</td><td>amit@techcorp.com</td><td>+91 76543 21098</td><td><span class="badge badge-green">Active</span></td></tr>
  </tbody></table></div></div>`;

  return pageWrapper('', '', header + tabs + s + contacts, 'Companies');
}

function pageCompanyCreate() {
  const form = `<div class="card">
    <div class="card-header"><span class="card-title">Company Details</span></div>
    <div class="card-body">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Company Name *</label><input class="form-input" placeholder="Enter company name"></div>
        <div class="form-group"><label class="form-label">Industry *</label><select class="form-select"><option>Technology</option><option>Finance</option><option>Healthcare</option><option>Education</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Website</label><input class="form-input" placeholder="https://example.com"></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" placeholder="+91 ##########"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Employee Count</label><select class="form-select"><option>1-10</option><option>11-50</option><option>51-200</option><option>201-500</option><option>501-1000</option><option>1000+</option></select></div>
        <div class="form-group"><label class="form-label">Owner</label><select class="form-select"><option>Amit Verma</option><option>Priya Sharma</option><option>Sneha Patel</option></select></div>
      </div>
      <div class="form-group"><label class="form-label">Address</label><textarea class="form-textarea" placeholder="Enter company address"></textarea></div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" placeholder="Brief description about the company"></textarea></div>
    </div>
    <div class="card-footer" style="display:flex;justify-content:flex-end;gap:8px">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">💾 Save Company</button>
    </div>
  </div>`;
  return pageWrapper('Add Company', 'Create a new company account.', form, 'Companies');
}

function pageDeals() {
  const toolbarHtml = `<div class="toolbar"><input class="form-input" placeholder="Search deals..." style="min-width:240px"><select class="form-select"><option>All Stages</option><option>Qualified</option><option>Proposal</option><option>Negotiation</option></select><select class="form-select"><option>All Owners</option><option>Amit Verma</option><option>Priya Sharma</option></select><span class="toolbar-spacer"></span><button class="btn btn-primary">+ Add Deal</button></div>`;
  const kanban = `<div class="kanban-board">
${[
  ['Qualified', '12', [
    ['TechMahindra Deal', '₹8,50,000', 'TechMahindra', 'badge-blue'],
    ['Infosys Consulting', '₹15,00,000', 'Infosys', 'badge-blue'],
    ['Wipro Cloud Migration', '₹22,00,000', 'Wipro', 'badge-blue'],
    ['HCL Digital Suite', '₹5,00,000', 'HCL', 'badge-blue'],
  ]],
  ['Proposal', '8', [
    ['TCS Enterprise Deal', '₹45,00,000', 'TCS', 'badge-yellow'],
    ['L&T Tech Platform', '₹18,00,000', 'L&T', 'badge-yellow'],
    ['Adani Digital', '₹12,00,000', 'Adani Group', 'badge-yellow'],
  ]],
  ['Negotiation', '5', [
    ['Reliance Retail CRM', '₹62,00,000', 'Reliance', 'badge-yellow'],
    ['Bajaj Finance Suite', '₹28,00,000', 'Bajaj', 'badge-yellow'],
    ['ICICI Bank Platform', '₹95,00,000', 'ICICI', 'badge-yellow'],
  ]],
  ['Closed Won', '3', [
    ['TechCorp Solutions', '₹12,50,000', 'TechCorp', 'badge-green'],
    ['Small Co. Package', '₹2,40,000', 'Small Co.', 'badge-green'],
    ['ABC Corp License', '₹8,00,000', 'ABC Corp', 'badge-green'],
  ]],
].map(col => `<div class="kanban-column"><div class="kanban-header">${col[0]} <span class="kanban-count">${col[1]}</span></div><div class="kanban-cards">${col[2].map(c => `<div class="kanban-card"><span class="badge ${c[3]}" style="margin-bottom:6px">${c[2]}</span><div class="kanban-card-title">${c[0]}</div><div class="kanban-card-meta">${c[1]}</div></div>`).join('')}</div></div>`).join('\n')}
  </div>`;
  return pageWrapper('Deals', 'Track your sales pipeline.', toolbarHtml + kanban, 'Deals');
}

function pageDealDetail() {
  const header = `<div class="detail-header">
    <div class="detail-avatar" style="border-radius:var(--radius-lg);background:var(--color-success-50);color:var(--color-success-700)">₹</div>
    <div class="detail-info">
      <div class="detail-name">TechCorp Solutions</div>
      <div class="detail-role">₹12,50,000 · Closed Won</div>
      <div class="detail-meta">
        <span class="detail-meta-item"><strong>Contact:</strong> Rajesh Kumar</span>
        <span class="detail-meta-item"><strong>Company:</strong> TechCorp Solutions</span>
        <span class="detail-meta-item"><strong>Owner:</strong> Amit Verma</span>
        <span class="detail-meta-item"><strong>Close Date:</strong> 15 May 2026</span>
      </div>
    </div>
    <div class="detail-actions">
      <button class="btn btn-primary">✏️ Edit</button>
      <button class="btn btn-success">✅ Mark Won</button>
      <button class="btn btn-ghost">⋯</button>
    </div>
  </div>`;

  const tabs = `<div class="tabs"><button class="tab active">Details</button><button class="tab">Activity</button><button class="tab">Products</button></div>`;

  const grid = `<div class="grid-2">
    ${card('Deal Information', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div><div class="form-label">Amount</div><div>₹12,50,000</div></div>
        <div><div class="form-label">Stage</div><div><span class="badge badge-green">Closed Won</span></div></div>
        <div><div class="form-label">Probability</div><div>100%</div></div>
        <div><div class="form-label">Expected Close</div><div>15 May 2026</div></div>
        <div><div class="form-label">Deal Type</div><div>New Business</div></div>
        <div><div class="form-label">Source</div><div>Referral</div></div>
      </div>
    `)}
    ${card('Activity Timeline', `
      <div class="activity-item"><div class="activity-icon">💰</div><div class="activity-content">Deal won — Payment received</div><div class="activity-time">Today</div></div>
      <div class="activity-item"><div class="activity-icon">📄</div><div class="activity-content">Contract signed by both parties</div><div class="activity-time">3 days ago</div></div>
      <div class="activity-item"><div class="activity-icon">📋</div><div class="activity-content">Final proposal sent for review</div><div class="activity-time">1 week ago</div></div>
    `)}
  </div>`;
  return pageWrapper('', '', header + tabs + grid, 'Deals');
}

function pageDealCreate() {
  const form = `<div class="card">
    <div class="card-header"><span class="card-title">Deal Details</span></div>
    <div class="card-body">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Deal Name *</label><input class="form-input" placeholder="Enter deal name"></div>
        <div class="form-group"><label class="form-label">Amount (₹) *</label><input class="form-input" type="number" placeholder="Enter amount"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Contact</label><select class="form-select"><option>Rajesh Kumar</option><option>Priya Sharma</option><option>Amit Singh</option></select></div>
        <div class="form-group"><label class="form-label">Company</label><select class="form-select"><option>TechCorp Solutions</option><option>Acme Technologies</option><option>Innovatech India</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Stage</label><select class="form-select"><option>Qualified</option><option>Proposal</option><option>Negotiation</option><option>Closed Won</option><option>Closed Lost</option></select></div>
        <div class="form-group"><label class="form-label">Owner</label><select class="form-select"><option>Amit Verma</option><option>Priya Sharma</option><option>Sneha Patel</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Expected Close Date</label><input class="form-input" type="date"></div>
        <div class="form-group"><label class="form-label">Probability (%)</label><input class="form-input" type="number" min="0" max="100" placeholder="50"></div>
      </div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" placeholder="Deal description and notes"></textarea></div>
    </div>
    <div class="card-footer" style="display:flex;justify-content:flex-end;gap:8px">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">💾 Create Deal</button>
    </div>
  </div>`;
  return pageWrapper('Add Deal', 'Create a new deal in the pipeline.', form, 'Deals');
}

function pageLeads() {
  const toolbarHtml = `<div class="toolbar"><input class="form-input" placeholder="Search leads..." style="min-width:240px"><select class="form-select"><option>All Sources</option><option>Website</option><option>Referral</option><option>LinkedIn</option><option>Event</option></select><select class="form-select"><option>All Status</option><option>New</option><option>Contacted</option><option>Qualified</option></select><span class="toolbar-spacer"></span><button class="btn btn-primary">+ Add Lead</button></div>`;
  const tableHtml = `<div class="card"><div class="table-container"><table><thead><tr><th><div class="checkbox"><input type="checkbox"></div></th><th>Lead</th><th>Source</th><th>Company</th><th>Score</th><th>Status</th><th>Owner</th><th></th></tr></thead><tbody>
${[
  ['Rahul Verma', 'Website', 'Self Employed', '85', '<span class="badge badge-blue">New</span>', 'Priya Sharma'],
  ['Neha Kapoor', 'LinkedIn', 'TechCorp', '72', '<span class="badge badge-yellow">Contacted</span>', 'Amit Verma'],
  ['Sunil Mehta', 'Referral', 'Acme Tech', '91', '<span class="badge badge-green">Qualified</span>', 'Sneha Patel'],
  ['Deepa Iyer', 'Event', 'Innovatech', '45', '<span class="badge badge-blue">New</span>', 'Rajesh Kumar'],
  ['Arun Nair', 'Website', 'Self Employed', '63', '<span class="badge badge-yellow">Contacted</span>', 'Priya Sharma'],
  ['Kavita Joshi', 'LinkedIn', 'Global Corp', '88', '<span class="badge badge-green">Qualified</span>', 'Amit Verma'],
  ['Vijay Deshmukh', 'Referral', 'Digital Ventures', '38', '<span class="badge badge-gray">Lost</span>', 'Sneha Patel'],
].map(r => `<tr><td><div class="checkbox"><input type="checkbox"></div></td><td><a href="lead-detail.html"><strong>${r[0]}</strong></a></td><td>${r[1]}</td><td>${r[2]}</td><td><div class="progress-bar" style="width:80px;display:inline-block;vertical-align:middle;margin-right:8px"><div class="progress-fill" style="width:${r[3]}%"></div></div><span style="font-size:12px">${r[3]}</span></td><td>${r[4]}</td><td>${r[5]}</td><td><button class="btn btn-sm btn-ghost">⋯</button></td></tr>`).join('\n')}
</tbody></table></div><div class="card-footer" style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:13px;color:var(--color-neutral-500)">Showing 1-7 of 143</span><div class="pagination"><button class="page-btn" disabled>‹</button><button class="page-btn active">1</button><button class="page-btn">2</button><button class="page-btn">3</button><button class="page-btn">⋯</button><button class="page-btn">›</button></div></div></div>`;
  return pageWrapper('Leads', 'Manage and score incoming leads.', toolbarHtml + tableHtml, 'Leads');
}

function pageLeadDetail() {
  const header = `<div class="detail-header">
    <div class="detail-avatar">RV</div>
    <div class="detail-info">
      <div class="detail-name">Rahul Verma</div>
      <div class="detail-role">Freelance Consultant</div>
      <div class="detail-meta">
        <span class="detail-meta-item"><strong>Email:</strong> rahul.verma@example.com</span>
        <span class="detail-meta-item"><strong>Phone:</strong> +91 99887 76655</span>
        <span class="detail-meta-item"><strong>Source:</strong> Website</span>
        <span class="detail-meta-item"><strong>Score:</strong> 85/100</span>
      </div>
    </div>
    <div class="detail-actions">
      <button class="btn btn-primary">✏️ Edit</button>
      <button class="btn btn-success">✅ Convert</button>
      <button class="btn btn-secondary">📧 Email</button>
      <button class="btn btn-ghost">⋯</button>
    </div>
  </div>`;

  const tabs = `<div class="tabs"><button class="tab active">Details</button><button class="tab">Activities</button><button class="tab">Notes</button></div>`;

  const grid = `<div class="grid-2">
    ${card('Lead Information', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div><div class="form-label">Status</div><div><span class="badge badge-blue">New</span></div></div>
        <div><div class="form-label">Lead Score</div><div><strong>85</strong>/100</div></div>
        <div><div class="form-label">Source</div><div>Website Form</div></div>
        <div><div class="form-label">Owner</div><div>Priya Sharma</div></div>
        <div><div class="form-label">Created</div><div>12 May 2026</div></div>
        <div><div class="form-label">Interest</div><div>Enterprise Plan</div></div>
      </div>
    `)}
    ${card('Lead Scoring Breakdown', `
      <div style="display:flex;flex-direction:column;gap:8px">
        <div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>Profile Fit</span><span>90%</span></div><div class="progress-bar"><div class="progress-fill" style="width:90%"></div></div></div>
        <div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>Engagement</span><span>75%</span></div><div class="progress-bar"><div class="progress-fill" style="width:75%"></div></div></div>
        <div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>Budget Fit</span><span>85%</span></div><div class="progress-bar"><div class="progress-fill" style="width:85%"></div></div></div>
        <div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>Timeline</span><span>70%</span></div><div class="progress-bar"><div class="progress-fill" style="width:70%"></div></div></div>
      </div>
    `)}
  </div>`;
  return pageWrapper('', '', header + tabs + grid, 'Leads');
}

function pageLeadCreate() {
  const form = `<div class="card">
    <div class="card-header"><span class="card-title">Lead Details</span></div>
    <div class="card-body">
      <div class="form-row">
        <div class="form-group"><label class="form-label">First Name *</label><input class="form-input" placeholder="Enter first name"></div>
        <div class="form-group"><label class="form-label">Last Name *</label><input class="form-input" placeholder="Enter last name"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Email *</label><input class="form-input" type="email" placeholder="Enter email"></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" placeholder="Enter phone number"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Source</label><select class="form-select"><option>Website</option><option>Referral</option><option>LinkedIn</option><option>Event</option><option>Cold Call</option></select></div>
        <div class="form-group"><label class="form-label">Owner</label><select class="form-select"><option>Priya Sharma</option><option>Amit Verma</option><option>Sneha Patel</option></select></div>
      </div>
      <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" placeholder="Lead notes"></textarea></div>
    </div>
    <div class="card-footer" style="display:flex;justify-content:flex-end;gap:8px">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">💾 Save Lead</button>
    </div>
  </div>`;
  return pageWrapper('Add Lead', 'Create a new lead record.', form, 'Leads');
}

function pageTasks() {
  const toolbarHtml = `<div class="toolbar"><input class="form-input" placeholder="Search tasks..." style="min-width:240px"><select class="form-select"><option>All Status</option><option>Pending</option><option>In Progress</option><option>Completed</option></select><select class="form-select"><option>All Priorities</option><option>High</option><option>Medium</option><option>Low</option></select><span class="toolbar-spacer"></span><button class="btn btn-primary">+ Add Task</button></div>`;
  const tableHtml = `<div class="card"><div class="table-container"><table><thead><tr><th><div class="checkbox"><input type="checkbox"></div></th><th>Task</th><th>Related To</th><th>Priority</th><th>Due Date</th><th>Status</th><th>Assigned To</th><th></th></tr></thead><tbody>
${[
  ['Follow-up with TechCorp on Q2', 'TechCorp Solutions', '<span class="badge badge-red">High</span>', 'Today', '<span class="badge badge-yellow">In Progress</span>', 'Amit Verma'],
  ['Send proposal to Infosys', 'Infosys Consulting', '<span class="badge badge-red">High</span>', 'Tomorrow', '<span class="badge badge-blue">Pending</span>', 'Priya Sharma'],
  ['Update contact list for Q2', 'Contacts', '<span class="badge badge-yellow">Medium</span>', '18 May 2026', '<span class="badge badge-blue">Pending</span>', 'Sneha Patel'],
  ['Prepare monthly report', 'Reports', '<span class="badge badge-yellow">Medium</span>', '20 May 2026', '<span class="badge badge-yellow">In Progress</span>', 'Rajesh Kumar'],
  ['Review deal pipeline', 'Deals', '<span class="badge badge-green">Low</span>', '25 May 2026', '<span class="badge badge-green">Completed</span>', 'Amit Verma'],
  ['Demo call with Acme Tech', 'Acme Technologies', '<span class="badge badge-red">High</span>', '16 May 2026', '<span class="badge badge-blue">Pending</span>', 'Priya Sharma'],
  ['Clean up inactive contacts', 'Contacts', '<span class="badge badge-green">Low</span>', '30 May 2026', '<span class="badge badge-blue">Pending</span>', 'Sneha Patel'],
].map(r => `<tr><td><div class="checkbox"><input type="checkbox"></div></td><td><a href="task-detail.html"><strong>${r[0]}</strong></a></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td><td><button class="btn btn-sm btn-ghost">⋯</button></td></tr>`).join('\n')}
</tbody></table></div><div class="card-footer" style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:13px;color:var(--color-neutral-500)">Showing 1-7 of 84</span><div class="pagination"><button class="page-btn" disabled>‹</button><button class="page-btn active">1</button><button class="page-btn">2</button><button class="page-btn">3</button><button class="page-btn">⋯</button><button class="page-btn">›</button></div></div></div>`;
  return pageWrapper('Tasks', 'Manage and track your tasks.', toolbarHtml + tableHtml, 'Tasks');
}

function pageTaskDetail() {
  const header = `<div class="detail-header">
    <div class="detail-avatar" style="border-radius:var(--radius-lg);background:var(--color-warning-50);color:var(--color-warning-600)">📋</div>
    <div class="detail-info">
      <div class="detail-name">Follow-up with TechCorp on Q2 Requirements</div>
      <div class="detail-role"><span class="badge badge-red">High Priority</span> <span class="badge badge-yellow">In Progress</span></div>
      <div class="detail-meta">
        <span class="detail-meta-item"><strong>Due:</strong> Today</span>
        <span class="detail-meta-item"><strong>Assigned To:</strong> Amit Verma</span>
        <span class="detail-meta-item"><strong>Related To:</strong> TechCorp Solutions</span>
      </div>
    </div>
    <div class="detail-actions">
      <button class="btn btn-success">✓ Mark Complete</button>
      <button class="btn btn-primary">✏️ Edit</button>
      <button class="btn btn-ghost">⋯</button>
    </div>
  </div>`;

  const detail = `<div class="grid-2">
    ${card('Description', `<p style="font-size:14px;color:var(--color-neutral-600);line-height:1.7">Schedule and conduct a follow-up meeting with Rajesh Kumar at TechCorp Solutions to discuss their Q2 requirements for the enterprise platform. Topics to cover: implementation timeline, custom feature requests, and pricing for additional user licenses.</p>`)}
    ${card('Subtasks', `
      <div style="display:flex;flex-direction:column;gap:8px">
        <label class="checkbox"><input type="checkbox"> Prepare agenda document</label>
        <label class="checkbox"><input type="checkbox"> Review previous meeting notes</label>
        <label class="checkbox"><input type="checkbox"> Check pricing for extra licenses</label>
        <label class="checkbox"><input type="checkbox"> Send calendar invite</label>
      </div>
    `)}
  </div>`;

  return pageWrapper('', '', header + detail, 'Tasks');
}

function pageTaskCreate() {
  const form = `<div class="card">
    <div class="card-header"><span class="card-title">Task Details</span></div>
    <div class="card-body">
      <div class="form-group"><label class="form-label">Task Title *</label><input class="form-input" placeholder="Enter task title"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Assigned To</label><select class="form-select"><option>Amit Verma</option><option>Priya Sharma</option><option>Sneha Patel</option><option>Rajesh Kumar</option></select></div>
        <div class="form-group"><label class="form-label">Priority</label><select class="form-select"><option>High</option><option selected>Medium</option><option>Low</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Due Date</label><input class="form-input" type="date"></div>
        <div class="form-group"><label class="form-label">Related To</label><select class="form-select"><option>None</option><option>TechCorp Solutions</option><option>Acme Technologies</option><option>Infosys Consulting</option></select></div>
      </div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" placeholder="Task description"></textarea></div>
    </div>
    <div class="card-footer" style="display:flex;justify-content:flex-end;gap:8px">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">💾 Create Task</button>
    </div>
  </div>`;
  return pageWrapper('Add Task', 'Create a new task.', form, 'Tasks');
}

function pageCalendar() {
  const s = statsGrid([
    { label: "Today's Events", value: '5', change: '2 meetings, 3 calls', trend: 'up' },
    { label: 'This Week', value: '18', change: '8 pending confirmation', trend: 'up' },
  ]);

  const calendarGrid = `<div class="grid-2">
    ${card('May 2026', `
      <table>
        <thead><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr></thead>
        <tbody>
          <tr><td style="color:var(--color-neutral-400)">27</td><td style="color:var(--color-neutral-400)">28</td><td style="color:var(--color-neutral-400)">29</td><td style="color:var(--color-neutral-400)">30</td><td>1</td><td>2</td><td>3</td></tr>
          <tr><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td></tr>
          <tr><td>11</td><td>12</td><td>13</td><td>14</td><td>15</td><td style="background:var(--color-primary-100);border-radius:50%;font-weight:700;color:var(--color-primary-700);text-align:center">16</td><td>17</td></tr>
          <tr><td>18</td><td>19</td><td>20</td><td>21</td><td>22</td><td>23</td><td>24</td></tr>
          <tr><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td><td>30</td><td>31</td></tr>
        </tbody>
      </table>
    `)}
    ${card("Today's Schedule", `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="padding:8px 12px;border-left:3px solid var(--color-primary-500);background:var(--color-primary-50);border-radius:0 var(--radius-sm) var(--radius-sm) 0"><div style="font-weight:600;font-size:14px">Team Standup</div><div style="font-size:12px;color:var(--color-neutral-500)">09:00 - 09:30 · All Hands</div></div>
        <div style="padding:8px 12px;border-left:3px solid var(--color-success-500);background:var(--color-success-50);border-radius:0 var(--radius-sm) var(--radius-sm) 0"><div style="font-weight:600;font-size:14px">Client Call — TechCorp</div><div style="font-size:12px;color:var(--color-neutral-500)">11:00 - 12:00 · Rajesh Kumar</div></div>
        <div style="padding:8px 12px;border-left:3px solid var(--color-warning-500);background:var(--color-warning-50);border-radius:0 var(--radius-sm) var(--radius-sm) 0"><div style="font-weight:600;font-size:14px">Lunch</div><div style="font-size:12px;color:var(--color-neutral-500)">13:00 - 14:00</div></div>
        <div style="padding:8px 12px;border-left:3px solid var(--color-primary-500);background:var(--color-primary-50);border-radius:0 var(--radius-sm) var(--radius-sm) 0"><div style="font-weight:600;font-size:14px">Demo Prep — Acme Tech</div><div style="font-size:12px;color:var(--color-neutral-500)">15:00 - 16:00 · Priya Sharma</div></div>
        <div style="padding:8px 12px;border-left:3px solid var(--color-info-500);background:var(--color-info-50);border-radius:0 var(--radius-sm) var(--radius-sm) 0"><div style="font-weight:600;font-size:14px">Review Q2 Reports</div><div style="font-size:12px;color:var(--color-neutral-500)">16:30 - 17:30 · Solo</div></div>
      </div>
    `)}
  </div>`;

  return pageWrapper('Calendar', 'Schedule and manage events.', s + calendarGrid, 'Calendar');
}

function pageCampaigns() {
  const toolbarHtml = `<div class="toolbar"><span class="toolbar-spacer"></span><button class="btn btn-primary">+ New Campaign</button></div>`;
  const tableHtml = `<div class="card"><div class="table-container"><table><thead><tr><th>Campaign</th><th>Type</th><th>Recipients</th><th>Opens</th><th>Click Rate</th><th>Status</th><th>Sent Date</th><th></th></tr></thead><tbody>
${[
  ['Q2 Newsletter', 'Email', '2,450', '34.2%', '12.8%', '<span class="badge badge-green">Sent</span>', '12 May 2026'],
  ['Product Launch', 'Email', '1,800', '28.5%', '9.3%', '<span class="badge badge-green">Sent</span>', '5 May 2026'],
  ['Webinar Invite', 'Email', '3,200', '—', '—', '<span class="badge badge-yellow">Draft</span>', '—'],
  ['Holiday Greeting', 'Email', '5,000', '41.0%', '15.2%', '<span class="badge badge-green">Sent</span>', '15 Jan 2026'],
  ['Case Study Blast', 'Email', '2,100', '22.3%', '7.1%', '<span class="badge badge-green">Sent</span>', '20 Apr 2026'],
  ['New Feature Alert', 'In-App', '—', '—', '—', '<span class="badge badge-blue">Scheduled</span>', '1 Jun 2026'],
  ['Feedback Survey', 'Email', '1,500', '—', '—', '<span class="badge badge-yellow">Draft</span>', '—'],
].map(r => `<tr><td><a href="#"><strong>${r[0]}</strong></a></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td><td>${r[6]}</td><td><button class="btn btn-sm btn-ghost">⋯</button></td></tr>`).join('\n')}
</tbody></table></div></div>`;
  return pageWrapper('Campaigns', 'Manage email and marketing campaigns.', toolbarHtml + tableHtml, 'Campaigns');
}

function pageReports() {
  const s = statsGrid([
    { label: 'Revenue (This Quarter)', value: '₹84,62,000', change: '+12.5% vs last quarter', trend: 'up' },
    { label: 'Deals Won', value: '18', change: '+3 vs last quarter', trend: 'up' },
    { label: 'Conversion Rate', value: '24.3%', change: '+2.1% improvement', trend: 'up' },
    { label: 'Avg. Deal Size', value: '₹4,70,111', change: '-8.3% vs last quarter', trend: 'down' },
  ]);

  const charts = `<div class="grid-2">
    ${card('Revenue Overview', '<div style="height:240px;display:flex;align-items:flex-end;gap:8px;padding-top:20px">' +
      ['Jan','Feb','Mar','Apr','May','Jun'].map((m,i) => {
        const h = [65, 70, 55, 80, 75, 60][i];
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center"><div style="width:100%;background:var(--color-primary-500);height:${h*2.4}px;border-radius:4px 4px 0 0"></div><span style="font-size:11px;color:var(--color-neutral-500);margin-top:6px">${m}</span></div>`;
      }).join('') +
    '</div>')}
    ${card('Deal Stage Distribution', '<div style="height:240px;display:flex;flex-direction:column;gap:12px;justify-content:center">' +
      [
        ['Qualified', 25, 'var(--color-primary-400)'],
        ['Proposal', 30, 'var(--color-primary-500)'],
        ['Negotiation', 20, 'var(--color-warning-500)'],
        ['Closed Won', 15, 'var(--color-success-500)'],
        ['Closed Lost', 10, 'var(--color-error-500)'],
      ].map(d => `<div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${d[0]}</span><span>${d[1]}%</span></div><div class="progress-bar"><div class="progress-fill" style="width:${d[1]}%;background:${d[2]}"></div></div></div>`).join('') +
    '</div>')}
  </div>`;

  const tableHtml = `<div class="card" style="margin-top:24px">
    <div class="card-header"><span class="card-title">Monthly Performance</span></div>
    <div class="table-container"><table><thead><tr><th>Month</th><th>New Leads</th><th>Deals Won</th><th>Revenue</th><th>Conversion</th></tr></thead><tbody>
      <tr><td>Jan 2026</td><td>45</td><td>3</td><td>₹12,50,000</td><td>6.7%</td></tr>
      <tr><td>Feb 2026</td><td>52</td><td>4</td><td>₹18,00,000</td><td>7.7%</td></tr>
      <tr><td>Mar 2026</td><td>38</td><td>2</td><td>₹8,50,000</td><td>5.3%</td></tr>
      <tr><td>Apr 2026</td><td>61</td><td>5</td><td>₹22,50,000</td><td>8.2%</td></tr>
      <tr><td>May 2026</td><td>43</td><td>4</td><td>₹15,12,000</td><td>9.3%</td></tr>
    </tbody></table></div>
  </div>`;

  return pageWrapper('Reports', 'Analytics and performance metrics.', s + charts + tableHtml, 'Reports');
}

function pageSettings() {
  const tabs = `<div class="tabs"><button class="tab active">Profile</button><button class="tab">Team</button><button class="tab">Notifications</button><button class="tab">Integrations</button><button class="tab">Billing</button><button class="tab">Security</button></div>`;

  const form1 = `<div class="card">
    <div class="card-header"><span class="card-title">Profile Information</span></div>
    <div class="card-body">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
        <div class="avatar" style="width:64px;height:64px;font-size:24px">AV</div>
        <div><button class="btn btn-secondary btn-sm">Change Photo</button></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">First Name</label><input class="form-input" value="Amit"></div>
        <div class="form-group"><label class="form-label">Last Name</label><input class="form-input" value="Verma"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" value="amit.verma@bluesuite.in"></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" value="+91 98765 43210"></div>
      </div>
      <div class="form-group"><label class="form-label">Bio</label><textarea class="form-textarea" placeholder="Write a short bio">Sales Manager at BlueSuite CRM</textarea></div>
    </div>
    <div class="card-footer" style="display:flex;justify-content:flex-end;gap:8px">
      <button class="btn btn-primary">💾 Save Changes</button>
    </div>
  </div>`;

  const form2 = `<div class="card" style="margin-top:24px">
    <div class="card-header"><span class="card-title">Notification Preferences</span></div>
    <div class="card-body">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:500;font-size:14px">Email Notifications</div><div style="font-size:12px;color:var(--color-neutral-500)">Receive updates via email</div></div><label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label></div>
        <div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:500;font-size:14px">Push Notifications</div><div style="font-size:12px;color:var(--color-neutral-500)">Browser push notifications</div></div><label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label></div>
        <div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:500;font-size:14px">Deal Updates</div><div style="font-size:12px;color:var(--color-neutral-500)">When deals change stage</div></div><label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label></div>
        <div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:500;font-size:14px">Weekly Digest</div><div style="font-size:12px;color:var(--color-neutral-500)">Weekly performance summary</div></div><label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label></div>
      </div>
    </div>
  </div>`;

  return pageWrapper('Settings', 'Manage your account settings.', tabs + form1 + form2, 'Settings');
}

function pageEmailCampaignCreate() {
  const form = `<div class="card">
    <div class="card-header"><span class="card-title">Campaign Details</span></div>
    <div class="card-body">
      <div class="form-group"><label class="form-label">Campaign Name *</label><input class="form-input" placeholder="Enter campaign name"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Type</label><select class="form-select"><option>Email</option><option>In-App</option><option>SMS</option></select></div>
        <div class="form-group"><label class="form-label">Status</label><select class="form-select"><option>Draft</option><option>Scheduled</option><option>Active</option></select></div>
      </div>
      <div class="form-group"><label class="form-label">Target List</label><select class="form-select"><option>All Contacts</option><option>Active Leads</option><option>Enterprise Customers</option><option>Custom List</option></select></div>
      <div class="form-group"><label class="form-label">Subject Line *</label><input class="form-input" placeholder="Enter email subject"></div>
      <div class="form-group"><label class="form-label">Email Body</label><textarea class="form-textarea" style="min-height:200px" placeholder="Write your email content here..."></textarea></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Schedule Date</label><input class="form-input" type="date"></div>
        <div class="form-group"><label class="form-label">Schedule Time</label><input class="form-input" type="time"></div>
      </div>
    </div>
    <div class="card-footer" style="display:flex;justify-content:flex-end;gap:8px">
      <button class="btn btn-secondary">Save Draft</button>
      <button class="btn btn-primary">📤 Send Campaign</button>
    </div>
  </div>`;
  return pageWrapper('New Campaign', 'Create and schedule a marketing campaign.', form, 'Campaigns');
}

function pageEmailTemplate() {
  const form = `<div class="grid-2">
    <div class="card">
      <div class="card-header"><span class="card-title">Template Editor</span></div>
      <div class="card-body">
        <div class="form-group"><label class="form-label">Template Name</label><input class="form-input" value="Q2 Newsletter"></div>
        <div class="form-group"><label class="form-label">Subject</label><input class="form-input" value="Your Q2 Newsletter from BlueSuite CRM"></div>
        <div class="form-group"><label class="form-label">Email Content (HTML)</label><textarea class="form-textarea" style="min-height:300px;font-family:var(--font-mono);font-size:13px">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;&lt;title&gt;Newsletter&lt;/title&gt;&lt;/head&gt;
&lt;body style="font-family:Arial,sans-serif"&gt;
  &lt;h1&gt;Q2 Newsletter&lt;/h1&gt;
  &lt;p&gt;Dear {{contact_name}},&lt;/p&gt;
  &lt;p&gt;Welcome to our Q2 newsletter...&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</textarea></div>
        <div class="form-hint">Use {{contact_name}}, {{company}}, {{deal_amount}} as merge tags.</div>
      </div>
      <div class="card-footer" style="display:flex;justify-content:flex-end;gap:8px">
        <button class="btn btn-secondary">Preview</button>
        <button class="btn btn-primary">💾 Save Template</button>
      </div>
    </div>
    ${card('Merge Tags', `
      <div style="display:flex;flex-direction:column;gap:8px;font-size:14px">
        <div><code style="background:var(--color-neutral-100);padding:2px 6px;border-radius:3px">{{contact_name}}</code> — Contact Name</div>
        <div><code style="background:var(--color-neutral-100);padding:2px 6px;border-radius:3px">{{company}}</code> — Company Name</div>
        <div><code style="background:var(--color-neutral-100);padding:2px 6px;border-radius:3px">{{deal_amount}}</code> — Deal Amount</div>
        <div><code style="background:var(--color-neutral-100);padding:2px 6px;border-radius:3px">{{owner}}</code> — Assigned Owner</div>
        <div><code style="background:var(--color-neutral-100);padding:2px 6px;border-radius:3px">{{close_date}}</code> — Expected Close Date</div>
      </div>
    `)}
  </div>`;
  return pageWrapper('Email Template', 'Design and manage email templates.', form, 'Campaigns');
}

function pageTeam() {
  const s = statsGrid([
    { label: 'Team Members', value: '12', change: '2 added this month', trend: 'up' },
    { label: 'Active Users', value: '9', change: '3 currently online', trend: 'up' },
  ]);
  const tableHtml = `<div class="card"><div class="table-container"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Teams</th><th>Status</th><th></th></tr></thead><tbody>
${[
  ['Amit Verma', 'amit.verma@bluesuite.in', 'Sales Manager', 'Enterprise Sales', '<span class="badge badge-green"><span class="badge-dot green"></span> Active</span>'],
  ['Priya Sharma', 'priya.sharma@bluesuite.in', 'Sales Rep', 'SMB Sales', '<span class="badge badge-green"><span class="badge-dot green"></span> Active</span>'],
  ['Sneha Patel', 'sneha.patel@bluesuite.in', 'Sales Rep', 'Enterprise Sales', '<span class="badge badge-green"><span class="badge-dot green"></span> Active</span>'],
  ['Rajesh Kumar', 'rajesh.kumar@bluesuite.in', 'Sales Rep', 'SMB Sales', '<span class="badge badge-yellow"><span class="badge-dot yellow"></span> Away</span>'],
  ['Vikram Singh', 'vikram.singh@bluesuite.in', 'Admin', 'Management', '<span class="badge badge-green"><span class="badge-dot green"></span> Active</span>'],
  ['Neha Gupta', 'neha.gupta@bluesuite.in', 'Marketing', 'Marketing', '<span class="badge badge-gray"><span class="badge-dot gray"></span> Offline</span>'],
].map(r => `<tr><td><div style="display:flex;align-items:center;gap:8px"><div class="avatar" style="width:32px;height:32px;font-size:12px">${r[0].split(' ').map(w=>w[0]).join('')}</div><strong>${r[0]}</strong></div></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td><button class="btn btn-sm btn-ghost">⋯</button></td></tr>`).join('\n')}
</tbody></table></div></div>`;
  return pageWrapper('Team', 'Manage your team members.', s + tableHtml, 'Settings');
}

function pageIntegrations() {
  const cards = ['Google Workspace', 'Microsoft 365', 'Slack', 'Zapier', 'Zoom', 'Mailchimp', 'Stripe', 'QuickBooks', 'Salesforce', 'HubSpot', 'Shopify', 'WordPress'].map(name => `
    <div class="card" style="padding:20px;display:flex;align-items:center;gap:12px;cursor:pointer">
      <div style="width:44px;height:44px;border-radius:var(--radius-md);background:var(--color-neutral-100);display:flex;align-items:center;justify-content:center;font-size:20px">${name[0]}</div>
      <div style="flex:1"><div style="font-weight:600;font-size:14px">${name}</div><div style="font-size:12px;color:var(--color-neutral-500)">Connected</div></div>
      <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
    </div>`).join('');

  return pageWrapper('Integrations', 'Connect your tools and services.', `<div class="grid-2">${cards}</div>`, 'Settings');
}

function pageBilling() {
  const s = statsGrid([
    { label: 'Current Plan', value: 'Enterprise', change: '₹12,000/month', trend: 'up' },
    { label: 'Seats Used', value: '12 / 25', change: '48% utilization', trend: 'up' },
    { label: 'Next Invoice', value: '₹12,000', change: 'Due 1 Jun 2026', trend: 'up' },
  ]);
  const planCard = `<div class="card">
    <div class="card-header"><span class="card-title">Current Plan</span> <button class="btn btn-sm btn-primary">Upgrade</button></div>
    <div class="card-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div><div class="form-label">Plan</div><div style="font-weight:600">Enterprise</div></div>
        <div><div class="form-label">Billing Cycle</div><div style="font-weight:600">Monthly</div></div>
        <div><div class="form-label">Amount</div><div style="font-weight:600">₹12,000/month</div></div>
        <div><div class="form-label">Payment Method</div><div style="font-weight:600">Visa ending in 4242</div></div>
      </div>
    </div>
  </div>`;
  const invoices = `<div class="card" style="margin-top:24px"><div class="table-container"><table><thead><tr><th>Invoice</th><th>Date</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>
    <tr><td><a href="#">INV-2026-001</a></td><td>1 May 2026</td><td>₹12,000</td><td><span class="badge badge-green">Paid</span></td><td><button class="btn btn-sm btn-ghost">Download</button></td></tr>
    <tr><td><a href="#">INV-2026-002</a></td><td>1 Apr 2026</td><td>₹12,000</td><td><span class="badge badge-green">Paid</span></td><td><button class="btn btn-sm btn-ghost">Download</button></td></tr>
    <tr><td><a href="#">INV-2026-003</a></td><td>1 Mar 2026</td><td>₹12,000</td><td><span class="badge badge-green">Paid</span></td><td><button class="btn btn-sm btn-ghost">Download</button></td></tr>
  </tbody></table></div></div>`;
  return pageWrapper('Billing', 'Manage your subscription and invoices.', s + planCard + invoices, 'Settings');
}

function pageSecurity() {
  const form = `<div class="card">
    <div class="card-header"><span class="card-title">Security Settings</span></div>
    <div class="card-body">
      <div style="display:flex;flex-direction:column;gap:20px">
        <div><div class="form-label">Current Password</div><input class="form-input" type="password" placeholder="Enter current password"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">New Password</label><input class="form-input" type="password" placeholder="Enter new password"></div>
          <div class="form-group"><label class="form-label">Confirm Password</label><input class="form-input" type="password" placeholder="Confirm new password"></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--color-neutral-200)">
          <div><div style="font-weight:500;font-size:14px">Two-Factor Authentication</div><div style="font-size:12px;color:var(--color-neutral-500)">Add an extra layer of security</div></div>
          <button class="btn btn-primary btn-sm">Enable 2FA</button>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--color-neutral-200)">
          <div><div style="font-weight:500;font-size:14px">Active Sessions</div><div style="font-size:12px;color:var(--color-neutral-500)">3 active sessions</div></div>
          <button class="btn btn-secondary btn-sm">Manage</button>
        </div>
      </div>
    </div>
    <div class="card-footer" style="display:justify-content:flex-end;gap:8px">
      <button class="btn btn-primary">Update Password</button>
    </div>
  </div>`;
  return pageWrapper('Security', 'Manage your security preferences.', form, 'Settings');
}

function pageHelp() {
  const searchCard = `<div class="card" style="text-align:center;padding:32px;margin-bottom:24px">
    <div style="font-size:36px;margin-bottom:12px">❓</div>
    <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">How can we help you?</h2>
    <div style="max-width:480px;margin:0 auto"><input class="form-input" placeholder="Search documentation..." style="text-align:center"></div>
  </div>`;

  const faq = `<div class="grid-2">
    ${card('Getting Started', `
      <div style="display:flex;flex-direction:column;gap:8px">
        <a href="#" style="font-size:14px">How to add contacts</a>
        <a href="#" style="font-size:14px">Creating your first deal</a>
        <a href="#" style="font-size:14px">Setting up email campaigns</a>
        <a href="#" style="font-size:14px">Inviting team members</a>
      </div>
    `)}
    ${card('Common Topics', `
      <div style="display:flex;flex-direction:column;gap:8px">
        <a href="#" style="font-size:14px">Managing your pipeline</a>
        <a href="#" style="font-size:14px">Importing contacts from CSV</a>
        <a href="#" style="font-size:14px">Customizing deal stages</a>
        <a href="#" style="font-size:14px">Generating reports</a>
      </div>
    `)}
    ${card('Account & Billing', `
      <div style="display:flex;flex-direction:column;gap:8px">
        <a href="#" style="font-size:14px">Upgrading your plan</a>
        <a href="#" style="font-size:14px">Managing subscription</a>
        <a href="#" style="font-size:14px">Team roles and permissions</a>
        <a href="#" style="font-size:14px">Data export and backup</a>
      </div>
    `)}
    ${card('Troubleshooting', `
      <div style="display:flex;flex-direction:column;gap:8px">
        <a href="#" style="font-size:14px">Email delivery issues</a>
        <a href="#" style="font-size:14px">Integration errors</a>
        <a href="#" style="font-size:14px">Login problems</a>
        <a href="#" style="font-size:14px">Browser compatibility</a>
      </div>
    `)}
  </div>`;

  const support = `<div class="card" style="margin-top:24px;text-align:center;padding:24px">
    <p style="font-size:14px;color:var(--color-neutral-500);margin-bottom:12px">Still need help? Our support team is available 24/7.</p>
    <button class="btn btn-primary">📧 Contact Support</button>
    <button class="btn btn-secondary" style="margin-left:8px">💬 Start Live Chat</button>
  </div>`;

  return pageWrapper('Help Center', 'Documentation and support.', searchCard + faq + support, 'Settings');
}

function pageNotifications() {
  const tabs = `<div class="tabs"><button class="tab active">All</button><button class="tab">Unread</button><button class="tab">Mentions</button></div>`;

  const list = `<div class="card">
    <div class="card-body">
${[
  ['💰', 'Deal Won', 'TechCorp Solutions deal worth ₹12,50,000 was won!', '5 minutes ago', 'var(--color-success-50)'],
  ['👤', 'New Contact', 'Priya Sharma was added to Enterprise leads by Amit Verma', '15 minutes ago', 'var(--color-primary-50)'],
  ['📋', 'Task Reminder', 'Follow-up with TechCorp is due today', '1 hour ago', 'var(--color-warning-50)'],
  ['📧', 'Campaign Sent', 'Q2 Newsletter sent to 2,450 recipients', '3 hours ago', 'var(--color-info-50)'],
  ['🏢', 'Company Added', 'Acme Technologies was added by Sneha Patel', '5 hours ago', 'var(--color-primary-50)'],
  ['👤', 'Team Update', 'Vikram Singh joined the Enterprise team', '1 day ago', 'var(--color-neutral-100)'],
  ['📈', 'Report Ready', 'Monthly performance report for April is ready', '2 days ago', 'var(--color-info-50)'],
].map(n => `<div class="activity-item" style="background:${n[4]};margin:0 -20px;padding:12px 20px"><div class="activity-icon">${n[0]}</div><div class="activity-content"><strong>${n[1]}:</strong> ${n[2]}</div><div class="activity-time">${n[3]}</div></div>`).join('\n')}
    </div>
  </div>`;

  return pageWrapper('Notifications', 'Stay updated with the latest activity.', tabs + list, 'Dashboard');
}

function pageMeetings() {
  const toolbarHtml = `<div class="toolbar"><span class="toolbar-spacer"></span><button class="btn btn-primary">+ Schedule Meeting</button></div>`;
  const tableHtml = `<div class="card"><div class="table-container"><table><thead><tr><th>Meeting</th><th>Date</th><th>Time</th><th>With</th><th>Status</th><th></th></tr></thead><tbody>
${[
  ['Q2 Planning Review', '16 May 2026', '10:00 - 11:30', 'Rajesh Kumar, Priya', '<span class="badge badge-blue">Scheduled</span>'],
  ['Product Demo — Acme', '17 May 2026', '14:00 - 15:00', 'Amit Singh', '<span class="badge badge-blue">Scheduled</span>'],
  ['Team Standup', '15 May 2026', '09:00 - 09:30', 'Sales Team', '<span class="badge badge-green">Completed</span>'],
  ['Client Call — Infosys', '14 May 2026', '11:00 - 12:00', 'Infosys Team', '<span class="badge badge-green">Completed</span>'],
  ['Weekly Sync', '13 May 2026', '15:00 - 15:30', 'Management', '<span class="badge badge-green">Completed</span>'],
  ['Strategy Session', '20 May 2026', '10:00 - 12:00', 'Leadership', '<span class="badge badge-blue">Scheduled</span>'],
].map(r => `<tr><td><a href="#"><strong>${r[0]}</strong></a></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td><button class="btn btn-sm btn-ghost">⋯</button></td></tr>`).join('\n')}
</tbody></table></div></div>`;
  return pageWrapper('Meetings', 'Schedule and manage meetings.', toolbarHtml + tableHtml, 'Calendar');
}

function pageMeetingDetail() {
  const header = `<div class="detail-header">
    <div class="detail-avatar" style="border-radius:var(--radius-lg);background:var(--color-primary-50);color:var(--color-primary-700)">📅</div>
    <div class="detail-info">
      <div class="detail-name">Q2 Planning Review</div>
      <div class="detail-role"><span class="badge badge-blue">Scheduled</span></div>
      <div class="detail-meta">
        <span class="detail-meta-item"><strong>Date:</strong> 16 May 2026</span>
        <span class="detail-meta-item"><strong>Time:</strong> 10:00 - 11:30 IST</span>
        <span class="detail-meta-item"><strong>Location:</strong> Conference Room A / Zoom</span>
      </div>
    </div>
    <div class="detail-actions">
      <button class="btn btn-primary">✏️ Edit</button>
      <button class="btn btn-danger">🗑 Cancel</button>
    </div>
  </div>`;

  const grid = `<div class="grid-2">
    ${card('Agenda', `<ol style="padding-left:20px;display:flex;flex-direction:column;gap:8px;font-size:14px">
      <li>Q2 goals and OKR review</li>
      <li>Pipeline status update</li>
      <li>Resource allocation</li>
      <li>Action items from Q1</li>
      <li>Open discussion</li>
    </ol>`)}
    ${card('Attendees', `
      <div style="display:flex;flex-direction:column;gap:10px;font-size:14px">
        <div style="display:flex;align-items:center;gap:8px"><div class="avatar" style="width:28px;height:28px;font-size:11px">AV</div>Amit Verma <span style="color:var(--color-neutral-400);margin-left:auto">Organizer</span></div>
        <div style="display:flex;align-items:center;gap:8px"><div class="avatar" style="width:28px;height:28px;font-size:11px">PS</div>Priya Sharma</div>
        <div style="display:flex;align-items:center;gap:8px"><div class="avatar" style="width:28px;height:28px;font-size:11px">SP</div>Sneha Patel</div>
        <div style="display:flex;align-items:center;gap:8px"><div class="avatar" style="width:28px;height:28px;font-size:11px">RK</div>Rajesh Kumar</div>
      </div>
    `)}
  </div>`;
  return pageWrapper('', '', header + grid, 'Calendar');
}

function pageNotFound() {
  return `  <div style="display:flex;min-height:100vh;align-items:center;justify-content:center;background:var(--color-neutral-100)">
    <div style="text-align:center;padding:20px">
      <div style="font-size:96px;font-weight:800;color:var(--color-neutral-200);line-height:1">404</div>
      <h1 style="font-size:24px;font-weight:700;color:var(--color-neutral-800);margin:16px 0 8px">Page Not Found</h1>
      <p style="font-size:14px;color:var(--color-neutral-500);margin-bottom:24px">The page you are looking for does not exist or has been moved.</p>
      <a href="dashboard.html" class="btn btn-primary">← Back to Dashboard</a>
    </div>
  </div>`;
}

function pageAuthLogin() {
  return `  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">B</div>
      <h1 class="auth-title">Welcome back</h1>
      <p class="auth-subtitle">Sign in to your BlueSuite CRM account</p>
      <div class="alert alert-error" style="display:none">Invalid email or password</div>
      <div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" placeholder="you@company.com" value="admin@bluesuite.in"></div>
      <div class="form-group"><label class="form-label">Password</label><input class="form-input" type="password" placeholder="Enter your password" value="••••••••"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <label class="checkbox"><input type="checkbox" checked> Remember me</label>
        <a href="forgot-password.html" style="font-size:13px">Forgot password?</a>
      </div>
      <a href="dashboard.html" class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:12px">Sign In</a>
      <div class="auth-footer">Don't have an account? <a href="signup.html">Sign up</a></div>
    </div>
  </div>`;
}

function pageAuthSignup() {
  return `  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">B</div>
      <h1 class="auth-title">Create your account</h1>
      <p class="auth-subtitle">Start your 14-day free trial</p>
      <div class="form-row">
        <div class="form-group"><label class="form-label">First Name</label><input class="form-input" placeholder="First name"></div>
        <div class="form-group"><label class="form-label">Last Name</label><input class="form-input" placeholder="Last name"></div>
      </div>
      <div class="form-group"><label class="form-label">Work Email</label><input class="form-input" type="email" placeholder="you@company.com"></div>
      <div class="form-group"><label class="form-label">Password</label><input class="form-input" type="password" placeholder="Create a password"></div>
      <div class="form-group"><label class="form-label">Company Name</label><input class="form-input" placeholder="Your company name"></div>
      <a href="dashboard.html" class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:12px">Create Account</a>
      <p style="font-size:12px;color:var(--color-neutral-400);text-align:center;margin-bottom:16px">By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
      <div class="auth-footer">Already have an account? <a href="login.html">Sign in</a></div>
    </div>
  </div>`;
}

function pageForgotPassword() {
  return `  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">B</div>
      <h1 class="auth-title">Reset your password</h1>
      <p class="auth-subtitle">Enter your email and we'll send you a reset link</p>
      <div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" placeholder="you@company.com"></div>
      <button class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:12px">Send Reset Link</button>
      <div class="auth-footer"><a href="login.html">← Back to sign in</a></div>
    </div>
  </div>`;
}

// ==================== GENERATION ====================

const pages = [
  ['login.html', pageAuthLogin],
  ['signup.html', pageAuthSignup],
  ['forgot-password.html', pageForgotPassword],
  ['dashboard.html', pageDashboard],
  ['contacts.html', pageContacts],
  ['contact-detail.html', pageContactDetail],
  ['contact-create.html', pageContactCreate],
  ['companies.html', pageCompanies],
  ['company-detail.html', pageCompanyDetail],
  ['company-create.html', pageCompanyCreate],
  ['deals.html', pageDeals],
  ['deal-detail.html', pageDealDetail],
  ['deal-create.html', pageDealCreate],
  ['leads.html', pageLeads],
  ['lead-detail.html', pageLeadDetail],
  ['lead-create.html', pageLeadCreate],
  ['tasks.html', pageTasks],
  ['task-detail.html', pageTaskDetail],
  ['task-create.html', pageTaskCreate],
  ['calendar.html', pageCalendar],
  ['meetings.html', pageMeetings],
  ['meeting-detail.html', pageMeetingDetail],
  ['campaigns.html', pageCampaigns],
  ['campaign-create.html', pageEmailCampaignCreate],
  ['email-template.html', pageEmailTemplate],
  ['reports.html', pageReports],
  ['settings.html', pageSettings],
  ['team.html', pageTeam],
  ['integrations.html', pageIntegrations],
  ['billing.html', pageBilling],
  ['security.html', pageSecurity],
  ['help.html', pageHelp],
  ['notifications.html', pageNotifications],
  ['404.html', pageNotFound],
];

mkdirSync(PAGES_DIR, { recursive: true });
console.log('Generating 34 pages (32 CRM + 2 extras)...');
let count = 0;
for (const [filename, generator] of pages) {
  writePage(filename, generator());
  count++;
}
console.log(`\n✅ Done! Generated ${count} pages in ${PAGES_DIR}`);
