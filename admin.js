const ADMIN_PASSCODE = 'admin123';
const loginScreen = document.querySelector('[data-login-screen]');
const loginForm = document.querySelector('[data-login-form]');
const dashboard = document.querySelector('[data-dashboard]');
const tabButtons = document.querySelectorAll('[data-tab-button]');
const tabPanels = document.querySelectorAll('[data-tab-panel]');
let content = window.DLSSR_CMS.getContent();

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;',
  }[character]));
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function isLoggedIn() {
  return sessionStorage.getItem(window.DLSSR_CMS.SESSION_KEY) === 'true';
}

function setLoggedIn(value) {
  if (value) sessionStorage.setItem(window.DLSSR_CMS.SESSION_KEY, 'true');
  else sessionStorage.removeItem(window.DLSSR_CMS.SESSION_KEY);
  loginScreen.classList.toggle('is-hidden', value);
  dashboard.classList.toggle('is-hidden', !value);
}

function activateTab(tabName) {
  tabButtons.forEach((button) => button.classList.toggle('active', button.dataset.tabButton === tabName));
  tabPanels.forEach((panel) => panel.classList.toggle('is-hidden', panel.dataset.tabPanel !== tabName));
}

function saveContentPatch(patch, message = 'Content saved') {
  window.DLSSR_CMS.saveContent(patch);
  content = window.DLSSR_CMS.getContent();
  renderAll();
  showToast(message);
}

function renderStats() {
  const enquiries = window.DLSSR_CMS.getEnquiries();
  document.querySelector('[data-stat="enquiries"]').textContent = enquiries.length;
  document.querySelector('[data-stat="newEnquiries"]').textContent = enquiries.filter((item) => item.status === 'New').length;
  document.querySelector('[data-stat="pages"]').textContent = content.pages.length;
  document.querySelector('[data-stat="posts"]').textContent = content.blogPosts.length;
}

function renderContentForm() {
  const form = document.querySelector('[data-content-form]');
  form.eyebrow.value = content.hero.eyebrow;
  form.headline.value = content.hero.headline;
  form.subheadline.value = content.hero.subheadline;
  form.primaryCta.value = content.hero.primaryCta;
  form.secondaryCta.value = content.hero.secondaryCta;
  form.demoCta.value = content.hero.demoCta;
  form.phone.value = content.contact.phone;
  form.email.value = content.contact.email;
  form.address.value = content.contact.address;
  form.whatsapp.value = content.contact.whatsapp;
  form.trust.value = content.trust.join('\n');
}

function renderPages() {
  const table = document.querySelector('[data-pages-table]');
  table.innerHTML = content.pages
    .map(
      (page, index) => `
      <tr data-page-row="${index}">
        <td><input name="title" value="${escapeHtml(page.title)}" /></td>
        <td><input name="slug" value="${escapeHtml(page.slug)}" /></td>
        <td><select name="showInNav"><option value="true" ${page.showInNav ? 'selected' : ''}>Show</option><option value="false" ${!page.showInNav ? 'selected' : ''}>Hide</option></select></td>
        <td><select name="status"><option ${page.status === 'Published' ? 'selected' : ''}>Published</option><option ${page.status === 'Draft' ? 'selected' : ''}>Draft</option></select></td>
        <td><button class="danger" data-delete-page="${index}" type="button">Delete</button></td>
      </tr>`,
    )
    .join('');
}

function renderServices() {
  const table = document.querySelector('[data-services-table]');
  table.innerHTML = content.services
    .map(
      (service, index) => `
      <tr data-service-row="${index}">
        <td><input name="icon" value="${escapeHtml(service.icon)}" /></td>
        <td><input name="title" value="${escapeHtml(service.title)}" /></td>
        <td><textarea name="summary" rows="2">${escapeHtml(service.summary)}</textarea></td>
        <td><button class="danger" data-delete-service="${index}" type="button">Delete</button></td>
      </tr>`,
    )
    .join('');
}

