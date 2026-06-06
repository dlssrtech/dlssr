const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const drawer = document.querySelector('.quote-drawer');
const exitPopup = document.querySelector('.exit-popup');
const openQuoteButtons = document.querySelectorAll('[data-open-quote], .chatbot');
let exitShown = sessionStorage.getItem('exit-popup-shown') === 'true';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;',
  }[character]));
}

function getNestedValue(source, path) {
  return path.split('.').reduce((value, key) => value?.[key], source);
}

function renderManagedContent() {
  if (!window.DLSSR_CMS) return;

  const content = window.DLSSR_CMS.getContent();

  document.querySelectorAll('[data-cms]').forEach((element) => {
    const value = getNestedValue(content, element.dataset.cms);
    if (value) element.textContent = value;
  });

  const navContainer = document.querySelector('[data-render="nav-pages"]');
  if (navContainer) {
    const navLinksHtml = content.pages
      .filter((page) => page.showInNav && page.status === 'Published')
      .map((page) => `<a href="${escapeHtml(page.slug)}">${escapeHtml(page.title)}</a>`)
      .join('');
    navContainer.innerHTML = `${navLinksHtml}<a class="nav-cta" href="#quote">Get Quote</a>`;
  }

  const trustStrip = document.querySelector('[data-render="trust"]');
  if (trustStrip) {
    trustStrip.innerHTML = content.trust.map((item) => `<span>${escapeHtml(item)}</span>`).join('');
  }

  const servicesGrid = document.querySelector('[data-render="services"]');
  if (servicesGrid) {
    servicesGrid.innerHTML = content.services
      .map(
        (service) =>
          `<article><span class="icon">${escapeHtml(service.icon)}</span><h3>${escapeHtml(service.title)}</h3><p>${escapeHtml(service.summary)}</p></article>`,
      )
      .join('');
  }

  const blogGrid = document.querySelector('[data-render="blog-posts"]');
  if (blogGrid) {
    const publishedPosts = content.blogPosts.filter((post) => post.status === 'Published');
    blogGrid.innerHTML = publishedPosts
      .map(
        (post) => `
          <article class="blog-card">
            <p>${escapeHtml(post.category)} • ${escapeHtml(post.date)}</p>
            <h3>${escapeHtml(post.title)}</h3>
            <span>${escapeHtml(post.excerpt)}</span>
          </article>`,
      )
      .join('');
  }

  document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
    link.href = `https://wa.me/${content.contact.whatsapp}`;
  });
  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.href = `tel:${content.contact.phone.replace(/[^+\d]/g, '')}`;
  });
}

navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navLinks?.classList.toggle('is-open');
});

navLinks?.addEventListener('click', (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    navLinks.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }
});

function openDrawer() {
  drawer?.classList.add('is-open');
  drawer?.setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  drawer?.classList.remove('is-open');
  drawer?.setAttribute('aria-hidden', 'true');
}

function closeExitPopup() {
  exitPopup?.classList.remove('is-open');
  exitPopup?.setAttribute('aria-hidden', 'true');
}

openQuoteButtons.forEach((button) => button.addEventListener('click', openDrawer));
document.querySelector('.close-drawer')?.addEventListener('click', closeDrawer);
document.querySelector('.close-exit')?.addEventListener('click', closeExitPopup);

drawer?.addEventListener('click', (event) => {
  if (event.target === drawer) closeDrawer();
});

exitPopup?.addEventListener('click', (event) => {
  if (event.target === exitPopup) closeExitPopup();
});

document.addEventListener('mouseleave', (event) => {
  if (!exitShown && event.clientY <= 0) {
    exitShown = true;
    sessionStorage.setItem('exit-popup-shown', 'true');
    exitPopup?.classList.add('is-open');
    exitPopup?.setAttribute('aria-hidden', 'false');
  }
});

document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    const originalText = submit?.textContent || 'Submit';
    const formData = new FormData(form);
    const fields = Object.fromEntries(formData.entries());

    window.DLSSR_CMS?.saveEnquiry({
      source: form.dataset.formName || 'Website form',
      page: document.title,
      fields,
    });

    if (submit) {
      submit.textContent = 'Submitted ✓';
      submit.setAttribute('disabled', 'true');
    }
    setTimeout(() => {
      form.reset();
      if (submit) {
        submit.textContent = originalText;
        submit.removeAttribute('disabled');
      }
      closeDrawer();
      closeExitPopup();
    }, 1200);
  });
});

renderManagedContent();
