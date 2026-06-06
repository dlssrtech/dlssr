'use client';

import { useState } from 'react';
import { createEnquiry } from '../lib/api';

const industries = ['Healthcare', 'Education', 'Finance', 'E-commerce', 'Manufacturing', 'Logistics', 'Real Estate', 'Startups', 'Government Projects'];
const portfolio = ['Corporate Websites', 'Mobile Applications', 'CRM Systems', 'HRM Platforms', 'FinTech Products', 'Blockchain Solutions', 'Gaming Projects', 'Marketing Campaign Results'];
const processSteps = ['Requirement Analysis', 'UI/UX Design', 'Development', 'Testing & Quality Assurance', 'Deployment', 'Support & Growth'];
const faqs = [
  ['How long does development take?', 'Project timelines vary based on complexity.'],
  ['Do you provide support after launch?', 'Yes, ongoing maintenance and support are available.'],
  ['Can you handle complete digital transformation?', 'Absolutely. We offer end-to-end IT services.'],
  ['Do you work with startups?', 'Yes, from MVP development to enterprise solutions.'],
];

function LeadForm({ source, fields, buttonText, compact = false, onSubmitted }) {
  const [status, setStatus] = useState('idle');

  async function submitForm(event) {
    event.preventDefault();
    setStatus('submitting');
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      await createEnquiry({ source, page: 'DL SSR INFOTECH Website', fields: data });
      setStatus('submitted');
      event.currentTarget.reset();
      onSubmitted?.();
      setTimeout(() => setStatus('idle'), 1600);
    } catch (error) {
      setStatus('error');
    }
  }

  return (
    <form className={`lead-form ${compact ? 'compact' : ''}`} onSubmit={submitForm}>
      {fields.map((field) => (
        <label key={field.name}>
          {field.label}
          {field.type === 'select' ? (
            <select name={field.name} required={field.required} defaultValue="">
              <option value="" disabled>{field.placeholder || 'Select an option'}</option>
              {field.options.map((option) => <option key={option}>{option}</option>)}
            </select>
          ) : (
            <input type={field.type} name={field.name} placeholder={field.placeholder} required={field.required} />
          )}
        </label>
      ))}
      <button className="btn btn-primary form-submit" type="submit" disabled={status === 'submitting'}>
        {status === 'submitted' ? 'Submitted ✓' : status === 'submitting' ? 'Sending...' : buttonText}
      </button>
      {status === 'error' && <p className="form-error">Unable to submit right now. Please try again.</p>}
    </form>
  );
}

