/* ============================================================
   BRIGHTPATH ACADEMY — Dashboard JavaScript
   Parent & Admin dashboard interactions, modals,
   receipts, charts, student switcher
   ============================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------------
     1. STUDENT SWITCHER (Parent Dashboard)
     -------------------------------------------------------- */
  function initStudentSwitcher() {
    var switcher = document.querySelector('.student-switcher');
    if (!switcher) return;

    var dropdown = switcher.querySelector('.switcher-dropdown');
    if (!dropdown) return;

    switcher.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    dropdown.querySelectorAll('.switcher-option').forEach(function (option) {
      option.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var name = option.getAttribute('data-student-name');
        var grade = option.getAttribute('data-student-grade');

        // Update display
        var nameEl = switcher.querySelector('.student-name');
        var gradeEl = switcher.querySelector('.student-grade');
        if (nameEl) nameEl.textContent = name;
        if (gradeEl) gradeEl.textContent = '— ' + grade;

        // Update active state
        dropdown.querySelectorAll('.switcher-option').forEach(function (o) {
          o.classList.remove('active');
        });
        option.classList.add('active');

        dropdown.classList.remove('open');

        // Store selection
        sessionStorage.setItem('brightpath-active-student', JSON.stringify({ name: name, grade: grade }));

        // Trigger update event
        document.dispatchEvent(new CustomEvent('studentSwitched', { detail: { name: name, grade: grade } }));
      });
    });

    // Close on outside click
    document.addEventListener('click', function () {
      dropdown.classList.remove('open');
    });
  }

  /* --------------------------------------------------------
     2. ATTENDANCE MARKING (Admin)
     -------------------------------------------------------- */
  function initAttendanceMarking() {
    var sheet = document.querySelector('.attendance-sheet');
    if (!sheet) return;

    // Status cycle: Present → Absent → Late → Present
    sheet.querySelectorAll('.attendance-status-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var statuses = ['present', 'absent', 'late'];
        var labels = ['P', 'A', 'L'];
        var currentIndex = statuses.indexOf(btn.getAttribute('data-status'));
        var nextIndex = (currentIndex + 1) % statuses.length;

        btn.setAttribute('data-status', statuses[nextIndex]);
        btn.textContent = labels[nextIndex];

        // Update visual class
        btn.className = 'attendance-status-btn badge';
        if (statuses[nextIndex] === 'present') btn.classList.add('badge-primary');
        else if (statuses[nextIndex] === 'absent') btn.classList.add('badge-dark');
        else if (statuses[nextIndex] === 'late') btn.classList.add('badge-outline');
      });
    });

    // Save attendance button
    var saveBtn = sheet.querySelector('.save-attendance');
    if (saveBtn) {
      saveBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var records = [];
        sheet.querySelectorAll('tr[data-student-id]').forEach(function (row) {
          var studentId = row.getAttribute('data-student-id');
          var statusBtn = row.querySelector('.attendance-status-btn');
          records.push({
            studentId: studentId,
            status: statusBtn ? statusBtn.getAttribute('data-status') : 'present'
          });
        });
        console.log('Attendance saved:', records);
        alert('Attendance has been saved successfully!');
      });
    }
  }

  /* --------------------------------------------------------
     3. TEST SCORE ENTRY (Admin)
     -------------------------------------------------------- */
  function initScoreEntry() {
    var form = document.querySelector('.score-entry-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var scores = [];
      form.querySelectorAll('tr[data-student-id]').forEach(function (row) {
        var studentId = row.getAttribute('data-student-id');
        var scoreInput = row.querySelector('.score-input');
        var maxMarks = row.querySelector('.max-marks');

        scores.push({
          studentId: studentId,
          marks: scoreInput ? scoreInput.value : 0,
          maxMarks: maxMarks ? maxMarks.textContent : 100
        });
      });

      console.log('Scores saved:', scores);
      alert('Test scores have been saved successfully!');
    });
  }

  /* --------------------------------------------------------
     4. FEE PAYMENT MODAL (Parent Dashboard)
     -------------------------------------------------------- */
  function initPaymentModal() {
    document.addEventListener('click', function (e) {
      var payBtn = e.target.closest('.pay-now-btn');
      if (!payBtn) return;

      e.preventDefault();
      var invoiceId = payBtn.getAttribute('data-invoice-id');
      var amount = payBtn.getAttribute('data-amount');
      var subject = payBtn.getAttribute('data-subject');

      // Populate modal
      var modal = document.getElementById('paymentModal');
      if (modal) {
        var amountEl = modal.querySelector('.payment-amount');
        var invoiceEl = modal.querySelector('.payment-invoice-id');
        var subjectEl = modal.querySelector('.payment-subject');

        if (amountEl) amountEl.textContent = amount;
        if (invoiceEl) invoiceEl.textContent = invoiceId;
        if (subjectEl) subjectEl.textContent = subject;

        openModal('paymentModal');
      }
    });

    // Process payment (demo)
    document.addEventListener('click', function (e) {
      var processBtn = e.target.closest('.process-payment-btn');
      if (!processBtn) return;

      e.preventDefault();
      processBtn.textContent = 'Processing...';
      processBtn.disabled = true;

      setTimeout(function () {
        processBtn.textContent = 'Payment Successful!';
        setTimeout(function () {
          closeModal('paymentModal');
          processBtn.textContent = 'Confirm & Pay';
          processBtn.disabled = false;
          alert('Payment processed successfully! Receipt has been generated.');
        }, 1000);
      }, 2000);
    });
  }

  /* --------------------------------------------------------
     5. FEE RECEIPT MODAL (Printable)
     -------------------------------------------------------- */
  function initReceiptModal() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.view-receipt-btn');
      if (!btn) return;

      e.preventDefault();
      var receiptData = {
        id: btn.getAttribute('data-receipt-id') || 'RCP-2024-001',
        date: btn.getAttribute('data-receipt-date') || 'Oct 15, 2024',
        student: btn.getAttribute('data-student') || 'Alex Miller',
        grade: btn.getAttribute('data-grade') || 'Grade 10',
        subject: btn.getAttribute('data-subject') || 'Mathematics',
        amount: btn.getAttribute('data-amount') || '$180',
        method: btn.getAttribute('data-method') || 'Online Transfer',
        period: btn.getAttribute('data-period') || 'October 2024'
      };

      var modal = document.getElementById('receiptModal');
      if (!modal) return;

      var body = modal.querySelector('.modal-body');
      if (!body) return;

      body.innerHTML = '<div class="receipt-content">' +
        '<div style="text-align:center;margin-bottom:24px;">' +
        '<div class="header-logo" style="justify-content:center;margin-bottom:8px;">' +
        '<div class="logo-icon">B</div>' +
        '<span class="logo-text" style="font-family:var(--font-heading);font-weight:800;font-size:1.25rem;">BrightPath Academy</span>' +
        '</div>' +
        '<p style="font-size:var(--fs-xs);color:var(--text-tertiary);">750 Academic Way, Suite 400, Austin, TX 78701</p>' +
        '<p style="font-size:var(--fs-xs);color:var(--text-tertiary);">Phone: +1 (512) 555-0199 | Email: info@brightpath.edu</p>' +
        '<hr style="margin:16px 0;border:none;border-top:1px solid var(--border-color);">' +
        '<h3 style="font-size:var(--fs-lg);margin-bottom:4px;">Fee Payment Receipt</h3>' +
        '</div>' +
        '<div class="confirmation-details">' +
        '<div class="confirmation-row"><span class="label">Receipt No.</span><span class="value">' + receiptData.id + '</span></div>' +
        '<div class="confirmation-row"><span class="label">Date</span><span class="value">' + receiptData.date + '</span></div>' +
        '<div class="confirmation-row"><span class="label">Student Name</span><span class="value">' + receiptData.student + '</span></div>' +
        '<div class="confirmation-row"><span class="label">Grade</span><span class="value">' + receiptData.grade + '</span></div>' +
        '<div class="confirmation-row"><span class="label">Subject</span><span class="value">' + receiptData.subject + '</span></div>' +
        '<div class="confirmation-row"><span class="label">Fee Period</span><span class="value">' + receiptData.period + '</span></div>' +
        '<div class="confirmation-row"><span class="label">Amount Paid</span><span class="value" style="font-weight:700;color:var(--color-primary);">' + receiptData.amount + '</span></div>' +
        '<div class="confirmation-row"><span class="label">Payment Method</span><span class="value">' + receiptData.method + '</span></div>' +
        '<div class="confirmation-row"><span class="label">Status</span><span class="value"><span class="badge badge-primary">Paid</span></span></div>' +
        '</div>' +
        '<div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px dashed var(--border-color);">' +
        '<p style="font-size:var(--fs-xs);color:var(--text-tertiary);">This is a computer-generated receipt. No signature required.</p>' +
        '</div>' +
        '</div>';

      openModal('receiptModal');
    });
  }

  /* --------------------------------------------------------
     6. PROGRESS REPORT CARD (Printable)
     -------------------------------------------------------- */
  function initReportCard() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.view-report-btn');
      if (!btn) return;

      e.preventDefault();
      var modal = document.getElementById('reportCardModal');
      if (modal) openModal('reportCardModal');
    });
  }

  /* --------------------------------------------------------
     7. SIMPLE CSS BAR CHARTS
     -------------------------------------------------------- */
  function initBarCharts() {
    var charts = document.querySelectorAll('.bar-chart[data-values]');
    charts.forEach(function (chart) {
      try {
        var values = JSON.parse(chart.getAttribute('data-values'));
        var labels = JSON.parse(chart.getAttribute('data-labels') || '[]');
        var max = Math.max.apply(null, values);

        chart.innerHTML = '';
        values.forEach(function (val, i) {
          var bar = document.createElement('div');
          bar.className = 'bar';
          bar.style.height = (val / max * 100) + '%';

          var valueEl = document.createElement('span');
          valueEl.className = 'bar-value';
          valueEl.textContent = val;
          bar.appendChild(valueEl);

          if (labels[i]) {
            var labelEl = document.createElement('span');
            labelEl.className = 'bar-label';
            labelEl.textContent = labels[i];
            bar.appendChild(labelEl);
          }

          chart.appendChild(bar);
        });
      } catch (e) {
        // skip invalid chart data
      }
    });
  }

  /* --------------------------------------------------------
     8. SEARCH & FILTER (Admin Tables)
     -------------------------------------------------------- */
  function initAdminSearch() {
    var searchInputs = document.querySelectorAll('.admin-search-input');
    searchInputs.forEach(function (input) {
      var targetId = input.getAttribute('data-search-target');
      var target = document.getElementById(targetId);
      if (!target) return;

      var debounceTimer;
      input.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          var query = input.value.toLowerCase().trim();
          var rows = target.querySelectorAll('tbody tr');

          rows.forEach(function (row) {
            var text = row.textContent.toLowerCase();
            row.style.display = (!query || text.indexOf(query) !== -1) ? '' : 'none';
          });
        }, 300);
      });
    });
  }

  /* --------------------------------------------------------
     9. ADD/EDIT MODALS (Admin)
     -------------------------------------------------------- */
  function initAdminModals() {
    // Edit button populates modal with row data
    document.addEventListener('click', function (e) {
      var editBtn = e.target.closest('.edit-row-btn');
      if (!editBtn) return;

      e.preventDefault();
      var modalId = editBtn.getAttribute('data-modal');
      var row = editBtn.closest('tr');
      if (!row || !modalId) return;

      var modal = document.getElementById(modalId);
      if (!modal) return;

      // Auto-fill form from row data attributes
      var cells = row.querySelectorAll('td[data-field]');
      cells.forEach(function (cell) {
        var fieldName = cell.getAttribute('data-field');
        var input = modal.querySelector('[name="' + fieldName + '"]');
        if (input) {
          input.value = cell.textContent.trim();
        }
      });

      openModal(modalId);
    });
  }

  /* --------------------------------------------------------
     10. REPORT ABSENCE MODAL (Parent)
     -------------------------------------------------------- */
  function initReportAbsence() {
    var form = document.querySelector('.absence-report-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('Absence has been reported to the tutor. Thank you!');
      closeModal('absenceModal');
      form.reset();
    });
  }

  /* --------------------------------------------------------
     11. BATCH CHANGE REQUEST (Parent)
     -------------------------------------------------------- */
  function initBatchChangeRequest() {
    var form = document.querySelector('.batch-change-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('Batch change request has been submitted. Our team will get back to you shortly.');
      closeModal('batchChangeModal');
      form.reset();
    });
  }

  /* --------------------------------------------------------
     12. ADMIN FORM SUBMISSIONS (Demo)
     -------------------------------------------------------- */
  function initAdminForms() {
    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form.matches('.admin-modal-form')) return;

      e.preventDefault();
      var modalOverlay = form.closest('.modal-overlay');

      alert('Record has been saved successfully!');

      if (modalOverlay) {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
      form.reset();
    });
  }

  /* --------------------------------------------------------
     13. FEE REMINDER (Admin)
     -------------------------------------------------------- */
  function initFeeReminder() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.send-reminder-btn');
      if (!btn) return;

      e.preventDefault();
      var parentName = btn.getAttribute('data-parent-name') || 'Parent';
      btn.textContent = 'Sending...';
      btn.disabled = true;

      setTimeout(function () {
        btn.textContent = 'Sent ✓';
        setTimeout(function () {
          btn.textContent = 'Send Reminder';
          btn.disabled = false;
        }, 2000);
        alert('Payment reminder sent to ' + parentName + ' via SMS & Email.');
      }, 1000);
    });
  }

  /* --------------------------------------------------------
     14. DEMO BOOKING MANAGEMENT (Admin)
     -------------------------------------------------------- */
  function initDemoManagement() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.demo-action-btn');
      if (!btn) return;

      e.preventDefault();
      var action = btn.getAttribute('data-action');
      var bookingId = btn.getAttribute('data-booking-id');

      switch (action) {
        case 'approve':
          alert('Demo booking ' + bookingId + ' has been approved.');
          var row = btn.closest('tr');
          var statusBadge = row ? row.querySelector('.booking-status') : null;
          if (statusBadge) {
            statusBadge.textContent = 'Approved';
            statusBadge.className = 'badge badge-primary booking-status';
          }
          break;
        case 'reschedule':
          openModal('rescheduleModal');
          break;
        case 'complete':
          alert('Demo booking ' + bookingId + ' marked as completed.');
          break;
        default:
          break;
      }
    });
  }

  /* --------------------------------------------------------
     15. ANNOUNCEMENT PUBLISHER (Admin)
     -------------------------------------------------------- */
  function initAnnouncements() {
    var form = document.querySelector('.announcement-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('Announcement has been published to all parents.');
      form.reset();
    });
  }

  /* --------------------------------------------------------
     16. SETTINGS FORMS
     -------------------------------------------------------- */
  function initSettings() {
    // Change password
    var pwForm = document.querySelector('.change-password-form');
    if (pwForm) {
      pwForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var newPw = pwForm.querySelector('[name="new-password"]');
        var confirmPw = pwForm.querySelector('[name="confirm-new-password"]');
        if (newPw && confirmPw && newPw.value !== confirmPw.value) {
          alert('New passwords do not match.');
          return;
        }
        alert('Password has been changed successfully!');
        pwForm.reset();
      });
    }

    // Toggle switches (notification preferences)
    document.querySelectorAll('.setting-toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        toggle.classList.toggle('active');
        var knob = toggle.querySelector('.toggle-knob');
        var settingName = toggle.getAttribute('data-setting');
        var isActive = toggle.classList.contains('active');
        console.log('Setting ' + settingName + ': ' + (isActive ? 'enabled' : 'disabled'));
      });
    });
  }

  /* --------------------------------------------------------
     17. LOGIN ROLE SWITCH
     -------------------------------------------------------- */
  function initLoginRoleSwitch() {
    var form = document.getElementById('loginForm');
    if (!form) return;

    // Login form submit: validate first, then remember the session and go to the parent dashboard
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailEl = form.querySelector('[name="email"]');
      var passEl = form.querySelector('[name="password"]');
      var email = emailEl ? emailEl.value.trim() : '';
      var pass = passEl ? passEl.value : '';
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      // Invalid / empty fields: stay on the login page (main.js shows the field errors)
      if (!emailOk || !pass.trim()) return;

      var remember = form.querySelector('[name="remember-me"]');
      var session = JSON.stringify({ role: 'parent', email: email, at: Date.now() });
      try {
        sessionStorage.removeItem('brightpath-auth');
        localStorage.removeItem('brightpath-auth');
        if (remember && remember.checked) {
          localStorage.setItem('brightpath-auth', session);
        } else {
          sessionStorage.setItem('brightpath-auth', session);
        }
      } catch (err) {}

      var prefix = window.location.pathname.indexOf('/pages/') !== -1 ? '../' : '';
      window.location.href = prefix + 'parent-dashboard/index.html';
    });
  }

  /* --------------------------------------------------------
     18. ENQUIRY MANAGEMENT (Admin)
     -------------------------------------------------------- */
  function initEnquiryManagement() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.mark-read-btn');
      if (!btn) return;

      e.preventDefault();
      var row = btn.closest('tr') || btn.closest('.message-item');
      if (row) {
        row.classList.add('read');
        var statusBadge = row.querySelector('.message-status');
        if (statusBadge) {
          statusBadge.textContent = 'Read';
          statusBadge.className = 'badge badge-outline message-status';
        }
      }
      btn.remove();
    });
  }

  /* --------------------------------------------------------
     INITIALIZE
     -------------------------------------------------------- */
  function init() {
    initStudentSwitcher();
    initAttendanceMarking();
    initScoreEntry();
    initPaymentModal();
    initReceiptModal();
    initReportCard();
    initBarCharts();
    initAdminSearch();
    initAdminModals();
    initReportAbsence();
    initBatchChangeRequest();
    initAdminForms();
    initFeeReminder();
    initDemoManagement();
    initAnnouncements();
    initSettings();
    initLoginRoleSwitch();
    initEnquiryManagement();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
