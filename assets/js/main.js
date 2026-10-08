// Main UI Interactions (Nav, Cart Toggle, Animations)

document.addEventListener('DOMContentLoaded', () => {
  // Header Scroll Effect
  const header = document.querySelector('.header');
  const syncHeader = () => header && header.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();

  // Mobile Drawer
  const hamburger = document.querySelector('.hamburger');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const drawerBackdrop = document.querySelector('.drawer-backdrop');

  function openMenu() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    if (drawerBackdrop) drawerBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    if (drawerBackdrop) drawerBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openMenu);
  const closeMenuBtn = mobileDrawer && mobileDrawer.querySelector('.hamburger');
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeMenu);

  // Mobile Nav Accordion
  const navItems = document.querySelectorAll('.mobile-drawer .nav-item');
  navItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    const dropdown = item.querySelector('.dropdown-menu');
    if (dropdown) {
      // Add indicator
      link.innerHTML += ' <i class="ph ph-caret-down"></i>';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        item.classList.toggle('open');
      });
    }
  });

  // Cart Drawer
  const cartToggles = document.querySelectorAll('.cart-toggle');
  const cartDrawer = document.querySelector('.cart-drawer');
  const closeCartBtn = document.querySelector('.close-cart');
  
  // Create cart backdrop
  let cartBackdrop = document.createElement('div');
  cartBackdrop.className = 'drawer-backdrop cart-backdrop';
  document.body.appendChild(cartBackdrop);

  function openCart() {
    cartDrawer.classList.add('open');
    cartBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    if(window.Cart) window.Cart.render(); // Ensure cart is up to date
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartToggles.forEach(toggle => toggle.addEventListener('click', (e) => {
    e.preventDefault();
    openCart();
  }));
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  cartBackdrop.addEventListener('click', closeCart);

  // Esc key to close drawers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      closeCart();
    }
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Count-up stats
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const start = performance.now();
        const tick = now => {
          const t = Math.min(1, (now - start) / 1600);
          el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => countObserver.observe(el));
  } else {
    counters.forEach(el => { el.textContent = el.dataset.count; });
  }

  // Hero spotlight follows the cursor
  const hero = document.querySelector('.h-hero');
  const heroGlow = hero && hero.querySelector('.h-hero-glow');
  if (heroGlow && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      heroGlow.style.setProperty('--mx', `${e.clientX - r.left}px`);
      heroGlow.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  // Global cart UI update
  window.updateCartCount = function(count) {
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  };
});
