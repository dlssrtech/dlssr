'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL, clearEnquiries, deleteEnquiry, getContent, getEnquiries, resetContent, saveContent, updateEnquiryStatus } from '../../lib/api';
import defaultContent from '../../server/data/defaultContent.json';

const ADMIN_SESSION_KEY = 'dlssr.next.admin.session';

function Toast({ message }) {
  return message ? <div className="toast">{message}</div> : null;
}

function TextInput({ label, value, onChange, type = 'text' }) {
  return <label>{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

export default function AdminPage() {
  const [passcode, setPasscode] = useState('');
  const [sessionPasscode, setSessionPasscode] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [content, setContent] = useState(defaultContent);
  const [enquiries, setEnquiries] = useState([]);
  const [toast, setToast] = useState('');

  const isLoggedIn = Boolean(sessionPasscode);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  }

  async function loadAdminData(activePasscode = sessionPasscode) {
    const [contentResponse, enquiriesResponse] = await Promise.all([
      getContent().catch(() => defaultContent),
      activePasscode ? getEnquiries(activePasscode).catch(() => []) : Promise.resolve([]),
    ]);
    setContent(contentResponse);
    setEnquiries(enquiriesResponse);
  }

  useEffect(() => {
    const stored = sessionStorage.getItem(ADMIN_SESSION_KEY) || '';
    if (stored) {
      setSessionPasscode(stored);
      loadAdminData(stored);
    }
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    try {
      await getEnquiries(passcode);
      sessionStorage.setItem(ADMIN_SESSION_KEY, passcode);
      setSessionPasscode(passcode);
      await loadAdminData(passcode);
      showToast('Admin opened');
    } catch (error) {
      showToast('Invalid passcode');
    }
  }

  function logout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setSessionPasscode('');
  }

  async function persist(nextContent, message = 'Content saved') {
    setContent(nextContent);
    const saved = await saveContent(nextContent, sessionPasscode);
    setContent(saved);
    showToast(message);
  }

  async function saveHero(event) {
    event.preventDefault();
    await persist(content);
  }

  function updateHero(field, value) {
    setContent((current) => ({ ...current, hero: { ...current.hero, [field]: value } }));
  }

  function updateContact(field, value) {
    setContent((current) => ({ ...current, contact: { ...current.contact, [field]: value } }));
  }

  async function saveEnquiryStatus(id, status) {
    await updateEnquiryStatus(id, status, sessionPasscode);
    await loadAdminData();
    showToast('Enquiry status updated');
  }

  async function removeEnquiry(id) {
    await deleteEnquiry(id, sessionPasscode);
    await loadAdminData();
    showToast('Enquiry deleted');
  }

  if (!isLoggedIn) {
    return (
      <main className="admin-screen login-screen">
        <form className="login-card" onSubmit={handleLogin}>
          <p className="eyebrow">DL SSR INFOTECH Admin</p>
          <h1>Manage Website Content, Blog & Enquiries</h1>
          <p>Use the backend admin passcode. The development default is <strong>admin123</strong>; set <code>ADMIN_PASSCODE</code> for production.</p>
          <TextInput label="Admin Passcode" type="password" value={passcode} onChange={setPasscode} />
          <button className="admin-button" type="submit">Open Admin</button>
          <a href="/">← Back to website</a>
        </form>
        <Toast message={toast} />
      </main>
    );
  }

  return (
    <main className="admin-screen dashboard">
      <aside className="sidebar">
        <a className="brand" href="/"><span className="brand-mark">DL</span><span>DL SSR Admin</span></a>
        <nav aria-label="Admin sections">
          {['overview', 'content', 'pages', 'services', 'blog', 'enquiries'].map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab[0].toUpperCase() + tab.slice(1)}</button>)}
        </nav>
        <button className="logout" onClick={logout}>Logout</button>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div><p className="eyebrow">Next.js + Node.js Dashboard</p><h1>Website Manager</h1></div>
          <div className="header-actions"><a className="btn btn-primary" href="/" target="_blank">Preview Site</a><button className="admin-button danger" onClick={async () => { const next = await resetContent(sessionPasscode); setContent(next); showToast('Content reset'); }}>Reset Content</button></div>
        </header>

        {activeTab === 'overview' && <section><div className="stats-cards"><article><strong>{enquiries.length}</strong><span>Total Enquiries</span></article><article><strong>{enquiries.filter((item) => item.status === 'New').length}</strong><span>New Enquiries</span></article><article><strong>{content.pages.length}</strong><span>Managed Pages</span></article><article><strong>{content.blogPosts.length}</strong><span>Blog Posts</span></article></div><div className="notice"><h2>Backend connected</h2><p>This admin uses Next.js for the interface and the Node.js API at <strong>{API_BASE_URL}</strong> for content and enquiry storage.</p></div></section>}

        {activeTab === 'content' && <form className="admin-card grid-form" onSubmit={saveHero}><h2>Hero & Contact Content</h2><TextInput label="Hero Eyebrow" value={content.hero.eyebrow} onChange={(value) => updateHero('eyebrow', value)} /><label>Hero Headline<textarea rows="2" value={content.hero.headline} onChange={(event) => updateHero('headline', event.target.value)} /></label><label className="full">Hero Subheadline<textarea rows="3" value={content.hero.subheadline} onChange={(event) => updateHero('subheadline', event.target.value)} /></label><TextInput label="Primary CTA" value={content.hero.primaryCta} onChange={(value) => updateHero('primaryCta', value)} /><TextInput label="Secondary CTA" value={content.hero.secondaryCta} onChange={(value) => updateHero('secondaryCta', value)} /><TextInput label="Demo CTA" value={content.hero.demoCta} onChange={(value) => updateHero('demoCta', value)} /><TextInput label="Phone" value={content.contact.phone} onChange={(value) => updateContact('phone', value)} /><TextInput label="Email" type="email" value={content.contact.email} onChange={(value) => updateContact('email', value)} /><TextInput label="Office Address" value={content.contact.address} onChange={(value) => updateContact('address', value)} /><TextInput label="WhatsApp Number" value={content.contact.whatsapp} onChange={(value) => updateContact('whatsapp', value)} /><label className="full">Trust Items<textarea rows="4" value={content.trust.join('\n')} onChange={(event) => setContent((current) => ({ ...current, trust: event.target.value.split('\n').filter(Boolean) }))} /></label><button className="admin-button" type="submit">Save Website Content</button></form>}

        {activeTab === 'pages' && <section className="admin-card"><div className="section-title"><h2>Manage Pages</h2><button className="admin-button" onClick={() => setContent((current) => ({ ...current, pages: [...current.pages, { title: 'New Page', slug: '#new-page', showInNav: false, status: 'Draft' }] }))}>Add Page</button></div><div className="table-wrap"><table><thead><tr><th>Title</th><th>Slug</th><th>Nav</th><th>Status</th><th /></tr></thead><tbody>{content.pages.map((page, index) => <tr key={`${page.slug}-${index}`}><td><input value={page.title} onChange={(event) => setContent((current) => ({ ...current, pages: current.pages.map((item, i) => i === index ? { ...item, title: event.target.value } : item) }))} /></td><td><input value={page.slug} onChange={(event) => setContent((current) => ({ ...current, pages: current.pages.map((item, i) => i === index ? { ...item, slug: event.target.value } : item) }))} /></td><td><select value={String(page.showInNav)} onChange={(event) => setContent((current) => ({ ...current, pages: current.pages.map((item, i) => i === index ? { ...item, showInNav: event.target.value === 'true' } : item) }))}><option value="true">Show</option><option value="false">Hide</option></select></td><td><select value={page.status} onChange={(event) => setContent((current) => ({ ...current, pages: current.pages.map((item, i) => i === index ? { ...item, status: event.target.value } : item) }))}><option>Published</option><option>Draft</option></select></td><td><button className="admin-button danger" onClick={() => setContent((current) => ({ ...current, pages: current.pages.filter((_, i) => i !== index) }))}>Delete</button></td></tr>)}</tbody></table></div><button className="admin-button" onClick={() => persist(content, 'Pages saved')}>Save Pages</button></section>}

        {activeTab === 'services' && <section className="admin-card"><div className="section-title"><h2>Manage Services</h2><button className="admin-button" onClick={() => setContent((current) => ({ ...current, services: [...current.services, { icon: '✨', title: 'New Service', summary: 'Describe this service.' }] }))}>Add Service</button></div><div className="table-wrap"><table><thead><tr><th>Icon</th><th>Title</th><th>Summary</th><th /></tr></thead><tbody>{content.services.map((service, index) => <tr key={`${service.title}-${index}`}><td><input value={service.icon} onChange={(event) => setContent((current) => ({ ...current, services: current.services.map((item, i) => i === index ? { ...item, icon: event.target.value } : item) }))} /></td><td><input value={service.title} onChange={(event) => setContent((current) => ({ ...current, services: current.services.map((item, i) => i === index ? { ...item, title: event.target.value } : item) }))} /></td><td><textarea rows="2" value={service.summary} onChange={(event) => setContent((current) => ({ ...current, services: current.services.map((item, i) => i === index ? { ...item, summary: event.target.value } : item) }))} /></td><td><button className="admin-button danger" onClick={() => setContent((current) => ({ ...current, services: current.services.filter((_, i) => i !== index) }))}>Delete</button></td></tr>)}</tbody></table></div><button className="admin-button" onClick={() => persist(content, 'Services saved')}>Save Services</button></section>}

        {activeTab === 'blog' && <section className="admin-card"><div className="section-title"><h2>Manage Blog Posts</h2><button className="admin-button" onClick={() => setContent((current) => ({ ...current, blogPosts: [{ id: `post-${Date.now()}`, title: 'New Blog Post', category: 'News', excerpt: 'Short summary for the blog card.', content: 'Write the full article content here.', status: 'Draft', date: new Date().toISOString().slice(0, 10) }, ...current.blogPosts] }))}>Add Blog Post</button></div><div className="post-editor">{content.blogPosts.map((post, index) => <article className="post-card" key={post.id}><TextInput label="Title" value={post.title} onChange={(value) => setContent((current) => ({ ...current, blogPosts: current.blogPosts.map((item, i) => i === index ? { ...item, title: value } : item) }))} /><TextInput label="Category" value={post.category} onChange={(value) => setContent((current) => ({ ...current, blogPosts: current.blogPosts.map((item, i) => i === index ? { ...item, category: value } : item) }))} /><TextInput label="Date" type="date" value={post.date} onChange={(value) => setContent((current) => ({ ...current, blogPosts: current.blogPosts.map((item, i) => i === index ? { ...item, date: value } : item) }))} /><label>Status<select value={post.status} onChange={(event) => setContent((current) => ({ ...current, blogPosts: current.blogPosts.map((item, i) => i === index ? { ...item, status: event.target.value } : item) }))}><option>Published</option><option>Draft</option></select></label><label className="full">Excerpt<textarea rows="2" value={post.excerpt} onChange={(event) => setContent((current) => ({ ...current, blogPosts: current.blogPosts.map((item, i) => i === index ? { ...item, excerpt: event.target.value } : item) }))} /></label><label className="full">Content<textarea rows="5" value={post.content} onChange={(event) => setContent((current) => ({ ...current, blogPosts: current.blogPosts.map((item, i) => i === index ? { ...item, content: event.target.value } : item) }))} /></label><button className="admin-button danger" onClick={() => setContent((current) => ({ ...current, blogPosts: current.blogPosts.filter((_, i) => i !== index) }))}>Delete Post</button></article>)}</div><button className="admin-button" onClick={() => persist(content, 'Blog saved')}>Save Blog</button></section>}

        {activeTab === 'enquiries' && <section className="admin-card"><div className="section-title"><h2>Stored Enquiries</h2><div><a className="btn btn-primary" href={`${API_BASE_URL}/api/enquiries/export.csv?passcode=${encodeURIComponent(sessionPasscode)}`}>Export CSV</a><button className="admin-button danger" onClick={async () => { await clearEnquiries(sessionPasscode); await loadAdminData(); showToast('Enquiries cleared'); }}>Clear All</button></div></div><div className="table-wrap"><table><thead><tr><th>Date</th><th>Source</th><th>Contact Details</th><th>Status</th><th /></tr></thead><tbody>{enquiries.length === 0 ? <tr><td colSpan="5">No enquiries stored yet.</td></tr> : enquiries.map((enquiry) => <tr key={enquiry.id}><td>{new Date(enquiry.createdAt).toLocaleString()}</td><td>{enquiry.source}</td><td>{Object.entries(enquiry.fields || {}).map(([key, value]) => <p key={key}><strong>{key}:</strong> {value}</p>)}</td><td><select value={enquiry.status} onChange={(event) => saveEnquiryStatus(enquiry.id, event.target.value)}><option>New</option><option>Contacted</option><option>Closed</option></select></td><td><button className="admin-button danger" onClick={() => removeEnquiry(enquiry.id)}>Delete</button></td></tr>)}</tbody></table></div></section>}
      </div>
      <Toast message={toast} />
    </main>
  );
}