function renderPosts() {
  const editor = document.querySelector('[data-post-editor]');
  editor.innerHTML = content.blogPosts
    .map(
      (post, index) => `
      <article class="post-card" data-post-row="${index}">
        <label>Title<input name="title" value="${escapeHtml(post.title)}" /></label>
        <label>Category<input name="category" value="${escapeHtml(post.category)}" /></label>
        <label>Date<input type="date" name="date" value="${escapeHtml(post.date)}" /></label>
        <label>Status<select name="status"><option ${post.status === 'Published' ? 'selected' : ''}>Published</option><option ${post.status === 'Draft' ? 'selected' : ''}>Draft</option></select></label>
        <label class="full">Excerpt<textarea name="excerpt" rows="2">${escapeHtml(post.excerpt)}</textarea></label>
        <label class="full">Content<textarea name="content" rows="5">${escapeHtml(post.content)}</textarea></label>
        <button class="danger" data-delete-post="${index}" type="button">Delete Post</button>
      </article>`,
    )
    .join('');
}

function formatFields(fields = {}) {
  return Object.entries(fields)
    .filter(([, value]) => value)
    .map(([key, value]) => `<strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}`)
    .join('<br />');
}

function renderEnquiries() {
  const table = document.querySelector('[data-enquiries-table]');
  const enquiries = window.DLSSR_CMS.getEnquiries();
  if (!enquiries.length) {
    table.innerHTML = '<tr><td colspan="5">No enquiries stored yet. Submit a form on the website to see it here.</td></tr>';
    return;
  }

  table.innerHTML = enquiries
    .map(
      (enquiry) => `
      <tr>
        <td>${new Date(enquiry.createdAt).toLocaleString()}</td>
        <td>${escapeHtml(enquiry.source)}</td>
        <td class="enquiry-fields">${formatFields(enquiry.fields)}</td>
        <td><select data-enquiry-status="${escapeHtml(enquiry.id)}"><option ${enquiry.status === 'New' ? 'selected' : ''}>New</option><option ${enquiry.status === 'Contacted' ? 'selected' : ''}>Contacted</option><option ${enquiry.status === 'Closed' ? 'selected' : ''}>Closed</option></select></td>
        <td><button class="danger" data-delete-enquiry="${escapeHtml(enquiry.id)}" type="button">Delete</button></td>
      </tr>`,
    )
    .join('');
}

function renderAll() {
  renderStats();
  renderContentForm();
  renderPages();
  renderServices();
  renderPosts();
  renderEnquiries();
}

function collectRows(selector, fields) {
  return [...document.querySelectorAll(selector)].map((row) => {
    const next = {};
    fields.forEach((field) => {
      const input = row.querySelector(`[name="${field}"]`);
      next[field] = input?.value.trim() || '';
    });
    return next;
  });
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (loginForm.passcode.value === ADMIN_PASSCODE) {
    setLoggedIn(true);
    renderAll();
  } else {
    showToast('Invalid passcode');
  }
});

document.querySelector('[data-logout]').addEventListener('click', () => setLoggedIn(false));

tabButtons.forEach((button) => button.addEventListener('click', () => activateTab(button.dataset.tabButton)));

document.querySelector('[data-content-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  saveContentPatch({
    hero: {
      eyebrow: form.eyebrow.value.trim(),
      headline: form.headline.value.trim(),
      subheadline: form.subheadline.value.trim(),
      primaryCta: form.primaryCta.value.trim(),
      secondaryCta: form.secondaryCta.value.trim(),
      demoCta: form.demoCta.value.trim(),
    },
    contact: {
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      address: form.address.value.trim(),
      whatsapp: form.whatsapp.value.replace(/[^\d]/g, ''),
    },
    trust: form.trust.value.split('\n').map((item) => item.trim()).filter(Boolean),
  });
});

document.querySelector('[data-add-page]').addEventListener('click', () => {
  content.pages.push({ title: 'New Page', slug: '#new-page', showInNav: false, status: 'Draft' });
  renderPages();
});

document.querySelector('[data-save-pages]').addEventListener('click', () => {
  const pages = [...document.querySelectorAll('[data-page-row]')].map((row) => ({
    title: row.querySelector('[name="title"]').value.trim(),
    slug: row.querySelector('[name="slug"]').value.trim(),
    showInNav: row.querySelector('[name="showInNav"]').value === 'true',
    status: row.querySelector('[name="status"]').value,
  }));
  saveContentPatch({ pages }, 'Pages saved');
});

