const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');

function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 14);
}

function setMenuOpen(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  primaryNav.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
}

menuToggle.addEventListener('click', () => {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
});

primaryNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenuOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 800) setMenuOpen(false);
});


/* ---- movimento (respeita prefers-reduced-motion) ---- */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = (s) => [...document.querySelectorAll(s)];
const wa = document.querySelector('.floating-whatsapp');
const hv = document.querySelector('.hero-visual');
const stmt = document.querySelector('.intro-inner p');
const steps = $$('.steps-list li');
const words = [];

const revealSel = '.about-heading,.about-text,.about-signature,.care-intro,.care-item,.reviews-head,.review-feature,.review-secondary,.steps-heading,.steps-list li,.location-head,.map-frame,.address-card,.closing-content,.footer-main';
const targets = $$(revealSel);
targets.forEach((el) => {
  el.classList.add('reveal');
  const same = [...el.parentElement.children].filter((c) => c.className === el.className);
  el.style.setProperty('--d', (same.indexOf(el) * 0.1).toFixed(1) + 's');
});
const watched = [...targets, ...$$('.rating-stars'), ...$$('[data-count]')];

function count(el) {
  const to = parseFloat(el.dataset.count), t0 = performance.now();
  (function step(t) {
    const p = Math.min(1, (t - t0) / 1300);
    el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(1).replace('.', ',');
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
if (!reduce) $$('[data-count]').forEach((el) => (el.textContent = '0,0'));

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    if (e.target.dataset.count && !reduce) count(e.target);
    io.unobserve(e.target);
  }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  watched.forEach((el) => io.observe(el));
} else {
  watched.forEach((el) => el.classList.add('is-in'));
}

if (!reduce && stmt) {
  (function split(node) {
    [...node.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((t) => {
          if (!t.trim()) return frag.append(t);
          const s = document.createElement('span');
          s.className = 'fw'; s.textContent = t; frag.append(s); words.push(s);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== 'BR') split(c);
    });
  })(stmt);
}

const clamp = (v) => Math.min(1, Math.max(0, v));
function update() {
  const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
  header.style.setProperty('--scroll', max > 0 ? clamp(y / max).toFixed(4) : 0);
  header.classList.toggle('is-scrolled', y > 14);
  if (wa) wa.classList.toggle('is-show', y > 480);
  if (reduce) return;
  if (hv) hv.style.setProperty('--py', Math.min(y, 700) * 0.05);
  if (words.length) {
    const r = stmt.getBoundingClientRect();
    const t = clamp((innerHeight * 0.85 - r.top) / (innerHeight * 0.45 + r.height));
    words.forEach((w, i) => w.style.setProperty('--o', (0.2 + 0.8 * clamp(t * words.length * 1.15 - i)).toFixed(2)));
  }
  const line = innerHeight * 0.65;
  steps.forEach((li) => li.classList.toggle('is-active', li.getBoundingClientRect().top < line));
  steps.forEach((li, i) => li.style.setProperty('--f', steps[i + 1] && steps[i + 1].classList.contains('is-active') ? 1 : 0));
}
if (reduce) steps.forEach((li) => { li.classList.add('is-active'); li.style.setProperty('--f', 1); });
let queued = false;
window.addEventListener('scroll', () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; update(); });
}, { passive: true });
window.addEventListener('resize', update);
update();
