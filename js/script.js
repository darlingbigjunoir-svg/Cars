



const $ = (sel, ctx = document) => ctx.querySelector(sel);

/** Select multiple elements */
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** Add event listener safely (noop if el is null) */
const on = (el, evt, fn, opts) => el && el.addEventListener(evt, fn, opts);

/** Debounce */
const debounce = (fn, ms = 300) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};


function initMobileNav() {
  const toggle = $('.nav-toggle');
  const nav    = $('#main-nav');
  if (!toggle || !nav) return;

  const open = () => {
    nav.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    nav.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    document.body.style.overflow = '';
  };

  on(toggle, 'click', () =>
    nav.classList.contains('nav-open') ? close() : open()
  );

  
  $$('a', nav).forEach(link => on(link, 'click', close));

  // Close on outside click
  on(document, 'click', e => {
    if (nav.classList.contains('nav-open') &&
        !nav.contains(e.target) &&
        !toggle.contains(e.target)) close();
  });

  // Close on Escape
  on(document, 'keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) close();
  });
}


function initStickyHeader() {
  const header = $('header');
  if (!header) return;

  const update = () => {
    header.style.boxShadow = window.scrollY > 10
      ? '0 2px 16px rgba(0,0,0,0.08)'
      : '';
  };

  on(window, 'scroll', update, { passive: true });
  update();
}


function initBackToTop() {
  const btn = $('.top-arrow');
  if (!btn) return;

  const update = () => {
    btn.style.opacity  = window.scrollY > 300 ? '1' : '0';
    btn.style.pointerEvents = window.scrollY > 300 ? 'auto' : 'none';
  };

  btn.style.transition = 'opacity 0.3s';
  on(window, 'scroll', update, { passive: true });
  update();
}

function initAuthModals() {
  const overlay      = $('#modal-overlay');
  const loginModal   = $('#login-modal');
  const registerModal= $('#register-modal');
  if (!overlay) return;

  
  const showLogin = () => {
    overlay.classList.add('overlay-active');
    loginModal.classList.remove('modal-hidden');
    registerModal.classList.add('modal-hidden');
    document.body.classList.add('modal-open');
    $('#login-email')?.focus();
  };

  const showRegister = () => {
    loginModal.classList.add('modal-hidden');
    registerModal.classList.remove('modal-hidden');
    overlay.classList.add('overlay-active');
    document.body.classList.add('modal-open');
    $('#reg-name')?.focus();
  };

  const closeAll = () => {
    overlay.classList.remove('overlay-active');
    document.body.classList.remove('modal-open');
  };

  
  on($('#open-login-btn'), 'click', e => { e.preventDefault(); showLogin(); });
  on($('#close-login'),    'click', closeAll);
  on($('#close-register'), 'click', closeAll);
  on($('#go-to-register'), 'click', e => { e.preventDefault(); showRegister(); });
  on($('#go-to-login'),    'click', e => { e.preventDefault(); showLogin(); });

  
  on(overlay, 'click', e => { if (e.target === overlay) closeAll(); });

  on(document, 'keydown', e => {
    if (e.key === 'Escape') closeAll();
  });

  
  $$('.toggle-pw').forEach(btn => {
    on(btn, 'click', () => {
      const targetId = btn.dataset.pwTarget;
      const input    = $(`#${targetId}`);
      if (!input) return;
      const isText = input.type === 'text';
      input.type   = isText ? 'password' : 'text';
      btn.innerHTML = isText
        ? '<i class="fa-regular fa-eye-slash"></i>'
        : '<i class="fa-regular fa-eye"></i>';
      btn.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
    });
  });

  
  const loginForm = $('#login-form');
  on(loginForm, 'submit', e => {
    e.preventDefault();
    const email = $('#login-email').value.trim();
    const pw    = $('#login-password').value;

    if (!email || !pw) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    // Simulate login success
    showToast('Signed in successfully! Redirecting…', 'success');
    setTimeout(() => {
      closeAll();
      window.location.href = 'index.html';
    }, 1500);
  });


  const regForm = $('#register-form');
  on(regForm, 'submit', e => {
    e.preventDefault();
    const name    = $('#reg-name').value.trim();
    const email   = $('#reg-email').value.trim();
    const pw      = $('#reg-password').value;
    const confirm = $('#reg-confirm').value;

    if (!name || !email || !pw || !confirm) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    if (pw.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (pw !== confirm) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    showToast('Account created! Signing you in…', 'success');
    setTimeout(() => {
      closeAll();
      window.location.href = 'index.html';
    }, 1500);
  });
}


function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  on(form, 'submit', e => {
    e.preventDefault();

    const name    = $('#cf-name')?.value.trim();
    const email   = $('#cf-email')?.value.trim();
    const message = $('#cf-message')?.value.trim();

    if (!name) {
      showToast('Please enter your full name.', 'error');
      $('#cf-name')?.focus();
      return;
    }
    if (!email || !isValidEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      $('#cf-email')?.focus();
      return;
    }
    if (!message) {
      showToast('Please enter a message.', 'error');
      $('#cf-message')?.focus();
      return;
    }

    const btn = form.querySelector('.btn-send-message');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';

    // Simulate API call
    setTimeout(() => {
      showToast('Message sent! We\'ll get back to you within 24 hours.', 'success');
      form.reset();
      btn.disabled = false;
      btn.innerHTML = original;
    }, 1800);
  });
}


