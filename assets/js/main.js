/*
 * QingYan Studio Portfolio v1.0
 * Main behavior: header scroll, mobile menu, reveal-on-scroll
 */

(function () {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  const revealElements = document.querySelectorAll('.reveal');

  /* --- Header shadow on scroll --- */
  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 8) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* --- Mobile menu --- */
  function toggleMenu(forceOpen) {
    if (!menuToggle || !mobileMenu) return;
    const isOpen = typeof forceOpen === 'boolean' ? forceOpen : !mobileMenu.classList.contains('is-open');
    menuToggle.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.classList.toggle('is-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => toggleMenu());
    menuToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
      }
    });
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }

  /* --- Reveal on scroll --- */
  if (revealElements.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  /* --- Close mobile menu on resize to desktop --- */
  function handleResize() {
    if (window.innerWidth >= 820 && mobileMenu && mobileMenu.classList.contains('is-open')) {
      toggleMenu(false);
    }
  }
  window.addEventListener('resize', handleResize);
})();
