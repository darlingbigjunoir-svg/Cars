
'use strict';
 
/* ─── Utility ─────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
 
function debounce(fn, ms = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
 
function showToast(msg, type = 'info', duration = 3000) {
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
  requestAnimationFrame(() => toast.classList.add('toast-show'));
  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}
 
/* ─── Mobile Nav ──────────────────────────── */
function initMobileNav() {
  const toggle = qs('.nav-toggle');
  const nav    = qs('.main-nav');
  if (!toggle || !nav) return;
 
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('nav-open');
    const icon = toggle.querySelector('i');
    if (icon) { icon.classList.toggle('fa-bars', expanded); icon.classList.toggle('fa-xmark', !expanded); }
  });
 
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}
 

function initScrollTop() {
  const arrow = qs('.top-arrow');
  if (!arrow) return;
  const fn = () => arrow.classList.toggle('visible', window.scrollY > 300);
  window.addEventListener('scroll', fn, { passive: true });
  fn();
}
 

function initHeaderScroll() {
  const header = qs('header');
  if (!header) return;
  window.addEventListener('scroll', debounce(() => {
    header.classList.toggle('header-scrolled', window.scrollY > 60);
  }, 50), { passive: true });
}
 
function initBookingPage() {
  const grid      = qs('#vehiclesGrid');
  const noResults = qs('#noResults');
  const countEl   = qs('#resultsCount');
  const resetBtn  = qs('#resetBtn');
  const sortSel   = qs('#sortBy');
  const pills     = qsa('.bk-pill', qs('#typePills'));
 
  
  const locSel    = qs('#f-location');
  const pickupIn  = qs('#f-pickup');
  const returnIn  = qs('#f-return');
  const typeSel   = qs('#f-type');
 
  if (!grid) return;
 
  
  function getCards() {
    return qsa('.vehicle-card', grid).map(el => ({
      el,
      type:     el.dataset.type   || '',
      price:    parseInt(el.dataset.price  || '0'),
      rating:   parseFloat(el.dataset.rating || '0'),
      location: el.dataset.location || '',
    }));
  }
 
  
  let activeType = 'all';
 
  
  let currentSort = 'default';
 
  
  function prefillFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('location') && locSel)   locSel.value   = params.get('location');
    if (params.get('pickup')   && pickupIn) pickupIn.value  = params.get('pickup');
    if (params.get('return')   && returnIn) returnIn.value  = params.get('return');
  }
 
  
  function initDates() {
    const today = new Date().toISOString().split('T')[0];
    if (pickupIn) {
      pickupIn.setAttribute('min', today);
      pickupIn.addEventListener('change', () => {
        if (returnIn) {
          returnIn.setAttribute('min', pickupIn.value || today);
          if (returnIn.value && returnIn.value < pickupIn.value) returnIn.value = pickupIn.value;
        }
        runUpdate();
      });
    }
    if (returnIn) returnIn.addEventListener('change', runUpdate);
  }
 
  
  function applyFilters(cards) {
    const location = locSel?.value  || '';
    const type     = typeSel?.value || '';
 
    return cards.filter(({ el, type: cardType, location: cardLoc }) => {
      if (activeType !== 'all' && cardType !== activeType)    return false;
      if (type && type !== cardType)                          return false;
      if (location && cardLoc !== location)                   return false;
      return true;
    });
  }
 
  
  function applySort(cards) {
    const sorted = [...cards];
    if (currentSort === 'price-asc')  sorted.sort((a, b) => a.price  - b.price);
    if (currentSort === 'price-desc') sorted.sort((a, b) => b.price  - a.price);
    if (currentSort === 'rating')     sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }
 
  
  function render() {
    const allCards = getCards();
    const filtered = applyFilters(allCards);
    const sorted   = applySort(filtered);
 
    
    allCards.forEach(({ el }) => { el.style.display = 'none'; });
    sorted.forEach(({ el }) => { el.style.display = ''; grid.appendChild(el); });
 
    
    const n = sorted.length;
    if (countEl) countEl.textContent = `Showing ${n} vehicle${n !== 1 ? 's' : ''}`;
 
  
    if (noResults) noResults.style.display = n === 0 ? 'flex' : 'none';
  }
 
  const runUpdate = debounce(render, 120);
 
  
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('bk-pill-active'));
      pill.classList.add('bk-pill-active');
      activeType = pill.dataset.type || 'all';
      
      if (typeSel) typeSel.value = activeType === 'all' ? '' : activeType;
      runUpdate();
    });
  });
 
  
  sortSel?.addEventListener('change', () => {
    currentSort = sortSel.value;
    runUpdate();
  });
 
  
  locSel?.addEventListener('change', runUpdate);
  typeSel?.addEventListener('change', () => {
    const val = typeSel.value;
    activeType = val || 'all';
    
    pills.forEach(p => p.classList.toggle('bk-pill-active', p.dataset.type === activeType));
    runUpdate();
  });
 
  
  resetBtn?.addEventListener('click', () => {
    if (locSel)   locSel.value   = '';
    if (pickupIn) pickupIn.value = '';
    if (returnIn) returnIn.value = '';
    if (typeSel)  typeSel.value  = '';
    if (sortSel)  sortSel.value  = 'default';
    currentSort = 'default';
    activeType  = 'all';
    pills.forEach(p => p.classList.toggle('bk-pill-active', p.dataset.type === 'all'));
    runUpdate();
  });
 
  
  qsa('.v-fav').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const icon = btn.querySelector('i');
      if (!icon) return;
      const active = icon.classList.toggle('fa-solid');
      icon.classList.toggle('fa-regular', !active);
      btn.classList.toggle('v-fav-active', active);
    });
  });
 
  /* ── Init ── */
  prefillFromURL();
  initDates();
  render();
}
 