function initBookingForm() {
  const btn = $('.btn-search');
  if (!btn) return;

  on(btn, 'click', () => {
    const location = $('#location')?.value;
    const pickup   = $('#pickup')?.value;
    const ret      = $('#return')?.value;

    if (!location) {
      showToast('Please select a location.', 'error');
      return;
    }
    if (!pickup) {
      showToast('Please select a pickup date.', 'error');
      return;
    }
    if (!ret) {
      showToast('Please select a return date.', 'error');
      return;
    }
    if (new Date(ret) <= new Date(pickup)) {
      showToast('Return date must be after pickup date.', 'error');
      return;
    }

    const params = new URLSearchParams({ location, pickup, return: ret });
    window.location.href = `rentals.html?${params}`;
  });

  
  const today = new Date().toISOString().split('T')[0];
  const pickupInput = $('#pickup');
  const returnInput = $('#return');

  if (pickupInput) {
    pickupInput.min = today;
    on(pickupInput, 'change', () => {
      if (returnInput) returnInput.min = pickupInput.value;
    });
  }
  if (returnInput) returnInput.min = today;
}


function initRentalsSearch() {
  const bar = $('.rentals-search-bar');
  if (!bar) return;

  const today  = new Date().toISOString().split('T')[0];
  const inputs = $$('input[type="date"]', bar);
  inputs.forEach(inp => { inp.min = today; });

  if (inputs[0]) {
    on(inputs[0], 'change', () => {
      if (inputs[1]) inputs[1].min = inputs[0].value;
    });
  }

  
  const params   = new URLSearchParams(window.location.search);
  const locSel   = $('select', bar);
  if (locSel && params.get('location'))   locSel.value   = params.get('location');
  if (inputs[0] && params.get('pickup'))  inputs[0].value = params.get('pickup');
  if (inputs[1] && params.get('return'))  inputs[1].value = params.get('return');
}


function initFilterSidebarToggle() {
  const toggleBtn = $('#toggle-rentals-filters');
  const sidebar   = $('#rentals-filters');
  if (!toggleBtn || !sidebar) return;

  on(toggleBtn, 'click', () => {
    const open = sidebar.classList.toggle('filters-open');
    toggleBtn.innerHTML = open
      ? '<i class="fa-solid fa-xmark"></i> Close Filters'
      : '<i class="fa-solid fa-sliders"></i> Filters';
  });
}


