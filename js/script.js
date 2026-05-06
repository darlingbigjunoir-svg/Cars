
'use strict';


const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function debounce(fn, ms = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}


function initMobileNav() {
  const toggle = qs('.nav-toggle');
  const nav    = qs('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('nav-open');
    // Swap burger ↔ close icon
    const icon = toggle.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars', expanded);
      icon.classList.toggle('fa-xmark', !expanded);
    }
  });

  
  qsa('.main-nav a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      const icon = toggle.querySelector('i');
      if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-xmark'); }
    });
  });

  
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      const icon = toggle.querySelector('i');
      if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-xmark'); }
    }
  });
}


function initScrollTop() {
  const arrow = qs('.top-arrow');
  if (!arrow) return;

  const toggle = () => arrow.classList.toggle('visible', window.scrollY > 300);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}


function initSearchBox() {
  const boxes = qsa('.search-box');
  boxes.forEach(box => {
    const input = box.querySelector('input');
    const icon  = box.querySelector('.search-icon');
    if (!input || !icon) return;

    icon.addEventListener('click', () => {
      box.classList.toggle('search-open');
      if (box.classList.contains('search-open')) input.focus();
    });

    input.addEventListener('blur', () => {
      if (!input.value.trim()) box.classList.remove('search-open');
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { box.classList.remove('search-open'); input.blur(); }
      if (e.key === 'Enter' && input.value.trim()) {
        // Basic in-page search notification (replace with real search if needed)
        showToast(`Searching for "${input.value.trim()}"…`);
        input.value = '';
        box.classList.remove('search-open');
      }
    });
  });
}

function showToast(msg, type = 'info', duration = 3500) {
  let container = qs('#toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('toast-show'));

  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

function initLoginModal() {
  const overlay       = qs('#modal-overlay');
  const loginModal    = qs('#login-modal');
  const registerModal = qs('#register-modal');
  if (!overlay) return;

  const openLoginBtn  = qs('#open-login-btn');
  const closeLogin    = qs('#close-login');
  const closeRegister = qs('#close-register');
  const goToRegister  = qs('#go-to-register');
  const goToLogin     = qs('#go-to-login');

  function openModal(show, hide) {
    overlay.classList.add('active');
    show.classList.remove('modal-hidden');
    hide && hide.classList.add('modal-hidden');
    document.body.style.overflow = 'hidden';
    // Focus first input
    const firstInput = show.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  function closeAll() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  
  if (document.body.classList.contains('page-login')) {
    openModal(loginModal, registerModal);
  }

  openLoginBtn  && openLoginBtn.addEventListener('click',  e => { e.preventDefault(); openModal(loginModal, registerModal); });
  closeLogin    && closeLogin.addEventListener('click',    closeAll);
  closeRegister && closeRegister.addEventListener('click', closeAll);
  goToRegister  && goToRegister.addEventListener('click',  e => { e.preventDefault(); openModal(registerModal, loginModal); });
  goToLogin     && goToLogin.addEventListener('click',     e => { e.preventDefault(); openModal(loginModal, registerModal); });

  overlay.addEventListener('click', e => { if (e.target === overlay) closeAll(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  
  qsa('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.pwTarget;
      const input    = qs(`#${targetId}`);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-eye', show);
        icon.classList.toggle('fa-eye-slash', !show);
      }
    });
  });

  
  const loginForm = qs('#login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateForm(loginForm)) return;
      const btn = loginForm.querySelector('[type=submit]');
      btn.textContent = 'Signing in…';
      btn.disabled = true;
      // Simulate async login
      setTimeout(() => {
        showToast('Welcome back! Redirecting…', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
      }, 1000);
    });
  }

  
  const registerForm = qs('#register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateForm(registerForm)) return;
      const pwd     = qs('#reg-password', registerForm);
      const confirm = qs('#reg-confirm',  registerForm);
      if (pwd && confirm && pwd.value !== confirm.value) {
        markInvalid(confirm, 'Passwords do not match');
        return;
      }
      const btn = registerForm.querySelector('[type=submit]');
      btn.textContent = 'Creating account…';
      btn.disabled = true;
      setTimeout(() => {
        showToast('Account created! Welcome to Mashin!', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
      }, 1000);
    });
  }
}

function validateForm(form) {
  let valid = true;
  qsa('[required]', form).forEach(field => {
    clearInvalid(field);
    if (!field.value.trim()) {
      markInvalid(field, 'This field is required');
      valid = false;
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      markInvalid(field, 'Enter a valid email address');
      valid = false;
    }
  });
  return valid;
}

