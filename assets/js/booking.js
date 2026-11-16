/* ============================================================
   BRIGHTPATH ACADEMY — Booking JavaScript
   7-step demo & batch booking wizard + confirmation storage
   ============================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------------
     1. BOOKING WIZARD STATE
     -------------------------------------------------------- */
  var wizardState = {
    currentStep: 1,
    totalSteps: 7,
    data: {
      grade: '',
      subject: '',
      batchType: '',
      batchTiming: '',
      preferredTutor: '',
      date: '',
      timeSlot: '',
      studentName: '',
      studentGrade: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      notes: ''
    }
  };

  /* --------------------------------------------------------
     2. WIZARD NAVIGATION
     -------------------------------------------------------- */
  function initBookingWizard() {
    var wizard = document.querySelector('.booking-wizard');
    if (!wizard) return;

    var nextBtns = wizard.querySelectorAll('.wizard-next');
    var prevBtns = wizard.querySelectorAll('.wizard-prev');
    var submitBtn = wizard.querySelector('.wizard-submit');

    // Initialize from session storage (if batch was selected from timetable)
    var savedBatch = sessionStorage.getItem('brightpath-selected-batch');
    if (savedBatch) {
      try {
        var batch = JSON.parse(savedBatch);
        wizardState.data.grade = batch.grade || '';
        wizardState.data.subject = batch.subject || '';
        wizardState.data.batchTiming = batch.time || '';
        prefillWizard(wizard, batch);
        sessionStorage.removeItem('brightpath-selected-batch');
      } catch (e) {
        // ignore parse errors
      }
    }

    // Next button
    nextBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (validateCurrentStep(wizard)) {
          saveCurrentStep(wizard);
          goToStep(wizard, wizardState.currentStep + 1);
        }
      });
    });

    // Previous button
    prevBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        goToStep(wizard, wizardState.currentStep - 1);
      });
    });

    // Submit
    if (submitBtn) {
      submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        submitBooking(wizard);
      });
    }

    // Step indicator clicks
    var stepIndicators = wizard.querySelectorAll('.wizard-step');
    stepIndicators.forEach(function (step, index) {
      step.addEventListener('click', function (e) {
        e.preventDefault();
        var stepNum = index + 1;
        if (stepNum < wizardState.currentStep) {
          goToStep(wizard, stepNum);
        }
      });
    });

    showStep(wizard, 1, false);
  }

  function prefillWizard(wizard, batch) {
    var gradeField = wizard.querySelector('[name="grade"]');
    var subjectField = wizard.querySelector('[name="subject"]');
    if (gradeField && batch.grade) gradeField.value = batch.grade;
    if (subjectField && batch.subject) subjectField.value = batch.subject;
  }

  function goToStep(wizard, stepNum) {
    if (stepNum < 1 || stepNum > wizardState.totalSteps) return;
    wizardState.currentStep = stepNum;
    showStep(wizard, stepNum);
  }

  function showStep(wizard, stepNum, shouldScroll) {
    // Update panels
    var panels = wizard.querySelectorAll('.wizard-panel');
    panels.forEach(function (panel) {
      var panelStep = parseInt(panel.getAttribute('data-step'));
      if (panelStep === stepNum) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Update step indicators
    var steps = wizard.querySelectorAll('.wizard-step');
    steps.forEach(function (step, index) {
      var num = index + 1;
      step.classList.remove('active', 'completed');
      if (num === stepNum) {
        step.classList.add('active');
      } else if (num < stepNum) {
        step.classList.add('completed');
      }
    });

    // Update step lines
    var lines = wizard.querySelectorAll('.wizard-step-line');
    lines.forEach(function (line, index) {
      if (index < stepNum - 1) {
        line.style.backgroundColor = 'var(--color-primary)';
      } else {
        line.style.backgroundColor = 'var(--border-color)';
      }
    });

    // If on review step (6), populate summary
    if (stepNum === 6) {
      populateReviewSummary(wizard);
    }

    // Scroll wizard into view (only when the user moves between steps, not on page load)
    if (shouldScroll !== false) {
      wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* --------------------------------------------------------
     3. STEP VALIDATION
     -------------------------------------------------------- */
  function validateCurrentStep(wizard) {
    var currentPanel = wizard.querySelector('.wizard-panel[data-step="' + wizardState.currentStep + '"]');
    if (!currentPanel) return true;

    var requiredFields = currentPanel.querySelectorAll('[required]');
    var isValid = true;

    requiredFields.forEach(function (field) {
      clearFieldError(field);
      var value = field.value.trim();

      if (!value) {
        showFieldError(field, 'This field is required');
        isValid = false;
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showFieldError(field, 'Please enter a valid email address');
        isValid = false;
      } else if (field.type === 'tel' && !/^[\+]?[0-9\s\-\(\)]{7,15}$/.test(value)) {
        showFieldError(field, 'Please enter a valid phone number');
        isValid = false;
      }
    });

    if (!isValid) {
      var firstError = currentPanel.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
    }

    return isValid;
  }

  function showFieldError(field, msg) {
    clearFieldError(field);
    field.classList.add('error');
    field.style.borderColor = 'var(--color-black)';
    var error = document.createElement('div');
    error.className = 'form-error';
    error.textContent = msg;
    field.parentNode.appendChild(error);
  }

  function clearFieldError(field) {
    field.classList.remove('error');
    field.style.borderColor = '';
    var existing = field.parentNode.querySelector('.form-error');
    if (existing) existing.remove();
  }

  /* --------------------------------------------------------
     4. SAVE STEP DATA
     -------------------------------------------------------- */
  function saveCurrentStep(wizard) {
    var currentPanel = wizard.querySelector('.wizard-panel[data-step="' + wizardState.currentStep + '"]');
    if (!currentPanel) return;

    var fields = currentPanel.querySelectorAll('input, select, textarea');
    fields.forEach(function (field) {
      var name = field.name;
      if (name && wizardState.data.hasOwnProperty(name)) {
        wizardState.data[name] = field.value.trim();
      } else if (name) {
        wizardState.data[name] = field.value.trim();
      }
    });

    // Handle radio buttons
    var radios = currentPanel.querySelectorAll('input[type="radio"]:checked');
    radios.forEach(function (radio) {
      wizardState.data[radio.name] = radio.value;
    });
  }

  /* --------------------------------------------------------
     5. REVIEW SUMMARY (Step 6)
     -------------------------------------------------------- */
  function populateReviewSummary(wizard) {
    saveCurrentStep(wizard);
    var summary = wizard.querySelector('.review-summary');
    if (!summary) return;

    var fields = [
      { label: 'Grade', key: 'grade' },
      { label: 'Subject', key: 'subject' },
      { label: 'Batch Type', key: 'batchType' },
      { label: 'Batch Timing', key: 'batchTiming' },
      { label: 'Preferred Tutor', key: 'preferredTutor' },
      { label: 'Date', key: 'date' },
      { label: 'Time Slot', key: 'timeSlot' },
      { label: 'Student Name', key: 'studentName' },
      { label: 'Parent Name', key: 'parentName' },
      { label: 'Email', key: 'parentEmail' },
      { label: 'Phone', key: 'parentPhone' }
    ];

    var html = '';
    fields.forEach(function (f) {
      var val = wizardState.data[f.key] || 'Not specified';
      html += '<div class="confirmation-row">';
      html += '<span class="label">' + f.label + '</span>';
      html += '<span class="value">' + escapeHtml(val) + '</span>';
      html += '</div>';
    });

    if (wizardState.data.notes) {
      html += '<div class="confirmation-row">';
      html += '<span class="label">Notes</span>';
      html += '<span class="value">' + escapeHtml(wizardState.data.notes) + '</span>';
      html += '</div>';
    }

    summary.innerHTML = html;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* --------------------------------------------------------
     6. SUBMIT BOOKING (Step 7)
     -------------------------------------------------------- */
  function submitBooking(wizard) {
    // Generate reference ID
    var refId = 'STK-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Build booking confirmation data
    var bookingData = Object.assign({}, wizardState.data, {
      referenceId: refId,
      bookingDate: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      bookingTime: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'Confirmed'
    });

    // Save to sessionStorage for confirmation page
    sessionStorage.setItem('brightpath-booking', JSON.stringify(bookingData));

    // Navigate to confirmation page
    var basePath = '';
    var currentPath = window.location.pathname;
    if (currentPath.indexOf('/pages/') !== -1) {
      basePath = '';
    } else {
      basePath = 'pages/';
    }

    window.location.href = basePath + 'booking-confirmation.html';
  }

  /* --------------------------------------------------------
     7. BOOKING CONFIRMATION PAGE
     -------------------------------------------------------- */
  function initBookingConfirmation() {
    var confirmationSection = document.querySelector('.booking-confirmation');
    if (!confirmationSection) return;

    var bookingData = sessionStorage.getItem('brightpath-booking');
    if (!bookingData) {
      // Show a default/demo booking
      bookingData = JSON.stringify({
        referenceId: 'STK-DEMO-2024',
        grade: 'Grade 10',
        subject: 'Mathematics',
        batchType: 'Free Demo Class',
        batchTiming: 'Mon, Wed, Fri — 4:00 PM to 5:30 PM',
        preferredTutor: 'Dr. Sarah Jenkins',
        date: 'November 20, 2024',
        timeSlot: '4:00 PM - 5:30 PM',
        studentName: 'Alex Miller',
        parentName: 'Robert Miller',
        parentEmail: 'robert.miller@example.com',
        parentPhone: '+1 (512) 555-0145',
        bookingDate: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        bookingTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: 'Confirmed'
      });
    }

    try {
      var data = JSON.parse(bookingData);

      // Fill reference ID
      var refEl = confirmationSection.querySelector('.booking-ref-id');
      if (refEl) refEl.textContent = data.referenceId;

      // Fill details
      var detailsEl = confirmationSection.querySelector('.confirmation-details');
      if (detailsEl) {
        var fields = [
          { label: 'Reference ID', value: data.referenceId },
          { label: 'Booking Date', value: data.bookingDate },
          { label: 'Student Name', value: data.studentName },
          { label: 'Grade', value: data.grade },
          { label: 'Subject', value: data.subject },
          { label: 'Batch Type', value: data.batchType },
          { label: 'Batch Timing', value: data.batchTiming },
          { label: 'Preferred Tutor', value: data.preferredTutor },
          { label: 'Class Date', value: data.date },
          { label: 'Time Slot', value: data.timeSlot },
          { label: 'Parent Name', value: data.parentName },
          { label: 'Email', value: data.parentEmail },
          { label: 'Phone', value: data.parentPhone },
          { label: 'Status', value: data.status }
        ];

        var html = '';
        fields.forEach(function (f) {
          if (f.value) {
            html += '<div class="confirmation-row">';
            html += '<span class="label">' + f.label + '</span>';
            html += '<span class="value">' + escapeHtml(f.value) + '</span>';
            html += '</div>';
          }
        });
        detailsEl.innerHTML = html;
      }
    } catch (e) {
      // Show error state
      console.error('Error parsing booking data:', e);
    }
  }

  /* --------------------------------------------------------
     8. TIME SLOT SELECTOR
     -------------------------------------------------------- */
  function initTimeSlotSelector() {
    document.addEventListener('click', function (e) {
      var slot = e.target.closest('.time-slot-option');
      if (!slot) return;

      e.preventDefault();
      var group = slot.closest('.time-slot-group');
      if (group) {
        group.querySelectorAll('.time-slot-option').forEach(function (s) {
          s.classList.remove('active');
        });
      }
      slot.classList.add('active');

      // Update hidden input
      var hiddenInput = slot.closest('.wizard-panel, .form-group');
      if (hiddenInput) {
        var input = hiddenInput.querySelector('input[name="timeSlot"]');
        if (input) input.value = slot.getAttribute('data-time');
      }
    });
  }

  /* --------------------------------------------------------
     9. DATE PICKER MIN DATE
     -------------------------------------------------------- */
  function initDatePicker() {
    var dateInputs = document.querySelectorAll('input[type="date"]');
    var today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(function (input) {
      if (!input.getAttribute('min')) {
        input.setAttribute('min', today);
      }
    });
  }

  /* --------------------------------------------------------
     INITIALIZE
     -------------------------------------------------------- */
  function init() {
    initBookingWizard();
    initBookingConfirmation();
    initTimeSlotSelector();
    initDatePicker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