function initRentalsFilters() {
  const grid = $('.rentals-cars-grid');
  if (!grid) return;

  const cards = $$('.rental-card', grid);

  
  const getData = card => ({
    name:         card.querySelector('h4')?.textContent.toLowerCase() || '',
    category:     card.querySelector('.v-tag')?.textContent.trim().toLowerCase() || '',
    transmission: card.querySelector('.r-specs span:nth-child(1)')?.textContent.trim().toLowerCase() || '',
    fuel:         card.querySelector('.r-specs span:nth-child(2)')?.textContent.trim().toLowerCase() || '',
    seats:        parseInt(card.querySelector('.r-specs span:nth-child(3)')?.textContent) || 0,
    price:        parseFloat(card.querySelector('.r-price')?.textContent.replace(/[^\d.]/g, '')) || 0,
    location:     card.querySelector('.r-specs span:nth-child(4)')?.textContent.trim().toLowerCase() || '',
  });

  const filterAndSort = debounce(() => {
    const search       = $('.filter-search-input')?.value.toLowerCase() || '';
    const catRadio     = $('input[name="category"]:checked');
    const transRadio   = $('input[name="transmission"]:checked');
    const fuelRadio    = $('input[name="fuel"]:checked');
    const seatsRadio   = $('input[name="seats"]:checked');
    const brandSel     = $('.filter-select')?.value.toLowerCase() || '';
    const minPrice     = parseFloat($('.price-input')?.value) || 0;
    const maxPrice     = parseFloat($$('.price-input')[1]?.value) || Infinity;
    const sortVal      = $('.sort-select')?.value || '';
    const locationSel  = $('.rsb-select')?.value.toLowerCase() || '';

    let visible = cards.filter(card => {
      const d = getData(card);

      if (search && !d.name.includes(search)) return false;
      if (catRadio && !d.category.includes(catRadio.value)) return false;
      if (transRadio && !d.transmission.includes(transRadio.value)) return false;
      if (fuelRadio && !d.fuel.includes(fuelRadio.value)) return false;
      if (seatsRadio) {
        const sv = seatsRadio.value;
        if (sv === '7+' ? d.seats < 7 : d.seats !== parseInt(sv)) return false;
      }
      if (brandSel && brandSel !== 'all brands' && !d.name.includes(brandSel)) return false;
      if (d.price < minPrice || d.price > maxPrice) return false;
      if (locationSel && !d.location.includes(locationSel)) return false;

      return true;
    });

    
    if (sortVal.includes('Low to High')) {
      visible.sort((a, b) => getData(a).price - getData(b).price);
    } else if (sortVal.includes('High to Low')) {
      visible.sort((a, b) => getData(b).price - getData(a).price);
    }

    
    cards.forEach(c => { c.style.display = 'none'; });
    visible.forEach(c => { c.style.display = ''; });

  
    const countEl = $('.results-count');
    if (countEl) countEl.textContent = `${visible.length} car${visible.length !== 1 ? 's' : ''} found`;

    
    let empty = $('#no-results');
    if (visible.length === 0) {
      if (!empty) {
        empty = document.createElement('p');
        empty.id = 'no-results';
        empty.style.cssText = 'grid-column:1/-1;text-align:center;padding:40px;color:#6b7280;font-size:0.9rem;';
        empty.textContent = 'No cars match your filters. Try adjusting your search.';
        grid.appendChild(empty);
      }
    } else {
      empty?.remove();
    }
  }, 200);


  on($('.filter-search-input'), 'input', filterAndSort);
  on($('.filter-select'),       'change', filterAndSort);
  on($('.sort-select'),         'change', filterAndSort);
  on($('.rsb-select'),          'change', filterAndSort);

  $$('input[type="radio"]', $('#rentals-filters')).forEach(r => on(r, 'change', filterAndSort));
  $$('.price-input').forEach(inp => on(inp, 'input', filterAndSort));

  on($('.clear-all'), 'click', e => {
    e.preventDefault();
    $$('input[type="radio"]').forEach(r => r.checked = false);
    $$('.price-input').forEach(i => i.value = '');
    if ($('.filter-search-input')) $('.filter-search-input').value = '';
    if ($('.filter-select')) $('.filter-select').selectedIndex = 0;
    filterAndSort();
  });
}


