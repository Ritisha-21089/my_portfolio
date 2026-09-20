/* Ritisha Singh — portfolio behaviour. No dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Theme toggle ---------- */
  var toggle = document.getElementById('themeToggle');
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.getAttribute('data-theme') || (darkQuery.matches ? 'dark' : 'light');
  }

  function labelToggle() {
    if (!toggle) return;
    toggle.setAttribute(
      'aria-label',
      currentTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
  }

  if (toggle) {
    labelToggle();
    toggle.addEventListener('click', function () {
      root.setAttribute('data-theme', currentTheme() === 'dark' ? 'light' : 'dark');
      try { localStorage.setItem('theme', root.getAttribute('data-theme')); } catch (e) { /* private mode */ }
      labelToggle();
    });
    // Follow the OS while the visitor has not made an explicit choice.
    if (typeof darkQuery.addEventListener === 'function') {
      darkQuery.addEventListener('change', function () {
        if (!root.hasAttribute('data-theme')) labelToggle();
      });
    }
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function closeNav() {
    if (!navLinks || !navToggle) return;
    navLinks.setAttribute('data-open', 'false');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.getAttribute('data-open') === 'true';
      navLinks.setAttribute('data-open', open ? 'false' : 'true');
      navToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      navToggle.setAttribute('aria-label', open ? 'Open navigation menu' : 'Close navigation menu');
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------- Header shadow on scroll + back-to-top ---------- */
  var header = document.getElementById('siteHeader');
  var toTop = document.getElementById('toTop');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.setAttribute('data-scrolled', y > 8 ? 'true' : 'false');
    if (toTop) toTop.setAttribute('data-visible', y > 600 ? 'true' : 'false');
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Active section in nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = links
    .map(function (a) {
      var id = a.getAttribute('href');
      return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var visible = new Map();
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      var bestId = null;
      var bestRatio = 0;
      visible.forEach(function (ratio, id) {
        if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
      });

      links.forEach(function (a) {
        var match = bestId && a.getAttribute('href') === '#' + bestId;
        if (match) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.setAttribute('data-visible', 'true'); });
  } else {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute('data-visible', 'true');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { revealer.observe(el); });
  }

  /* ---------- Project filters ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var projects = Array.prototype.slice.call(document.querySelectorAll('.project'));

  if (filters.length && projects.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var want = btn.getAttribute('data-filter');

        filters.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });

        var shown = 0;
        projects.forEach(function (card) {
          var match = want === 'all' || card.getAttribute('data-cat') === want;
          card.hidden = !match;
          if (match) shown++;
        });

        var grid = document.getElementById('projectGrid');
        if (grid) {
          grid.setAttribute(
            'aria-label',
            shown + (shown === 1 ? ' project' : ' projects') + ' shown'
          );
        }
      });
    });
  }
})();