function markInvalid(field, msg) {
  field.classList.add('field-error');
  let err = field.parentElement.querySelector('.error-msg');
  if (!err) {
    err = document.createElement('span');
    err.className = 'error-msg';
    field.parentElement.appendChild(err);
  }
  err.textContent = msg;
  field.addEventListener('input', () => clearInvalid(field), { once: true });
}

function clearInvalid(field) {
  field.classList.remove('field-error');
  const err = field.parentElement && field.parentElement.querySelector('.error-msg');
  if (err) err.remove();
}


function initContactForm() {
  const form = qs('#contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn = form.querySelector('[type=submit]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
    btn.disabled  = true;

    // Simulate API call
    setTimeout(() => {
      showToast('Message sent! We\'ll get back to you within 24 hours.', 'success', 4000);
      form.reset();
      btn.innerHTML = orig;
      btn.disabled  = false;
    }, 1500);
  });

  
  const textarea = qs('#cf-message');
  if (textarea) {
    const counter = document.createElement('span');
    counter.className = 'char-counter';
    counter.textContent = '0 / 1000';
    textarea.parentElement.appendChild(counter);
    textarea.setAttribute('maxlength', '1000');
    textarea.addEventListener('input', () => {
      counter.textContent = `${textarea.value.length} / 1000`;
    });
  }
}


function initFaqAccordion() {
  const items = qsa('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const heading = item.querySelector('h5');
    const body    = item.querySelector('p');
    if (!heading || !body) return;

    
    body.style.overflow  = 'hidden';
    body.style.maxHeight = '0';
    body.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
    body.style.opacity   = '0';

    heading.style.cursor = 'pointer';
    heading.setAttribute('tabindex', '0');
    heading.setAttribute('role', 'button');
    heading.setAttribute('aria-expanded', 'false');

    function toggle() {
      const open = item.classList.toggle('faq-open');
      body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
      body.style.opacity   = open ? '1' : '0';
      heading.setAttribute('aria-expanded', String(open));
      
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('faq-open');
          const b = other.querySelector('p');
          const h = other.querySelector('h5');
          if (b) { b.style.maxHeight = '0'; b.style.opacity = '0'; }
          if (h) h.setAttribute('aria-expanded', 'false');
        }
      });
    }

    heading.addEventListener('click', toggle);
    heading.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
}


function initHeroBookingForm() {

  const today = new Date().toISOString().split('T')[0];
  qsa('input[type="date"]').forEach(input => {
    input.setAttribute('min', today);
    if (input.id === 'pickup' || input.id === 'return') {
      input.addEventListener('change', () => syncDates());
    }
  });

  function syncDates() {
    const pickup = qs('#pickup') || qs('#f-pickup');
    const ret    = qs('#return') || qs('#f-return');
    if (pickup && ret && pickup.value) {
      ret.setAttribute('min', pickup.value);
      if (ret.value && ret.value < pickup.value) ret.value = pickup.value;
    }
  }

  
  const searchBtn = qs('.btn-search');
  if (searchBtn && !searchBtn.id?.includes('reset')) {
    searchBtn.addEventListener('click', () => {
      const location = (qs('#location') || qs('#f-location'))?.value || '';
      const pickup   = (qs('#pickup')   || qs('#f-pickup'))?.value  || '';
      const ret      = (qs('#return')   || qs('#f-return'))?.value  || '';

      if (!location) { showToast('Please select a location.', 'warning'); return; }
      if (!pickup)   { showToast('Please select a pickup date.', 'warning'); return; }
      if (!ret)      { showToast('Please select a return date.', 'warning'); return; }

      // Navigate to booking page with query params
      const params = new URLSearchParams({ location, pickup, return: ret });
      window.location.href = `booking.html?${params}`;
    });
  }
}