function initBookingModal() {
  const overlay   = qs('#modalOverlay');
  const closeBtn  = qs('#modalClose');
  const carNameEl = qs('#modalCarName');
  const summaryEl = qs('#modalSummary');
 
  if (!overlay) return;
 
  function openModal(carName, pricePerDay) {
    if (carNameEl) carNameEl.textContent = carName;
 
  
    if (summaryEl) {
      const pickup  = qs('#f-pickup')?.value;
      const ret     = qs('#f-return')?.value;
      let days = 1;
 
      if (pickup && ret) {
        const ms  = new Date(ret) - new Date(pickup);
        days = Math.max(1, Math.round(ms / 86_400_000));
      }
 
      const total = pricePerDay * days;
      summaryEl.innerHTML = `
        <div class="bk-summary-row">
          <span><i class="fa-solid fa-car"></i> ${carName}</span>
        </div>
        ${pickup ? `<div class="bk-summary-row"><span><i class="fa-solid fa-calendar"></i> Pickup: ${formatDate(pickup)}</span></div>` : ''}
        ${ret    ? `<div class="bk-summary-row"><span><i class="fa-solid fa-calendar-check"></i> Return: ${formatDate(ret)}</span></div>` : ''}
        <div class="bk-summary-row bk-summary-total">
          <span>Estimated total (${days} day${days > 1 ? 's' : ''})</span>
          <span><i class="fa-solid fa-cedi-sign"></i>${total.toLocaleString()}</span>
        </div>
      `;
    }
 
    overlay.classList.add('modal-active');
    document.body.style.overflow = 'hidden';
  }
 
  function closeModal() {
    overlay.classList.remove('modal-active');
    document.body.style.overflow = '';
  }
 
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
 
  
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-book');
    if (!btn) return;
    const carName  = btn.dataset.car   || 'Selected Car';
    const price    = parseInt(btn.dataset.price || '0');
    openModal(carName, price);
  });
 
  closeBtn?.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}
 
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollTop();
  initHeaderScroll();
  initBookingPage();
  initBookingModal();
});