export default function LandingPage({ content }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const publishedPosts = content.blogPosts.filter((post) => post.status === 'Published');
  const navPages = content.pages.filter((page) => page.showInNav && page.status === 'Published');
  const phoneLink = content.contact.phone.replace(/[^+\d]/g, '');
  const serviceOptions = content.services.map((service) => service.title);

  return (
    <>
      <header className="site-header" id="home">
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="#home" aria-label="DL SSR INFOTECH home"><span className="brand-mark">DL</span><span>DL SSR INFOTECH</span></a>
          <div className="nav-links">
            {navPages.map((page) => <a key={page.slug} href={page.slug}>{page.title}</a>)}
            <a className="nav-cta" href="#quote">Get Quote</a>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero section" aria-labelledby="hero-title">
          <div className="hero-bg" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">{content.hero.eyebrow}</p>
              <h1 id="hero-title">{content.hero.headline}</h1>
              <p className="hero-subtitle">{content.hero.subheadline}</p>
              <div className="hero-actions" aria-label="Primary calls to action">
                <a className="btn btn-primary" href="#quote">{content.hero.primaryCta}</a>
                <a className="btn btn-secondary" href="#quote">{content.hero.secondaryCta}</a>
                <a className="btn btn-ghost" href="#process">{content.hero.demoCta}</a>
              </div>
              <div className="trust-strip" aria-label="Trust elements">
                {content.trust.map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>
            <aside className="lead-card" id="quote" aria-labelledby="lead-form-title">
              <p className="card-kicker">Free proposal</p>
              <h2 id="lead-form-title">Start Your Project</h2>
              <LeadForm
                source="Hero proposal"
                buttonText="Get Free Proposal"
                fields={[
                  { name: 'name', label: 'Name', type: 'text', placeholder: 'Your full name', required: true },
                  { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true },
                  { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 555 000 0000', required: true },
                  { name: 'service', label: 'Service Required', type: 'select', required: true, options: serviceOptions, placeholder: 'Select a service' },
                ]}
              />
              <p className="form-note">No spam. A solution consultant will contact you shortly.</p>
            </aside>
          </div>
        </section>

        <section className="section services" id="services" aria-labelledby="services-title">
          <div className="container">
            <div className="section-heading"><p className="eyebrow">Services overview</p><h2 id="services-title">Everything You Need to Launch, Automate, and Grow</h2><p>Build revenue-ready digital products with one accountable technology partner.</p></div>
            <div className="card-grid services-grid">
              {content.services.map((service) => <article key={service.title}><span className="icon">{service.icon}</span><h3>{service.title}</h3><p>{service.summary}</p></article>)}
            </div>
            <div className="center-cta"><a className="btn btn-primary" href="#quote">Discuss Your Project</a></div>
          </div>
        </section>

        <section className="section why" aria-labelledby="why-title">
          <div className="container split-layout">
            <div><p className="eyebrow">Why choose DL SSR INFOTECH</p><h2 id="why-title">Strategic Execution for Every Stage of Growth</h2><p>From first discovery call to post-launch optimization, our team aligns technology, design, and marketing around measurable business outcomes.</p><a className="btn btn-secondary" href="#offer">Claim Free Consultation</a></div>
            <div className="feature-list">
              {['Expertise Across Industries|Healthcare, Finance, Education, Retail, Real Estate', 'End-to-End Solutions|From Idea → Design → Development → Marketing', 'Agile Development Process|Fast delivery with continuous improvements', 'Affordable Pricing|Enterprise quality at competitive cost', 'Dedicated Project Manager|A single point of contact for complete clarity', '24/7 Support|Reliable technical assistance when you need it'].map((item) => {
                const [title, summary] = item.split('|');
                return <div key={title}><strong>{title}</strong><span>{summary}</span></div>;
              })}
            </div>
          </div>
        </section>

        <section className="section process" id="process" aria-labelledby="process-title">
          <div className="container"><div className="section-heading"><p className="eyebrow">Our development process</p><h2 id="process-title">A Proven Timeline from Requirement to Growth</h2></div><ol className="timeline">{processSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong></li>)}</ol><div className="center-cta"><a className="btn btn-primary" href="#quote">Schedule a Demo</a></div></div>
        </section>

        <section className="section portfolio" id="portfolio" aria-labelledby="portfolio-title">
          <div className="container"><div className="section-heading"><p className="eyebrow">Featured portfolio</p><h2 id="portfolio-title">Digital Products and Campaigns Built for Results</h2></div><div className="portfolio-grid">{portfolio.map((item) => <article key={item}><div className="mockup" /><h3>{item}</h3></article>)}</div><div className="center-cta"><a className="btn btn-secondary" href="#quote">View Full Portfolio</a></div></div>
        </section>

        <section className="section industries" aria-labelledby="industries-title"><div className="container"><div className="section-heading"><p className="eyebrow">Industries we serve</p><h2 id="industries-title">Domain Experience Across High-Growth Markets</h2></div><div className="pill-list">{industries.map((industry) => <span key={industry}>{industry}</span>)}</div></div></section>

        <section className="section testimonials" aria-labelledby="testimonials-title"><div className="container"><div className="section-heading"><p className="eyebrow">Client testimonials</p><h2 id="testimonials-title">Trusted by Teams Ready to Grow</h2></div><div className="testimonial-grid">{['DL SSR INFOTECH transformed our business with an amazing CRM solution.', 'Professional team, timely delivery, and excellent support.', 'Our SEO traffic increased significantly within months.'].map((quote) => <blockquote key={quote}><span>★★★★★</span><p>“{quote}”</p></blockquote>)}</div></div></section>

        <section className="section stats" aria-label="Results and achievements"><div className="container stats-grid"><div><strong>100+</strong><span>Projects Completed</span></div><div><strong>50+</strong><span>Happy Clients</span></div><div><strong>15+</strong><span>Industries Served</span></div><div><strong>98%</strong><span>Client Satisfaction</span></div></div></section>

        <section className="section blog" id="blog" aria-labelledby="blog-title"><div className="container"><div className="section-heading"><p className="eyebrow">Blog & insights</p><h2 id="blog-title">Latest Digital Growth Resources</h2><p>Publish SEO-friendly articles from the admin panel to educate prospects and generate organic leads.</p></div><div className="blog-grid">{publishedPosts.map((post) => <article className="blog-card" key={post.id}><p>{post.category} • {post.date}</p><h3>{post.title}</h3><span>{post.excerpt}</span></article>)}</div><div className="center-cta"><a className="btn btn-primary" href="#quote">Plan My Growth Strategy</a></div></div></section>

        <section className="section offer" id="offer" aria-labelledby="offer-title"><div className="container offer-card"><div><p className="eyebrow">Special offer</p><h2 id="offer-title">Free Business Consultation</h2><p>Get a practical growth roadmap tailored to your product, website, or marketing goals.</p><ul className="check-list"><li>Website Audit</li><li>SEO Audit</li><li>App Strategy Session</li><li>Digital Growth Roadmap</li></ul></div><LeadForm compact source="Consultation offer" buttonText="Claim Free Consultation" fields={[{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'phone', label: 'Phone', type: 'tel', required: true }, { name: 'business', label: 'Business Name', type: 'text' }]} /></div></section>

        <section className="section faq" id="faq" aria-labelledby="faq-title"><div className="container"><div className="section-heading"><p className="eyebrow">FAQ</p><h2 id="faq-title">Answers Before We Start</h2></div><div className="faq-list">{faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></section>

        <section className="section final-cta" aria-labelledby="final-cta-title"><div className="container"><h2 id="final-cta-title">Ready to Build Your Next Digital Success Story?</h2><p>Let&apos;s discuss your project and create something exceptional.</p><div className="hero-actions"><a className="btn btn-primary" href="#quote">Get Free Quote</a><a className="btn btn-secondary" href="#quote">Schedule Meeting</a><a className="btn btn-ghost" href={`tel:${phoneLink}`}>Call Now</a><a className="btn btn-ghost" href={`https://wa.me/${content.contact.whatsapp}`}>WhatsApp Us</a></div></div></section>
      </main>

      <footer className="footer"><div className="container footer-grid"><div><a className="brand" href="#home"><span className="brand-mark">DL</span><span>DL SSR INFOTECH</span></a><p>Convert visitors into leads, meetings, and long-term clients with digital solutions that scale.</p><LeadForm compact source="Newsletter subscription" buttonText="Subscribe" fields={[{ name: 'email', label: 'Newsletter Email', type: 'email', placeholder: 'you@example.com', required: true }]} /></div><div><h3>Quick Links</h3>{navPages.map((page) => <a key={page.slug} href={page.slug}>{page.title}</a>)}<a href="/admin">Admin</a></div><div><h3>Services</h3>{content.services.slice(0, 8).map((service) => <a key={service.title} href="#services">{service.title}</a>)}</div><div><h3>Contact Information</h3><p>Phone: {content.contact.phone}</p><p>Email: {content.contact.email}</p><p>Office Address: {content.contact.address}</p><div className="socials"><a href="#">LinkedIn</a><a href="#">Facebook</a><a href="#">Instagram</a><a href="#">YouTube</a></div></div></div></footer>

      <button className="sticky-callback" type="button" onClick={() => setDrawerOpen(true)}>Instant Callback Request</button>
      <a className="whatsapp" href={`https://wa.me/${content.contact.whatsapp}`} aria-label="Chat on WhatsApp">☘</a>
      <button className="chatbot" type="button" aria-label="Open chatbot" onClick={() => setDrawerOpen(true)}>💬</button>

      {drawerOpen && <div className="quote-drawer is-open" aria-hidden="false"><div className="quote-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title"><button className="close-drawer" type="button" aria-label="Close quote form" onClick={() => setDrawerOpen(false)}>×</button><p className="eyebrow">Multi-step quote form</p><h2 id="drawer-title">Tell Us About Your Project</h2><LeadForm source="Multi-step quote" buttonText="Request Callback" onSubmitted={() => setDrawerOpen(false)} fields={[{ name: 'service', label: 'What do you need?', type: 'select', required: true, options: ['Website or eCommerce', 'Mobile App', 'CRM / HRM', 'Marketing / SEO'] }, { name: 'budget', label: 'Budget Range', type: 'select', required: true, options: ['Need guidance', 'Under $5k', '$5k - $20k', '$20k+'] }, { name: 'email', label: 'Your Email', type: 'email', required: true }]} /></div></div>}
    </>
  );
}