function initViewToggle() {
  const gridBtn = $('.view-btn:first-of-type');
  const listBtn = $('.view-btn:last-of-type');
  const grid    = $('.rentals-cars-grid');
  if (!gridBtn || !listBtn || !grid) return;

  on(gridBtn, 'click', () => {
    grid.style.gridTemplateColumns = '';
    gridBtn.classList.add('view-btn-active');
    listBtn.classList.remove('view-btn-active');
  });

  on(listBtn, 'click', () => {
    grid.style.gridTemplateColumns = '1fr';
    listBtn.classList.add('view-btn-active');
    gridBtn.classList.remove('view-btn-active');
  });
}


function initBookingTabs() {
  const tabs = $$('.booking-tab');
  if (!tabs.length) return;

  const cards = $$('.booking-card');

  const getStatus = card => {
    const badge = card.querySelector('.booking-status-badge');
    if (!badge) return 'unknown';
    if (badge.classList.contains('active'))  return 'active';
    if (badge.classList.contains('pending')) return 'pending';
    if (badge.classList.contains('past'))    return 'past';
    return 'unknown';
  };

  tabs.forEach(tab => {
    on(tab, 'click', () => {
      tabs.forEach(t => t.classList.remove('booking-tab-active'));
      tab.classList.add('booking-tab-active');

      const label = tab.textContent.trim().split(/\d/)[0].trim().toLowerCase();

      cards.forEach(card => {
        if (label === 'all') {
          card.style.display = '';
        } else if (label === 'upcoming') {
          card.style.display = getStatus(card) === 'pending' ? '' : 'none';
        } else {
          card.style.display = getStatus(card) === label ? '' : 'none';
        }
      });

      // Empty state
      const visible = cards.filter(c => c.style.display !== 'none');
      let empty = $('#no-bookings');
      if (visible.length === 0) {
        if (!empty) {
          empty = document.createElement('div');
          empty.id = 'no-bookings';
          empty.style.cssText = 'text-align:center;padding:60px 20px;color:#6b7280;';
          empty.innerHTML = '<i class="fa-solid fa-calendar-xmark" style="font-size:2.5rem;color:#d1d5db;margin-bottom:16px;display:block;"></i><p style="font-size:0.95rem;font-weight:600;">No bookings found</p><p style="font-size:0.82rem;margin-top:4px;">You have no '+label+' bookings.</p>';
          $('.bookings-list')?.appendChild(empty);
        }
      } else {
        empty?.remove();
      }
    });
  });
}


function initCancelBooking() {
  on(document, 'click', e => {
    if (!e.target.closest('.btn-cancel-booking')) return;
    const btn  = e.target.closest('.btn-cancel-booking');
    const card = btn.closest('.booking-card');

    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cancelling…';

    setTimeout(() => {
      card.style.transition = 'opacity 0.4s, transform 0.4s';
      card.style.opacity    = '0';
      card.style.transform  = 'scale(0.97)';
      setTimeout(() => {
        card.remove();
        showToast('Booking cancelled successfully.', 'success');

        // Update tab counts
        updateBookingTabCounts();
      }, 400);
    }, 900);
  });
}

function updateBookingTabCounts() {
  const remaining = $$('.booking-card').length;
  const allTab    = $('.booking-tab');
  if (allTab) {
    const countSpan = allTab.querySelector('.tab-count');
    if (countSpan) countSpan.textContent = remaining;
  }
}

function initFavourites() {
  on(document, 'click', e => {
    const btn = e.target.closest('.v-fav');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (!icon) return;

    if (icon.classList.contains('fa-regular')) {
      icon.classList.replace('fa-regular', 'fa-solid');
      btn.style.color = '#ef4444';
      showToast('Added to favourites!', 'success');
    } else {
      icon.classList.replace('fa-solid', 'fa-regular');
      btn.style.color = '';
      showToast('Removed from favourites.', 'info');
    }
  });
}


