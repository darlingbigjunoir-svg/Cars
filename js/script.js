/**
 * Mashin Centre — shared site behavior (all pages)
 */
(function () {
  "use strict";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  /* ---------- Mobile navigation ---------- */
  function initMobileNav() {
    var toggle = qs(".nav-toggle");
    var nav = qs("#main-nav");
    if (!toggle || !nav) return;

    function closeNav() {
      nav.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    }

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
    });

    qsa("#main-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 992px)").matches) closeNav();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Login / register modals (login.html only) ---------- */
  function initLoginModals() {
    var overlay = qs("#modal-overlay");
    var loginModal = qs("#login-modal");
    var registerModal = qs("#register-modal");
    if (!overlay || !loginModal || !registerModal) return;

    var openBtn = qs("#open-login-btn");
    var closeLogin = qs("#close-login");
    var closeRegister = qs("#close-register");
    var goRegister = qs("#go-to-register");
    var goLogin = qs("#go-to-login");

    function openOverlay() {
      overlay.classList.add("overlay-active");
      document.body.classList.add("modal-open");
    }

    function closeOverlay() {
      overlay.classList.remove("overlay-active");
      document.body.classList.remove("modal-open");
      loginModal.classList.remove("modal-hidden");
      registerModal.classList.add("modal-hidden");
    }

    function showRegister() {
      loginModal.classList.add("modal-hidden");
      registerModal.classList.remove("modal-hidden");
    }

    function showLogin() {
      registerModal.classList.add("modal-hidden");
      loginModal.classList.remove("modal-hidden");
    }

    if (openBtn) {
      openBtn.addEventListener("click", function (e) {
        e.preventDefault();
        openOverlay();
        showLogin();
      });
    }
    if (closeLogin) closeLogin.addEventListener("click", closeOverlay);
    if (closeRegister) closeRegister.addEventListener("click", closeOverlay);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeOverlay();
    });

    if (goRegister) {
      goRegister.addEventListener("click", function (e) {
        e.preventDefault();
        showRegister();
      });
    }
    if (goLogin) {
      goLogin.addEventListener("click", function (e) {
        e.preventDefault();
        showLogin();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("overlay-active")) {
        closeOverlay();
      }
    });

    openOverlay();
    showLogin();
  }

  function initPasswordToggles() {
    qsa(".toggle-pw[data-pw-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-pw-target");
        window.togglePassword(id, btn);
      });
    });
  }

  window.togglePassword = function (inputId, btn) {
    var input = document.getElementById(inputId);
    if (!input || !btn) return;
    var icon = btn.querySelector("i");
    if (input.type === "password") {
      input.type = "text";
      if (icon) {
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    } else {
      input.type = "password";
      if (icon) {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      }
    }
  };

  function initLoginForms() {
    var loginForm = qs("#login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = qs("#login-email");
        var password = qs("#login-password");
        var overlay = qs("#modal-overlay");
        if (!email || !password) return;
        var em = email.value.trim();
        var pw = password.value;
        if (!em || !pw) {
          alert("Please enter your email and password.");
          return;
        }
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(em)) {
          alert("Please enter a valid email address.");
          return;
        }
        alert("Logged in successfully! Welcome back.");
        if (overlay) {
          overlay.classList.remove("overlay-active");
          document.body.classList.remove("modal-open");
        }
        window.location.href = "index.html";
      });
    }

    var registerForm = qs("#register-form");
    if (registerForm) {
      registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var nameEl = qs("#reg-name");
        var emailEl = qs("#reg-email");
        var pwEl = qs("#reg-password");
        var confirmEl = qs("#reg-confirm");
        if (!nameEl || !emailEl || !pwEl || !confirmEl) return;
        var name = nameEl.value.trim();
        var email = emailEl.value.trim();
        var pw = pwEl.value;
        var confirm = confirmEl.value;
        if (!name || !email || !pw || !confirm) {
          alert("Please complete all fields.");
          return;
        }
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) {
          alert("Please enter a valid email address.");
          return;
        }
        if (pw.length < 8) {
          alert("Password must be at least 8 characters.");
          return;
        }
        if (pw !== confirm) {
          alert("Passwords do not match. Please try again.");
          return;
        }
        alert("Account created successfully! Please sign in.");
        var loginModal = qs("#login-modal");
        var registerModal = qs("#register-modal");
        if (registerModal) registerModal.classList.add("modal-hidden");
        if (loginModal) loginModal.classList.remove("modal-hidden");
      });
    }
  }

  /* ---------- Home: hero booking search ---------- */
  function initHeroBookingSearch() {
    var btn = qs(".booking-section .btn-search");
    var loc = qs("#location");
    var pickup = qs("#pickup");
    var ret = qs("#return");
    if (!btn) return;

    btn.addEventListener("click", function () {
      if (loc && !loc.value) {
        alert("Please choose a pickup location.");
        return;
      }
      if (pickup && !pickup.value) {
        alert("Please select a pickup date.");
        return;
      }
      if (ret && !ret.value) {
        alert("Please select a return date.");
        return;
      }
      if (pickup && ret && pickup.value && ret.value && pickup.value > ret.value) {
        alert("Return date must be on or after pickup date.");
        return;
      }
      var q = new URLSearchParams();
      if (loc && loc.value) q.set("location", loc.value);
      if (pickup && pickup.value) q.set("pickup", pickup.value);
      if (ret && ret.value) q.set("return", ret.value);
      window.location.href = "rentals.html?" + q.toString();
    });
  }

  /* ---------- Testimonials carousel ---------- */
  function initTestimonials() {
    var textEl = qs(".testimonial-card .testimonial-text");
    var authorName = qs(".testimonial-author .author-name");
    var authorRole = qs(".testimonial-author .author-role");
    var authorCompany = qs(".testimonial-author .author-company");
    var avatar = qs(".testimonial-author .author-avatar");
    var prev = qs(".testimonial-card .nav-btn:first-of-type");
    var next = qs(".testimonial-card .nav-btn:last-of-type");
    if (!textEl || !prev || !next) return;

    var slides = [
      {
        quote:
          "\"Exceptional service from start to finish! The booking process was seamless, and the vehicle was in pristine condition. I've used this service for both business trips and family vacations, and they never disappoint.\"",
        name: "Philomena Nkrumah",
        role: "Business Executive",
        company: "Tech Innovations Inc.",
        initial: "P",
      },
      {
        quote:
          "\"Reliable cars, fair pricing, and support that actually answers the phone. Mashin made our road trip across Ghana stress-free from pickup to drop-off.\"",
        name: "Kwame Asante",
        role: "Operations Manager",
        company: "Coastal Logistics",
        initial: "K",
      },
      {
        quote:
          "\"Clean vehicles, easy online booking, and friendly staff at the Accra branch. This is my go-to rental company whenever I'm in town.\"",
        name: "Ama Osei",
        role: "Consultant",
        company: "Independent",
        initial: "A",
      },
    ];

    var i = 0;

    function render() {
      var s = slides[i];
      textEl.textContent = s.quote;
      if (authorName) authorName.textContent = s.name;
      if (authorRole) authorRole.textContent = s.role;
      if (authorCompany) authorCompany.textContent = s.company;
      if (avatar) avatar.textContent = s.initial;
    }

    prev.addEventListener("click", function () {
      i = (i - 1 + slides.length) % slides.length;
      render();
    });
    next.addEventListener("click", function () {
      i = (i + 1) % slides.length;
      render();
    });
  }

  /* ---------- Contact form ---------- */
  function initContactForm() {
    var form = qs("#contact-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = qs("#cf-name");
      var email = qs("#cf-email");
      var message = qs("#cf-message");
      if (!name || !email || !message) return;
      var n = name.value.trim();
      var em = email.value.trim();
      var msg = message.value.trim();
      if (!n) {
        alert("Please enter your full name.");
        name.focus();
        return;
      }
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(em)) {
        alert("Please enter a valid email address.");
        email.focus();
        return;
      }
      if (!msg) {
        alert("Please enter a message.");
        message.focus();
        return;
      }
      alert("Thank you! Your message has been sent. We'll reply within 24 hours.");
      form.reset();
    });
  }

  /* ---------- My Bookings tabs ---------- */
  function initBookingTabs() {
    var tabs = qsa(".booking-tabs .booking-tab");
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.remove("booking-tab-active");
        });
        tab.classList.add("booking-tab-active");
      });
    });
  }

  /* ---------- Rentals: filter panel + hero filters button ---------- */
  function initRentalsPage() {
    var sidebar = qs("#rentals-filters");
    var toggleBtn = qs("#toggle-rentals-filters");
    var heroFiltersBtn = qs(".rentals-search-section .btn-filters");

    function openSidebar() {
      if (sidebar) sidebar.classList.add("filters-open");
    }

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener("click", function () {
        sidebar.classList.toggle("filters-open");
      });
    }

    if (heroFiltersBtn && sidebar) {
      heroFiltersBtn.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 992px)").matches) {
          openSidebar();
          sidebar.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          sidebar.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  function initSmoothScroll() {
    qsa('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      a.addEventListener("click", function (e) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  /* ---------- Login links → login page ---------- */
  function initLoginLinks() {
    if (/login\.html/i.test(window.location.pathname) || window.location.pathname.endsWith("/login")) {
      return;
    }
    qsa('.btn-login[href="#"]').forEach(function (a) {
      a.setAttribute("href", "login.html");
    });
  }

  onReady(function () {
    initMobileNav();
    initLoginModals();
    initPasswordToggles();
    initLoginForms();
    initHeroBookingSearch();
    initTestimonials();
    initContactForm();
    initBookingTabs();
    initRentalsPage();
    initSmoothScroll();
    initLoginLinks();
  });
})();