function initRentalsPage() {
  const grid = qs('.rentals-cars-grid');
  if (!grid) return;

  const cards        = qsa('.rental-card', grid);
  const countEl      = qs('.results-count');
  const sortSelect   = qs('.sort-select');
  const viewBtns     = qsa('.view-btn');
  const searchInput  = qs('.filter-search-input');
  const clearAllLink = qs('.clear-all');
  const filtersBtn   = qs('.btn-filters');
  const sidebar      = qs('.filters-sidebar');

  
  function getCardData(card) {
    return {
      el:           card,
      name:         card.querySelector('h4')?.textContent.toLowerCase() || '',
      price:        parseInt(card.querySelector('.r-price')?.textContent.replace(/[^\d]/g, '') || '0'),
      rating:       parseFloat(card.querySelector('.r-rating span')?.textContent.replace(/[()]/g, '') || '0'),
      category:     card.querySelector('.v-tag')?.textContent.trim().toLowerCase() || '',
      transmission: card.querySelector('.r-specs span:nth-child(1)')?.textContent.trim().toLowerCase() || '',
      fuel:         card.querySelector('.r-specs span:nth-child(2)')?.textContent.trim().toLowerCase() || '',
      seats:        card.querySelector('.r-specs span:nth-child(3)')?.textContent.replace(/[^\d]/g, '') || '0',
      location:     card.querySelector('.r-specs span:nth-child(4)')?.textContent.trim().toLowerCase() || '',
    };
  }

  let allCards = cards.map(getCardData);

  function getActiveFilters() {
    return {
      search:       (searchInput?.value || '').toLowerCase().trim(),
      category:     qs('input[name="category"]:checked')?.value || '',
      transmission: qs('input[name="transmission"]:checked')?.value || '',
      fuel:         qs('input[name="fuel"]:checked')?.value || '',
      seats:        qs('input[name="seats"]:checked')?.value || '',
      minPrice:     parseInt(qs('.price-input:first-child')?.value || '0'),
      maxPrice:     parseInt(qs('.price-input:last-child')?.value  || '99999'),
      brand:        qs('.filter-select')?.value || 'All Brands',
      location:     qs('.rsb-select')?.value   || '',
    };
  }

  function applyFilters() {
    const f = getActiveFilters();
    let visible = 0;

    allCards.forEach(({ el, name, price, category, transmission, fuel, seats, location }) => {
      let show = true;

      if (f.search && !name.includes(f.search))         show = false;
      if (f.category && !category.includes(f.category)) show = false;
      if (f.transmission && !transmission.includes(f.transmission)) show = false;
      if (f.fuel && !fuel.includes(f.fuel))             show = false;
      if (f.seats === '7+' && parseInt(seats) < 7)      show = false;
      else if (f.seats && f.seats !== '7+' && seats !== f.seats) show = false;
      if (price < f.minPrice || price > f.maxPrice)     show = false;
      if (f.brand !== 'All Brands' && !name.includes(f.brand.toLowerCase())) show = false;
      if (f.location && !location.includes(f.location)) show = false;

      el.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (countEl) countEl.textContent = `${visible} car${visible !== 1 ? 's' : ''} found`;
  }

  function applySort() {
    if (!sortSelect) return;
    const val  = sortSelect.value;
    const data = allCards.filter(c => c.el.style.display !== 'none');

    data.sort((a, b) => {
      if (val === 'Price: Low to High')  return a.price  - b.price;
      if (val === 'Price: High to Low')  return b.price  - a.price;
      if (val === 'Rating')              return b.rating - a.rating;
      return 0;
    });

    data.forEach(({ el }) => grid.appendChild(el));
  }

  const runUpdate = debounce(() => { applyFilters(); applySort(); }, 150);

  qsa('input[name="category"], input[name="transmission"], input[name="fuel"], input[name="seats"]')
    .forEach(r => r.addEventListener('change', runUpdate));
  qsa('.price-input').forEach(i => i.addEventListener('input', runUpdate));
  qs('.filter-select')?.addEventListener('change', runUpdate);
  qs('.rsb-select')?.addEventListener('change', runUpdate);
  searchInput?.addEventListener('input', runUpdate);
  sortSelect?.addEventListener('change', runUpdate);

  
  clearAllLink?.addEventListener('click', e => {
    e.preventDefault();
    qsa('input[type="radio"]').forEach(r => r.checked = false);
    qsa('.price-input').forEach(i => i.value = '');
    if (searchInput) searchInput.value = '';
    if (qs('.filter-select')) qs('.filter-select').selectedIndex = 0;
    if (qs('.rsb-select'))    qs('.rsb-select').selectedIndex = 0;
    runUpdate();
    showToast('Filters cleared.', 'info', 2000);
  });

  
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('view-btn-active'));
      btn.classList.add('view-btn-active');
      const isList = btn.querySelector('.fa-list') !== null;
      grid.classList.toggle('list-view', isList);
    });
  });


  filtersBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('sidebar-open');
  });

  // Favourite toggle on rental cards
  initFavouriteToggle('.rental-card');

  // Initial render
  applyFilters();
}


function initFavouriteToggle(cardSelector = '.vehicle-card') {
  qsa(`${cardSelector} .v-fav`).forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const icon = btn.querySelector('i');
      if (!icon) return;
      const active = icon.classList.toggle('fa-solid');
      icon.classList.toggle('fa-regular', !active);
      btn.classList.toggle('v-fav-active', active);
      showToast(active ? 'Added to favourites!' : 'Removed from favourites.', 'info', 2000);
    });
  });
}


