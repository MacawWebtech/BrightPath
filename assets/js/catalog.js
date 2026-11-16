/* ============================================================
   BRIGHTPATH ACADEMY — Catalog JavaScript
   Grade tabs, subject/tutor/batch filtering, blog live search
   ============================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------------
     1. GENERIC FILTER SYSTEM
     -------------------------------------------------------- */
  function initFilterSystem() {
    var filterContainers = document.querySelectorAll('[data-filter-group]');

    filterContainers.forEach(function (container) {
      var tabs = container.querySelectorAll('[data-filter]');
      var targetId = container.getAttribute('data-filter-target');
      var target = document.getElementById(targetId);
      if (!target) return;

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function (e) {
          e.preventDefault();

          // Update active state
          tabs.forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');

          var filterValue = tab.getAttribute('data-filter');
          var items = target.querySelectorAll('[data-category]');

          items.forEach(function (item) {
            if (filterValue === 'all') {
              item.style.display = '';
              item.classList.remove('hidden');
            } else {
              var categories = item.getAttribute('data-category').split(',').map(function (c) { return c.trim().toLowerCase(); });
              if (categories.indexOf(filterValue.toLowerCase()) !== -1) {
                item.style.display = '';
                item.classList.remove('hidden');
              } else {
                item.style.display = 'none';
                item.classList.add('hidden');
              }
            }
          });

          // Update count display if exists
          var countEl = document.querySelector('[data-filter-count]');
          if (countEl) {
            var visible = target.querySelectorAll('[data-category]:not(.hidden)').length;
            countEl.textContent = visible + ' result' + (visible !== 1 ? 's' : '') + ' found';
          }
        });
      });
    });
  }

  /* --------------------------------------------------------
     2. MULTI-FILTER SYSTEM (Grade + Subject + Mode)
     -------------------------------------------------------- */
  function initMultiFilter() {
    var multiFilterForm = document.querySelector('[data-multi-filter]');
    if (!multiFilterForm) return;

    var targetId = multiFilterForm.getAttribute('data-multi-filter');
    var target = document.getElementById(targetId);
    if (!target) return;

    function runFilter() {
      var gradeFilter = multiFilterForm.querySelector('[data-filter-key="grade"]');
      var subjectFilter = multiFilterForm.querySelector('[data-filter-key="subject"]');
      var modeFilter = multiFilterForm.querySelector('[data-filter-key="mode"]');
      var dayFilter = multiFilterForm.querySelector('[data-filter-key="day"]');
      var searchInput = multiFilterForm.querySelector('[data-filter-key="search"]');

      var gradeVal = gradeFilter ? gradeFilter.value.toLowerCase() : 'all';
      var subjectVal = subjectFilter ? subjectFilter.value.toLowerCase() : 'all';
      var modeVal = modeFilter ? modeFilter.value.toLowerCase() : 'all';
      var dayVal = dayFilter ? dayFilter.value.toLowerCase() : 'all';
      var searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

      var items = target.querySelectorAll('[data-category]');
      var visibleCount = 0;

      items.forEach(function (item) {
        var categories = item.getAttribute('data-category').toLowerCase();
        var textContent = item.textContent.toLowerCase();

        var gradeMatch = (gradeVal === 'all') || categories.indexOf(gradeVal) !== -1;
        var subjectMatch = (subjectVal === 'all') || categories.indexOf(subjectVal) !== -1;
        var modeMatch = (modeVal === 'all') || categories.indexOf(modeVal) !== -1;
        var dayMatch = (dayVal === 'all') || categories.indexOf(dayVal) !== -1;
        var searchMatch = !searchVal || textContent.indexOf(searchVal) !== -1;

        if (gradeMatch && subjectMatch && modeMatch && dayMatch && searchMatch) {
          item.style.display = '';
          item.classList.remove('hidden');
          visibleCount++;
        } else {
          item.style.display = 'none';
          item.classList.add('hidden');
        }
      });

      // Update count
      var countEl = document.querySelector('[data-filter-count]');
      if (countEl) {
        countEl.textContent = visibleCount + ' result' + (visibleCount !== 1 ? 's' : '') + ' found';
      }

      // Show "no results" message
      var noResults = document.querySelector('.no-results-msg');
      if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    // Bind change events
    multiFilterForm.querySelectorAll('select').forEach(function (select) {
      select.addEventListener('change', runFilter);
    });

    // Bind search input with debounce
    var searchInput = multiFilterForm.querySelector('[data-filter-key="search"]');
    if (searchInput) {
      var debounceTimer;
      searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(runFilter, 300);
      });
    }

    // Bind filter tab clicks within multi-filter
    multiFilterForm.querySelectorAll('.tab-btn[data-filter-val]').forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        var key = tab.getAttribute('data-filter-key-tab');
        var val = tab.getAttribute('data-filter-val');

        // Update active tab in group
        var group = tab.closest('.tab-group');
        if (group) {
          group.querySelectorAll('.tab-btn').forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');
        }

        // Update corresponding select if exists
        var select = multiFilterForm.querySelector('[data-filter-key="' + key + '"]');
        if (select) {
          select.value = val;
        }

        // Store the value in a data attribute on the form for reference
        multiFilterForm.setAttribute('data-current-' + key, val);

        runFilter();
      });
    });
  }

  /* --------------------------------------------------------
     3. GRADE TAB SYSTEM (Home Page)
     -------------------------------------------------------- */
  function initGradeTabs() {
    var tabContainers = document.querySelectorAll('[data-grade-tabs]');

    tabContainers.forEach(function (container) {
      var tabs = container.querySelectorAll('.grade-tab');
      var panels = container.querySelectorAll('.grade-panel');

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function (e) {
          e.preventDefault();
          var target = tab.getAttribute('data-grade');

          // Update active tab
          tabs.forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');

          // Show target panel
          panels.forEach(function (p) {
            if (p.getAttribute('data-grade-panel') === target) {
              p.style.display = '';
              p.classList.add('active');
            } else {
              p.style.display = 'none';
              p.classList.remove('active');
            }
          });
        });
      });
    });
  }

  /* --------------------------------------------------------
     4. BLOG LIVE SEARCH
     -------------------------------------------------------- */
  function initBlogSearch() {
    var searchInput = document.querySelector('.blog-search-input');
    if (!searchInput) return;

    var articles = document.querySelectorAll('.blog-card');
    var debounceTimer;

    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        var query = searchInput.value.toLowerCase().trim();

        articles.forEach(function (card) {
          var title = card.querySelector('.card-title');
          var text = card.querySelector('.card-text');
          var searchText = '';
          if (title) searchText += title.textContent.toLowerCase();
          if (text) searchText += ' ' + text.textContent.toLowerCase();

          if (!query || searchText.indexOf(query) !== -1) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      }, 300);
    });
  }

  /* --------------------------------------------------------
     5. PRICING TOGGLE (Monthly / Quarterly / Annual)
     -------------------------------------------------------- */
  function initPricingToggle() {
    var toggle = document.querySelector('.pricing-toggle');
    if (!toggle) return;

    var buttons = toggle.querySelectorAll('button');
    var pricingCards = document.querySelectorAll('[data-pricing]');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var period = btn.getAttribute('data-period');

        // Update active button
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        // Update pricing values
        pricingCards.forEach(function (card) {
          var prices = card.querySelectorAll('[data-price]');
          prices.forEach(function (priceEl) {
            var priceData = priceEl.getAttribute('data-price');
            try {
              var parsed = JSON.parse(priceData);
              if (parsed[period]) {
                priceEl.textContent = parsed[period];
              }
            } catch (e) {
              // skip invalid JSON
            }
          });
        });
      });
    });
  }

  /* --------------------------------------------------------
     6. SUBJECT SYLLABUS EXPANDER
     -------------------------------------------------------- */
  function initSyllabusExpander() {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.syllabus-module-trigger');
      if (!trigger) return;

      var module = trigger.closest('.syllabus-module');
      if (!module) return;

      var content = module.querySelector('.syllabus-module-content');
      if (!content) return;

      var isExpanded = module.classList.contains('expanded');

      if (isExpanded) {
        module.classList.remove('expanded');
        content.style.maxHeight = '0';
      } else {
        module.classList.add('expanded');
        content.style.maxHeight = content.scrollHeight + 'px';
      }

      var icon = trigger.querySelector('.expand-icon');
      if (icon) {
        icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });
  }

  /* --------------------------------------------------------
     7. TABLE OF CONTENTS (Blog Details)
     -------------------------------------------------------- */
  function initTableOfContents() {
    var toc = document.querySelector('.toc-list');
    var content = document.querySelector('.article-content');
    if (!toc || !content) return;

    var headings = content.querySelectorAll('h2, h3');
    if (!headings.length) return;

    headings.forEach(function (heading, index) {
      var id = 'section-' + index;
      heading.setAttribute('id', id);

      var li = document.createElement('li');
      li.className = heading.tagName === 'H3' ? 'toc-sub' : '';

      var a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = heading.textContent;
      a.className = 'toc-link';

      li.appendChild(a);
      toc.appendChild(li);
    });
  }

  /* --------------------------------------------------------
     8. BATCH SELECT → WIZARD AUTO-POPULATE
     -------------------------------------------------------- */
  function initBatchSelect() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.select-batch-btn');
      if (!btn) return;

      e.preventDefault();
      var row = btn.closest('tr') || btn.closest('[data-batch]');
      if (!row) return;

      // Extract batch data
      var batchData = {
        code: row.getAttribute('data-batch-code') || '',
        subject: row.getAttribute('data-batch-subject') || '',
        grade: row.getAttribute('data-batch-grade') || '',
        days: row.getAttribute('data-batch-days') || '',
        time: row.getAttribute('data-batch-time') || '',
        tutor: row.getAttribute('data-batch-tutor') || '',
        mode: row.getAttribute('data-batch-mode') || ''
      };

      // Store in sessionStorage for the wizard
      sessionStorage.setItem('brightpath-selected-batch', JSON.stringify(batchData));

      // Scroll to wizard or navigate
      var wizard = document.querySelector('.booking-wizard');
      if (wizard) {
        wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Auto-fill Step 1 fields if they exist
        var gradeSelect = wizard.querySelector('[name="grade"]');
        var subjectSelect = wizard.querySelector('[name="subject"]');
        if (gradeSelect && batchData.grade) gradeSelect.value = batchData.grade;
        if (subjectSelect && batchData.subject) subjectSelect.value = batchData.subject;

        // Trigger change events
        if (gradeSelect) gradeSelect.dispatchEvent(new Event('change'));
        if (subjectSelect) subjectSelect.dispatchEvent(new Event('change'));
      }
    });
  }

  /* --------------------------------------------------------
     INITIALIZE
     -------------------------------------------------------- */
  function init() {
    initFilterSystem();
    initMultiFilter();
    initGradeTabs();
    initBlogSearch();
    initPricingToggle();
    initSyllabusExpander();
    initTableOfContents();
    initBatchSelect();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