function initTestimonialSlider() {
  const card = $('.testimonial-card');
  if (!card) return;

  const testimonials = [
    {
      text: '"Exceptional service from start to finish! The booking process was seamless, and the vehicle was in pristine condition. I\'ve used this service for both business trips and family vacations, and they never disappoint."',
      name: 'Philomena Nkrumah', role: 'Business Executive', company: 'Tech Innovations Inc.', initial: 'P', stars: 5,
    },
    {
      text: '"Mashin Centre gave me the smoothest car rental experience I\'ve ever had in Ghana. The vehicles are clean, modern, and the staff are incredibly helpful. Highly recommend!"',
      name: 'Kwame Asante', role: 'Software Engineer', company: 'AfroTech Solutions', initial: 'K', stars: 5,
    },
    {
      text: '"Very reliable service. I rented an SUV for a road trip and it was perfect. The pickup was hassle-free and the price was very competitive. Will definitely book again."',
      name: 'Abena Mensah', role: 'Marketing Manager', company: 'GhanaCo Ltd.', initial: 'A', stars: 4,
    },
  ];

  let current = 0;

  const render = () => {
    const t = testimonials[current];
    const textEl    = card.querySelector('.testimonial-text');
    const nameEl    = card.querySelector('.author-name');
    const roleEl    = card.querySelector('.author-role');
    const companyEl = card.querySelector('.author-company');
    const avatarEl  = card.querySelector('.author-avatar');
    const starsEl   = card.querySelector('.testimonial-stars');

    if (textEl)    textEl.textContent = t.text;
    if (nameEl)    nameEl.textContent = t.name;
    if (roleEl)    roleEl.textContent = t.role;
    if (companyEl) companyEl.textContent = t.company;
    if (avatarEl)  avatarEl.textContent = t.initial;

    if (starsEl) {
      starsEl.innerHTML = Array.from({ length: 5 }, (_, i) =>
        `<i class="${i < t.stars ? 'fa-solid' : 'fa-regular'} fa-star"></i>`
      ).join('');
    }
  };

  const slide = dir => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(6px)';
    setTimeout(() => {
      current = (current + dir + testimonials.length) % testimonials.length;
      render();
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 200);
  };

  card.style.transition = 'opacity 0.2s, transform 0.2s';

  const prev = card.querySelector('.nav-btn:first-of-type');
  const next = card.querySelector('.nav-btn:last-of-type');
  on(prev, 'click', () => slide(-1));
  on(next, 'click', () => slide(1));

  // Auto-advance every 6 seconds
  let autoplay = setInterval(() => slide(1), 6000);
  on(card, 'mouseenter', () => clearInterval(autoplay));
  on(card, 'mouseleave', () => { autoplay = setInterval(() => slide(1), 6000); });
}

function initStatsCounter() {
  const counters = $$('.stats-num, .about-stat-num');
  if (!counters.length) return;

  const animate = el => {
    if (el.dataset.animated) return;
    el.dataset.animated = '1';

    const raw   = el.textContent.trim();
    const num   = parseFloat(raw.replace(/[^0-9.]/g, ''));
    const suffix= raw.replace(/[0-9.]/g, '');
    if (isNaN(num)) return;

    const duration = 1600;
    const step     = 16;
    const steps    = duration / step;
    let count      = 0;

    const timer = setInterval(() => {
      count++;
      const val = num * (count / steps);
      el.textContent = (Number.isInteger(num) ? Math.round(val) : val.toFixed(1)) + suffix;
      if (count >= steps) {
        el.textContent = raw;
        clearInterval(timer);
      }
    }, step);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) animate(entry.target); });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}