function initTestimonialCarousel() {
  const card    = qs('.testimonial-card');
  const prevBtn = qs('.testimonial-nav .nav-btn:first-child');
  const nextBtn = qs('.testimonial-nav .nav-btn:last-child');
  if (!card || !prevBtn || !nextBtn) return;

  const testimonials = [
    {
      text:    '"Exceptional service from start to finish! The booking process was seamless, and the vehicle was in pristine condition. I\'ve used this service for both business trips and family vacations, and they never disappoint."',
      name:    'Philomena Nkrumah',
      role:    'Business Executive',
      company: 'Tech Innovations Inc.',
      avatar:  'P',
      stars:   5,
    },
    {
      text:    '"Great selection of vehicles and very professional staff. Got a Toyota Camry for a road trip to Kumasi — smooth experience throughout. Will definitely rent again!"',
      name:    'Kwame Asante',
      role:    'Software Engineer',
      company: 'Hubtel',
      avatar:  'K',
      stars:   5,
    },
    {
      text:    '"The online booking system is incredibly easy to use. Prices are transparent and the cars are always clean and well-maintained. Highly recommend Mashin Centre."',
      name:    'Abena Mensah',
      role:    'Marketing Manager',
      company: 'Melcom Ghana',
      avatar:  'A',
      stars:   4,
    },
  ];

  let current = 0;

  function render(idx) {
    const t = testimonials[idx];
    const textEl    = card.querySelector('.testimonial-text');
    const nameEl    = card.querySelector('.author-name');
    const roleEl    = card.querySelector('.author-role');
    const companyEl = card.querySelector('.author-company');
    const avatarEl  = card.querySelector('.author-avatar');
    const starsEl   = card.querySelector('.testimonial-stars');

    card.style.opacity = '0';
    card.style.transform = 'translateY(8px)';

    setTimeout(() => {
      if (textEl)    textEl.textContent    = t.text;
      if (nameEl)    nameEl.textContent    = t.name;
      if (roleEl)    roleEl.textContent    = t.role;
      if (companyEl) companyEl.textContent = t.company;
      if (avatarEl)  avatarEl.textContent  = t.avatar;
      if (starsEl) {
        starsEl.innerHTML = Array.from({ length: 5 }, (_, i) =>
          `<i class="fa-${i < t.stars ? 'solid' : 'regular'} fa-star"></i>`
        ).join('');
      }
      card.style.opacity   = '1';
      card.style.transform = 'translateY(0)';
    }, 250);
  }

  card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

  prevBtn.addEventListener('click', () => {
    current = (current - 1 + testimonials.length) % testimonials.length;
    render(current);
  });

  nextBtn.addEventListener('click', () => {
    current = (current + 1) % testimonials.length;
    render(current);
  });

  let autoTimer = setInterval(() => {
    current = (current + 1) % testimonials.length;
    render(current);
  }, 6000);

  card.addEventListener('mouseenter', () => clearInterval(autoTimer));
  card.addEventListener('mouseleave', () => {
    autoTimer = setInterval(() => {
      current = (current + 1) % testimonials.length;
      render(current);
    }, 6000);
  });
}



function initStatsCounter() {
  const statNums = qsa('.stats-num');
  if (!statNums.length) return;

  function animateNumber(el) {
    const raw  = el.textContent.trim();
    const num  = parseFloat(raw.replace(/[^0-9.]/g, ''));
    const suffix = raw.replace(/[0-9.]/g, '');
    if (isNaN(num)) return;

    const duration = 1500;
    const start    = performance.now();

    function step(now) {
      const t       = Math.min((now - start) / duration, 1);
      const eased   = 1 - Math.pow(1 - t, 3);
      const current = +(num * eased).toFixed(num < 10 ? 1 : 0);
      el.textContent = current + suffix;
      if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNumber(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => observer.observe(el));
}


function initHeaderScroll() {
  const header = qs('header');
  if (!header) return;

  const handler = debounce(() => {
    header.classList.toggle('header-scrolled', window.scrollY > 60);
  }, 50);

  window.addEventListener('scroll', handler, { passive: true });
  handler();
}


function initScrollReveal() {
  const targets = qsa('.feature-card, .vehicle-card, .rental-card, .info-card, .faq-item, .stat-item');

  if (!targets.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el, i) => {
    el.classList.add('reveal-ready');
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    observer.observe(el);
  });
}


document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollTop();
  initSearchBox();
  initLoginModal();
  initContactForm();
  initFaqAccordion();
  initHeroBookingForm();
  initRentalsPage();
  initFavouriteToggle('.vehicle-card');
  initTestimonialCarousel();
  initStatsCounter();
  initHeaderScroll();
  initScrollReveal();
});