document.querySelector('[data-add-service]').addEventListener('click', () => {
  content.services.push({ icon: '✨', title: 'New Service', summary: 'Describe this service.' });
  renderServices();
});

document.querySelector('[data-save-services]').addEventListener('click', () => {
  const services = collectRows('[data-service-row]', ['icon', 'title', 'summary']);
  saveContentPatch({ services }, 'Services saved');
});

document.querySelector('[data-add-post]').addEventListener('click', () => {
  content.blogPosts.unshift({
    id: `post-${Date.now()}`,
    title: 'New Blog Post',
    category: 'News',
    excerpt: 'Short summary for the blog card.',
    content: 'Write the full article content here.',
    status: 'Draft',
    date: new Date().toISOString().slice(0, 10),
  });
  renderPosts();
});

document.querySelector('[data-save-posts]').addEventListener('click', () => {
  const blogPosts = [...document.querySelectorAll('[data-post-row]')].map((row, index) => ({
    id: content.blogPosts[index]?.id || `post-${Date.now()}-${index}`,
    title: row.querySelector('[name="title"]').value.trim(),
    category: row.querySelector('[name="category"]').value.trim(),
    date: row.querySelector('[name="date"]').value,
    status: row.querySelector('[name="status"]').value,
    excerpt: row.querySelector('[name="excerpt"]').value.trim(),
    content: row.querySelector('[name="content"]').value.trim(),
  }));
  saveContentPatch({ blogPosts }, 'Blog saved');
});

document.addEventListener('click', (event) => {
  const deletePage = event.target.closest('[data-delete-page]');
  const deleteService = event.target.closest('[data-delete-service]');
  const deletePost = event.target.closest('[data-delete-post]');
  const deleteEnquiry = event.target.closest('[data-delete-enquiry]');

  if (deletePage) {
    content.pages.splice(Number(deletePage.dataset.deletePage), 1);
    renderPages();
  }
  if (deleteService) {
    content.services.splice(Number(deleteService.dataset.deleteService), 1);
    renderServices();
  }
  if (deletePost) {
    content.blogPosts.splice(Number(deletePost.dataset.deletePost), 1);
    renderPosts();
  }
  if (deleteEnquiry) {
    const enquiries = window.DLSSR_CMS.getEnquiries().filter((item) => item.id !== deleteEnquiry.dataset.deleteEnquiry);
    window.DLSSR_CMS.saveEnquiries(enquiries);
    renderAll();
    showToast('Enquiry deleted');
  }
});

document.addEventListener('change', (event) => {
  const statusSelect = event.target.closest('[data-enquiry-status]');
  if (!statusSelect) return;
  const enquiries = window.DLSSR_CMS.getEnquiries().map((item) =>
    item.id === statusSelect.dataset.enquiryStatus ? { ...item, status: statusSelect.value } : item,
  );
  window.DLSSR_CMS.saveEnquiries(enquiries);
  renderStats();
  showToast('Enquiry status updated');
});

document.querySelector('[data-export-enquiries]').addEventListener('click', () => {
  const enquiries = window.DLSSR_CMS.getEnquiries();
  const rows = [['ID', 'Date', 'Source', 'Status', 'Fields']].concat(
    enquiries.map((item) => [
      item.id,
      item.createdAt,
      item.source,
      item.status,
      Object.entries(item.fields || {}).map(([key, value]) => `${key}: ${value}`).join(' | '),
    ]),
  );
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'dlssr-enquiries.csv';
  link.click();
  URL.revokeObjectURL(link.href);
});

document.querySelector('[data-clear-enquiries]').addEventListener('click', () => {
  if (!confirm('Clear all stored enquiries?')) return;
  window.DLSSR_CMS.saveEnquiries([]);
  renderAll();
  showToast('All enquiries cleared');
});

document.querySelector('[data-reset-content]').addEventListener('click', () => {
  if (!confirm('Reset all website content and blog posts to the default version?')) return;
  content = window.DLSSR_CMS.resetContent();
  renderAll();
  showToast('Content reset');
});

setLoggedIn(isLoggedIn());
if (isLoggedIn()) renderAll();
