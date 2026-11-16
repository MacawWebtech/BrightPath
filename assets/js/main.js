/* ============================================================
   BRIGHTPATH ACADEMY — Main JavaScript
   Theme toggle, RTL toggle, mobile/tablet drawer,
   accordions, scroll reveal, back-to-top, validation
   ============================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------------
     1. THEME TOGGLE (Dark / Light)
     -------------------------------------------------------- */
  const THEME_KEY = 'brightpath-theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }


  /* Keep the scroll position stable when theme / direction changes re-flow the page */
  function keepScroll(fn) {
    var root = document.documentElement;
    var y = window.pageYOffset || root.scrollTop || 0;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    fn();
    window.scrollTo(0, y);
    requestAnimationFrame(function () {
      window.scrollTo(0, y);
      requestAnimationFrame(function () {
        window.scrollTo(0, y);
        root.style.scrollBehavior = prev;
      });
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // Update all theme toggle icons
    document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
      var sunIcon = btn.querySelector('.icon-sun');
      var moonIcon = btn.querySelector('.icon-moon');
      if (sunIcon && moonIcon) {
        if (theme === 'dark') {
          sunIcon.style.display = 'block';
          moonIcon.style.display = 'none';
        } else {
          sunIcon.style.display = 'none';
          moonIcon.style.display = 'block';
        }
      }
    });
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Initialize theme
  applyTheme(getPreferredTheme());

  // Bind theme toggle buttons
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.theme-toggle-btn');
    if (btn) {
      e.preventDefault();
      btn.blur();
      keepScroll(toggleTheme);
    }
  });

  /* --------------------------------------------------------
     2. RTL TOGGLE
     -------------------------------------------------------- */
  const RTL_KEY = 'brightpath-rtl';

  function applyRTL(isRTL) {
    if (isRTL) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
    }
    localStorage.setItem(RTL_KEY, isRTL ? 'true' : 'false');

    // Update all RTL buttons to display text
    document.querySelectorAll('.rtl-toggle-btn').forEach(function (btn) {
      btn.textContent = isRTL ? 'LTR' : 'RTL';
      if (isRTL) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update toggle switches if any remain
    document.querySelectorAll('.rtl-toggle-switch').forEach(function (sw) {
      if (isRTL) {
        sw.classList.add('active');
      } else {
        sw.classList.remove('active');
      }
    });
  }

  function toggleRTL() {
    var isRTL = document.documentElement.getAttribute('dir') === 'rtl';
    applyRTL(!isRTL);
  }

  // Initialize RTL
  var savedRTL = localStorage.getItem(RTL_KEY);
  if (savedRTL === 'true') {
    applyRTL(true);
  }

  // Bind RTL toggle
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.rtl-toggle-btn');
    if (btn) {
      e.preventDefault();
      btn.blur();
      keepScroll(toggleRTL);
    }
  });


  /* --------------------------------------------------------
     ACTIVE STATE: tablet / mobile drawer menu
     -------------------------------------------------------- */
  (function markActiveDrawerLinks() {
    function norm(p) {
      p = p.replace(/\/index\.html$/, '/').replace(/\/+$/, '');
      return p || '/';
    }
    var here = norm(window.location.pathname);
    document.querySelectorAll('.mobile-nav-link, .mobile-nav-sublink').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      var path;
      try { path = norm(new URL(href, window.location.href).pathname); } catch (err) { return; }
      var isMatch = path === here;
      a.classList.toggle('active', isMatch);
      if (isMatch) a.setAttribute('aria-current', 'page');
      var dd = a.closest('.mobile-nav-dropdown');
      if (isMatch && dd) {
        dd.classList.add('has-active');
        dd.classList.add('open');
        var t = dd.querySelector('.mobile-nav-dropdown-trigger');
        if (t) t.setAttribute('aria-expanded', 'true');
      }
    });
  })();

  /* --------------------------------------------------------
     3. MOBILE / TABLET DRAWER
     -------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    // Open drawer
    if (e.target.closest('.mobile-menu-btn')) {
      e.preventDefault();
      var drawer = document.querySelector('.mobile-drawer');
      var overlay = document.querySelector('.mobile-drawer-overlay');
      if (drawer) drawer.classList.add('open');
      if (overlay) overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    // Close drawer
    if (e.target.closest('.mobile-drawer-close') || e.target.closest('.mobile-drawer-overlay')) {
      var drawer = document.querySelector('.mobile-drawer');
      var overlay = document.querySelector('.mobile-drawer-overlay');
      if (drawer) drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    // Close drawer on link click
    if (e.target.closest('.mobile-nav-link')) {
      var drawer = document.querySelector('.mobile-drawer');
      var overlay = document.querySelector('.mobile-drawer-overlay');
      if (drawer) drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* --------------------------------------------------------
     4. DROPDOWN MENUS (Desktop Nav)
     -------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.nav-dropdown-trigger');
    if (trigger) {
      e.preventDefault();
      var dropdown = trigger.closest('.nav-dropdown');
      var isOpen = dropdown.classList.contains('open');

      // Close all dropdowns first
      document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
        d.classList.remove('open');
      });

      if (!isOpen) {
        dropdown.classList.add('open');
      }
      return;
    }

    // Close dropdowns on outside click
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
        d.classList.remove('open');
      });
    }
  });

  /* --------------------------------------------------------
     4b. MOBILE DRAWER DROPDOWNS
     -------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.mobile-nav-dropdown-trigger');
    if (!trigger) return;
    e.preventDefault();
    var dropdown = trigger.closest('.mobile-nav-dropdown');
    if (dropdown) {
      var isOpen = dropdown.classList.contains('open');
      dropdown.classList.toggle('open');
      trigger.setAttribute('aria-expanded', !isOpen);
    }
  });

  /* --------------------------------------------------------
     5. ACCORDION / FAQ
     -------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.accordion-trigger');
    if (!trigger) return;

    var item = trigger.closest('.accordion-item');
    var content = item.querySelector('.accordion-content');
    var isActive = item.classList.contains('active');

    // Close all accordion items in the same group
    var accordion = item.closest('.accordion');
    if (accordion) {
      accordion.querySelectorAll('.accordion-item.active').forEach(function (ai) {
        if (ai !== item) {
          ai.classList.remove('active');
          var c = ai.querySelector('.accordion-content');
          if (c) c.style.maxHeight = '0';
        }
      });
    }

    if (isActive) {
      item.classList.remove('active');
      content.style.maxHeight = '0';
    } else {
      item.classList.add('active');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  });

  /* --------------------------------------------------------
     6. SCROLL REVEAL ANIMATION
     -------------------------------------------------------- */
  function initScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    // Immediately mark html as js-ready for progressive enhancement
    document.documentElement.classList.add('js-ready');

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 60px 0px' });

    reveals.forEach(function (el) {
      // Immediately reveal elements already inside or near viewport on page load
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('revealed');
      } else {
        observer.observe(el);
      }
    });
  }

  /* --------------------------------------------------------
     7. BACK TO TOP BUTTON
     -------------------------------------------------------- */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------
     8. HEADER SCROLL STATE
     -------------------------------------------------------- */
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------
     9. CLIENT-SIDE FORM VALIDATION
     -------------------------------------------------------- */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return /^[\+]?[0-9\s\-\(\)]{7,15}$/.test(phone);
  }

  function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('error');
    field.style.borderColor = 'var(--color-black)';
    var error = document.createElement('div');
    error.className = 'form-error';
    error.textContent = message;
    field.parentNode.appendChild(error);
  }

  function clearFieldError(field) {
    field.classList.remove('error');
    field.style.borderColor = '';
    var existing = field.parentNode.querySelector('.form-error');
    if (existing) existing.remove();
  }

  function validateForm(form) {
    var isValid = true;
    var requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(function (field) {
      clearFieldError(field);
      var value = field.value.trim();

      if (!value) {
        showFieldError(field, 'This field is required');
        isValid = false;
        return;
      }

      if (field.type === 'email' && !validateEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        isValid = false;
        return;
      }

      if (field.type === 'tel' && !validatePhone(value)) {
        showFieldError(field, 'Please enter a valid phone number');
        isValid = false;
        return;
      }

      if (field.name === 'confirm-password') {
        var passwordField = form.querySelector('input[name="password"]');
        if (passwordField && value !== passwordField.value) {
          showFieldError(field, 'Passwords do not match');
          isValid = false;
          return;
        }
      }
    });

    return isValid;
  }

  // Auto-clear errors on input
  document.addEventListener('input', function (e) {
    if (e.target.matches('.form-input, .form-select, .form-textarea')) {
      clearFieldError(e.target);
    }
  });

  // Handle form submissions
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches('[data-validate]')) return;

    if (!validateForm(form)) {
      e.preventDefault();
      // Scroll to first error
      var firstError = form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
    }
  });

  /* --------------------------------------------------------
     10. PASSWORD VISIBILITY TOGGLE
     -------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.password-toggle');
    if (!toggle) return;

    var input = toggle.parentElement.querySelector('input');
    if (input) {
      var isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      var showIcon = toggle.querySelector('.icon-eye');
      var hideIcon = toggle.querySelector('.icon-eye-off');
      if (showIcon && hideIcon) {
        showIcon.style.display = isPassword ? 'none' : 'block';
        hideIcon.style.display = isPassword ? 'block' : 'none';
      }
    }
  });

  /* --------------------------------------------------------
     11. NOTIFICATION DROPDOWN
     -------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.notification-btn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      var dropdown = btn.querySelector('.notification-dropdown');
      if (dropdown) dropdown.classList.toggle('open');
      return;
    }

    // Close on outside click
    document.querySelectorAll('.notification-dropdown.open').forEach(function (d) {
      d.classList.remove('open');
    });
  });

  /* --------------------------------------------------------
     12. MODAL MANAGEMENT
     -------------------------------------------------------- */
  window.openModal = function (id) {
    var modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function (id) {
    var modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  document.addEventListener('click', function (e) {
    // Open modal via data-modal
    var trigger = e.target.closest('[data-modal-open]');
    if (trigger) {
      e.preventDefault();
      openModal(trigger.getAttribute('data-modal-open'));
      return;
    }

    // Close modal via close button
    var closer = e.target.closest('.modal-close, [data-modal-close]');
    if (closer) {
      e.preventDefault();
      var overlay = closer.closest('.modal-overlay');
      if (overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
      return;
    }

    // Close modal via overlay click
    if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('open')) {
      e.target.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(function (m) {
        m.classList.remove('open');
        document.body.style.overflow = '';
      });
    }
  });

  /* --------------------------------------------------------
     13. SMOOTH ANCHOR SCROLL
     -------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var targetId = link.getAttribute('href');
    if (targetId === '#') return;
    var target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });

  /* --------------------------------------------------------
     14. SIDEBAR TOGGLE (Dashboard)
     -------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    // Collapse / expand sidebar (desktop)
    if (e.target.closest('.sidebar-collapse-btn')) {
      e.preventDefault();
      var sidebar = document.querySelector('.dashboard-sidebar');
      if (sidebar) sidebar.classList.toggle('collapsed');
    }

    // Mobile sidebar open
    if (e.target.closest('.mobile-sidebar-btn')) {
      e.preventDefault();
      var sidebar = document.querySelector('.dashboard-sidebar');
      var overlay = document.querySelector('.sidebar-overlay');
      if (sidebar) sidebar.classList.add('mobile-open');
      if (overlay) overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    // Mobile sidebar close (overlay click)
    if (e.target.closest('.sidebar-overlay')) {
      var sidebar = document.querySelector('.dashboard-sidebar');
      var overlay = document.querySelector('.sidebar-overlay');
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* --------------------------------------------------------
     15. PRINT BUTTON
     -------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('.btn-print')) {
      e.preventDefault();
      window.print();
    }
  });

  /* --------------------------------------------------------
     16. NEWSLETTER FORM (Demo)
     -------------------------------------------------------- */
  document.addEventListener('submit', function (e) {
    if (e.target.matches('.newsletter-form')) {
      e.preventDefault();
      var input = e.target.querySelector('input');
      if (input && input.value.trim()) {
        if (validateEmail(input.value.trim())) {
          input.value = '';
          alert('Thank you for subscribing! You will receive our study tips and updates.');
        } else {
          alert('Please enter a valid email address.');
        }
      }
    }
  });

  /* --------------------------------------------------------
     17. INITIALIZE ON DOM READY
     -------------------------------------------------------- */
  function init() {
    initScrollReveal();
    initBackToTop();
    initHeaderScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose utility functions globally
  window.BrightPathUtils = {
    validateEmail: validateEmail,
    validatePhone: validatePhone,
    validateForm: validateForm,
    toggleTheme: toggleTheme,
    toggleRTL: toggleRTL
  };

})();