function initScrollReveal() {
  const targets = $$(
    '.feature-card, .vehicle-card, .rental-card, .booking-card, ' +
    '.about-service-card, .mvg-card, .info-card, .faq-item, ' +
    '.testimonial-card, .timeline-item'
  );

  if (!targets.length || !('IntersectionObserver' in window)) return;

  targets.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition= `opacity 0.5s ease ${(i % 4) * 0.08}s, transform 0.5s ease ${(i % 4) * 0.08}s`;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
}


function initHeaderSearch() {
  const input = $('input[type="search"]', $('header'));
  if (!input) return;

  on(input, 'keydown', e => {
    if (e.key === 'Escape') { input.value = ''; input.blur(); }
  });
}


function initRentalsDateRange() {
  const inputs = $$('.rsb-input[type="date"]');
  if (inputs.length < 2) return;

  const today = new Date().toISOString().split('T')[0];
  inputs.forEach(i => { i.min = today; });

  on(inputs[0], 'change', () => {
    inputs[1].min = inputs[0].value || today;
    if (inputs[1].value && inputs[1].value < inputs[0].value) {
      inputs[1].value = inputs[0].value;
    }
  });
}


let toastContainer = null;

function showToast(message, type = 'info', duration = 4000) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  const icons = {
    success: 'fa-circle-check',
    error:   'fa-circle-xmark',
    info:    'fa-circle-info',
    warning: 'fa-triangle-exclamation',
  };

  const colors = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534', icon: '#16a34a' },
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '#dc2626' },
    info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: '#2563eb' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: '#d97706' },
  };

  const c = colors[type] || colors.info;
  const toast = document.createElement('div');
  toast.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: ${c.bg};
    border: 1px solid ${c.border};
    color: ${c.text};
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    box-shadow: 0 4px 20px rgba(0,0,0,0.10);
    pointer-events: auto;
    cursor: pointer;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s, transform 0.3s;
    max-width: min(420px, 90vw);
    text-align: left;
    font-family: 'Inter', system-ui, sans-serif;
  `;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}" style="color:${c.icon};font-size:1rem;flex-shrink:0;"></i><span>${message}</span>`;

  toastContainer.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateY(0)';
    });
  });

  const dismiss = () => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  };

  on(toast, 'click', dismiss);
  setTimeout(dismiss, duration);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function initBookNowButtons() {
  on(document, 'click', e => {
    const btn = e.target.closest('.btn-book');
    if (!btn) return;
    const card = btn.closest('.vehicle-card, .rental-card');
    if (!card) return;

    const name  = card.querySelector('h4')?.textContent.trim() || 'Vehicle';
    const price = card.querySelector('.v-price, .r-price')?.textContent.trim() || '';

    showToast(`Booking ${name}… Redirecting to booking page.`, 'info', 2500);
  });
}

function initActiveNav() {
  const links    = $$('.main-nav a');
  const current  = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}


function initSmoothScroll() {
  on(document, 'click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id  = link.getAttribute('href');
    if (id === '#') return;
    const target = $(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {

  
  initMobileNav();
  initStickyHeader();
  initBackToTop();
  initHeaderSearch();
  initActiveNav();
  initSmoothScroll();
  initScrollReveal();
  initStatsCounter();


  if ($('#login-modal') || $('#register-modal')) initAuthModals();
  if ($('#contact-form'))   initContactForm();
  if ($('#location'))       initBookingForm();
  if ($('.booking-tab'))    initBookingTabs();
  if ($('.btn-cancel-booking')) initCancelBooking();
  if ($('.v-fav'))          initFavourites();
  if ($('.testimonial-card')) initTestimonialSlider();
  if ($('.rentals-search-bar')) {
    initRentalsSearch();
    initRentalsDateRange();
  }
  if ($('#rentals-filters'))  initFilterSidebarToggle();
  if ($('.rentals-cars-grid')) {
    initRentalsFilters();
    initViewToggle();
  }
  if ($('.btn-book')) initBookNowButtons();

});