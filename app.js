// Application state
const appState = {
    currentStep: 0,
    totalSteps: 8,
    formData: {
        consultType: '',
        firmName: '',
        contactName: '',
        email: '',
        phone: '',
        sector: '',
        clientCount: '',
        intakeDesc: '',
        services: [],
        painPoint: '',
        timezone: '',
        date: '',
        time: ''
    }
};

// Services data from the provided JSON
const SERVICES = [
    "Multichannel Client Intake Systems",
    "Consultation Scheduling & Calendaring", 
    "Conversational AI for Inbound Calls",
    "Document & Contract Generation & Filing",
    "Online Payment Collection Facilities & Reminders",
    "Dedicated Client Dashboard Development",
    "Email Marketing & Social Media Management",
    "Website Maintenance & Analytics Reports",
    "Customer Relationship Management Tools",
    "Human Resource Management & Payroll Systems",
    "Deep Case Research, Memo Drafting & Reporting (LexisNexis-like)"
];

// Flatpickr instances
let datePicker, timePicker;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
    setupEventListeners();
    updateProgressBar();
});

function initializeApp() {
    console.log('Initializing app...');
    
    // Detect and set timezone
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneSelect = document.getElementById('timezoneSelect');
    
    // Set detected timezone if it matches our options
    if (detectedTimezone.includes('Johannesburg')) {
        timezoneSelect.value = 'Africa/Johannesburg';
    } else if (detectedTimezone.includes('New_York')) {
        timezoneSelect.value = 'America/New_York';
    } else if (detectedTimezone.includes('Chicago')) {
        timezoneSelect.value = 'America/Chicago';
    } else if (detectedTimezone.includes('Denver')) {
        timezoneSelect.value = 'America/Denver';
    } else if (detectedTimezone.includes('Los_Angeles')) {
        timezoneSelect.value = 'America/Los_Angeles';
    }
    
    appState.formData.timezone = timezoneSelect.value;
    
    // Populate services grid
    populateServicesGrid();
    
    // Initialize date/time pickers
    setTimeout(initializeDateTimePickers, 100);
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Get Started button
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Get Started clicked');
            nextStep();
        });
    }
    
    // All navigation buttons
    document.addEventListener('click', function(e) {
        if (e.target.id.startsWith('nextBtn')) {
            e.preventDefault();
            console.log('Next button clicked:', e.target.id);
            nextStep();
        } else if (e.target.id.startsWith('backBtn')) {
            e.preventDefault();
            console.log('Back button clicked:', e.target.id);
            prevStep();
        }
    });
    
    // Consultation type selection
    const consultRadios = document.querySelectorAll('input[name="consultationTypeRadio"]');
    consultRadios.forEach(radio => {
        radio.addEventListener('change', handleConsultationTypeChange);
    });
    
    // Form field validation listeners
    setupFieldValidation();
    
    // Timezone change
    document.getElementById('timezoneSelect').addEventListener('change', function() {
        appState.formData.timezone = this.value;
    });
    
    // Form submission
    const onboardForm = document.getElementById('onboardForm');
    onboardForm.addEventListener('submit', handleFormSubmit);
    
    // Services checkboxes - use event delegation
    document.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox' && e.target.name === 'services') {
            updateSelectedServices();
        }
    });
}

function populateServicesGrid() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;
    
    servicesGrid.innerHTML = '';
    
    SERVICES.forEach((service, index) => {
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service-item';
        serviceItem.innerHTML = `
            <input type="checkbox" id="service-${index}" name="services" value="${service}">
            <label for="service-${index}">${service}</label>
        `;
        servicesGrid.appendChild(serviceItem);
    });
}

function initializeDateTimePickers() {
    console.log('Initializing date/time pickers...');
    
    if (typeof flatpickr === 'undefined') {
        console.warn('Flatpickr not loaded, retrying...');
        setTimeout(initializeDateTimePickers, 500);
        return;
    }
    
    // Date picker - weekdays only, next 30 days
    const dateInput = document.getElementById('datePicker');
    if (dateInput && !datePicker) {
        datePicker = flatpickr(dateInput, {
            minDate: "today",
            maxDate: new Date().fp_incr(30),
            disable: [
                function(date) {
                    // Disable weekends (Saturday = 6, Sunday = 0)
                    return (date.getDay() === 0 || date.getDay() === 6);
                }
            ],
            dateFormat: "Y-m-d",
            onChange: function(selectedDates, dateStr) {
                appState.formData.date = dateStr;
                validateStep5();
            }
        });
    }
    
    // Time picker - 9 AM to 5 PM in 30-minute increments
    const timeInput = document.getElementById('timePicker');
    if (timeInput && !timePicker) {
        timePicker = flatpickr(timeInput, {
            noCalendar: true,
            enableTime: true,
            time_24hr: true,
            minuteIncrement: 30,
            minTime: "09:00",
            maxTime: "17:00",
            dateFormat: "H:i",
            onChange: function(selectedDates, timeStr) {
                appState.formData.time = timeStr;
                validateStep5();
            }
        });
    }
}

function setupFieldValidation() {
    // Step 2 validation
    const step2Fields = ['firmName', 'contactName', 'email', 'phone'];
    step2Fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => validateStep2());
            field.addEventListener('blur', () => validateStep2());
        }
    });
    
    // Step 3 validation
    const step3Fields = ['sector', 'clientCount'];
    step3Fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', () => validateStep3());
        }
    });
}

function handleConsultationTypeChange(e) {
    appState.formData.consultType = e.target.value;
    const nextBtn = document.getElementById('nextBtn1');
    if (nextBtn) {
        nextBtn.disabled = false;
    }
}

function validateStep2() {
    const firmName = document.getElementById('firmName')?.value.trim() || '';
    const contactName = document.getElementById('contactName')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    
    const isValid = firmName && contactName && email && phone && isValidEmail(email);
    
    // Update form data
    appState.formData.firmName = firmName;
    appState.formData.contactName = contactName;
    appState.formData.email = email;
    appState.formData.phone = phone;
    
    const nextBtn = document.getElementById('nextBtn2');
    if (nextBtn) {
        nextBtn.disabled = !isValid;
    }
    
    return isValid;
}

function validateStep3() {
    const sector = document.getElementById('sector')?.value || '';
    const clientCount = document.getElementById('clientCount')?.value || '';
    const intakeDesc = document.getElementById('intakeDesc')?.value.trim() || '';
    
    const isValid = sector && clientCount;
    
    // Update form data
    appState.formData.sector = sector;
    appState.formData.clientCount = clientCount;
    appState.formData.intakeDesc = intakeDesc;
    
    const nextBtn = document.getElementById('nextBtn3');
    if (nextBtn) {
        nextBtn.disabled = !isValid;
    }
    
    return isValid;
}

function updateSelectedServices() {
    const checkboxes = document.querySelectorAll('input[name="services"]:checked');
    appState.formData.services = Array.from(checkboxes).map(cb => cb.value);
}

function validateStep5() {
    const date = appState.formData.date;
    const time = appState.formData.time;
    
    const isValid = date && time;
    
    const nextBtn = document.getElementById('nextBtn5');
    if (nextBtn) {
        nextBtn.disabled = !isValid;
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function nextStep() {
    console.log('Moving to next step. Current step:', appState.currentStep);
    
    if (appState.currentStep < appState.totalSteps - 1) {
        
        // Special handling for step 4 (pain points)
        if (appState.currentStep === 4) {
            const painPointField = document.getElementById('painPoint');
            if (painPointField) {
                appState.formData.painPoint = painPointField.value.trim();
            }
        }
        
        // Special handling for step 5 (before review) - populate review content
        if (appState.currentStep === 5) {
            populateReviewContent();
        }
        
        hideCurrentStep();
        appState.currentStep++;
        showCurrentStep();
        updateProgressBar();
        
        // Initialize date/time pickers when reaching step 5
        if (appState.currentStep === 5) {
            setTimeout(initializeDateTimePickers, 100);
        }
        
        // Scroll to top
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}

function prevStep() {
    console.log('Moving to previous step. Current step:', appState.currentStep);
    
    if (appState.currentStep > 0) {
        hideCurrentStep();
        appState.currentStep--;
        showCurrentStep();
        updateProgressBar();
        
        // Scroll to top
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}

function hideCurrentStep() {
    const currentStepEl = document.getElementById(`step-${appState.currentStep}`);
    if (currentStepEl) {
        currentStepEl.classList.add('hidden');
        currentStepEl.classList.remove('active');
    }
}

function showCurrentStep() {
    const currentStepEl = document.getElementById(`step-${appState.currentStep}`);
    if (currentStepEl) {
        currentStepEl.classList.remove('hidden');
        currentStepEl.classList.add('active');
    }
}

function updateProgressBar() {
    const progress = (appState.currentStep / (appState.totalSteps - 1)) * 100;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
}

function populateReviewContent() {
    const reviewContent = document.getElementById('reviewContent');
    if (!reviewContent) return;
    
    const consultType = appState.formData.consultType;
    
    const formatServices = () => {
        if (appState.formData.services.length === 0) {
            return 'None selected';
        }
        return appState.formData.services.slice(0, 3).join(', ') + 
               (appState.formData.services.length > 3 ? ` and ${appState.formData.services.length - 3} more` : '');
    };
    
    const formatDateTime = () => {
        if (!appState.formData.date || !appState.formData.time) {
            return 'Not selected';
        }
        const date = new Date(appState.formData.date + 'T' + appState.formData.time);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) + ' at ' + appState.formData.time;
    };
    
    reviewContent.innerHTML = `
        <div class="review-item">
            <span class="review-label">Consultation Type:</span>
            <span class="review-value highlight">
                ${consultType === 'paid' ? '1-Hour Strategic Consultation ($250)' : '15-Minute Introduction Call (Free)'}
            </span>
        </div>
        <div class="review-item">
            <span class="review-label">Law Firm:</span>
            <span class="review-value">${appState.formData.firmName}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Contact Person:</span>
            <span class="review-value">${appState.formData.contactName}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Email:</span>
            <span class="review-value">${appState.formData.email}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Phone:</span>
            <span class="review-value">${appState.formData.phone}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Legal Sector:</span>
            <span class="review-value">${appState.formData.sector}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Active Clients:</span>
            <span class="review-value">${appState.formData.clientCount}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Services of Interest:</span>
            <span class="review-value">${formatServices()}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Scheduled Time:</span>
            <span class="review-value highlight">${formatDateTime()}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Timezone:</span>
            <span class="review-value">${appState.formData.timezone}</span>
        </div>
        ${consultType === 'paid' ? `
        <div class="review-item" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--accent-primary);">
            <span class="review-label">Total Investment:</span>
            <span class="review-value highlight" style="font-size: 18px; font-weight: 700;">$250</span>
        </div>
        ` : ''}
    `;
}

function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Form submitted');
    
    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnSpinner = submitBtn?.querySelector('.btn-spinner');
    
    if (btnText && btnSpinner) {
        btnText.classList.add('hidden');
        btnSpinner.classList.remove('hidden');
    }
    if (submitBtn) {
        submitBtn.disabled = true;
    }
    
    // Update all hidden fields with form data
    updateHiddenFields();
    
    // Simulate form submission for demo (replace with actual Formspree submission)
    setTimeout(() => {
        console.log('Form submission complete');
        
        // Success - move to success step
        hideCurrentStep();
        appState.currentStep = 7;
        showCurrentStep();
        updateProgressBar();
        setupSuccessMessage();
    }, 2000);
    
    // Uncomment this for actual Formspree submission:
    /*
    const formData = new FormData(e.target);
    
    fetch(e.target.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            hideCurrentStep();
            appState.currentStep = 7;
            showCurrentStep();
            updateProgressBar();
            setupSuccessMessage();
        } else {
            throw new Error('Form submission failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error submitting your form. Please try again.');
        
        if (btnText && btnSpinner) {
            btnText.classList.remove('hidden');
            btnSpinner.classList.add('hidden');
        }
        if (submitBtn) {
            submitBtn.disabled = false;
        }
    });
    */
}

function updateHiddenFields() {
    const hiddenFields = {
        'consultTypeHidden': appState.formData.consultType,
        'firmNameHidden': appState.formData.firmName,
        'contactNameHidden': appState.formData.contactName,
        'emailHidden': appState.formData.email,
        'phoneHidden': appState.formData.phone,
        'sectorHidden': appState.formData.sector,
        'clientCountHidden': appState.formData.clientCount,
        'intakeDescHidden': appState.formData.intakeDesc,
        'servicesHidden': appState.formData.services.join(', '),
        'painPointHidden': appState.formData.painPoint,
        'timezoneHidden': appState.formData.timezone,
        'dateHidden': appState.formData.date,
        'timeHidden': appState.formData.time
    };
    
    Object.entries(hiddenFields).forEach(([id, value]) => {
        const field = document.getElementById(id);
        if (field) {
            field.value = value || '';
        }
    });
    
    // Create full JSON for Zapier
    const fullData = {
        ...appState.formData,
        submittedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct'
    };
    
    const fullJsonField = document.getElementById('fullJsonHidden');
    if (fullJsonField) {
        fullJsonField.value = JSON.stringify(fullData);
    }
}

function setupSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    if (!successMessage) return;
    
    const consultType = appState.formData.consultType;
    
    if (consultType === 'paid') {
        successMessage.innerHTML = `
            <strong>Your consultation has been scheduled!</strong><br><br>
            Please check your email for:
            <ul style="text-align: left; margin: 15px 0; color: var(--text-secondary);">
                <li>Payment link for your $250 consultation fee</li>
                <li>Zoom meeting details and agenda</li>
                <li>Pre-consultation questionnaire</li>
            </ul>
            We'll send you a reminder 24 hours before your scheduled time.
        `;
    } else {
        successMessage.innerHTML = `
            <strong>Your introduction call has been scheduled!</strong><br><br>
            Please check your email for:
            <ul style="text-align: left; margin: 15px 0; color: var(--text-secondary);">
                <li>Calendar invitation for your 15-minute call</li>
                <li>Brief overview of what we'll discuss</li>
            </ul>
            We look forward to speaking with you!
        `;
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    // Enter key on buttons
    if (e.key === 'Enter' && e.target.classList.contains('btn') && !e.target.disabled) {
        e.target.click();
    }
    
    // Escape key to go back (except on first and last steps)
    if (e.key === 'Escape' && appState.currentStep > 0 && appState.currentStep < 7) {
        const backBtn = document.querySelector(`#backBtn${appState.currentStep}`);
        if (backBtn && !backBtn.disabled) {
            prevStep();
        }
    }
});

// Form accessibility improvements
document.addEventListener('invalid', function(e) {
    if (e.target.classList.contains('form-control')) {
        e.preventDefault();
        e.target.classList.add('error');
        
        // Remove error class when user starts typing
        e.target.addEventListener('input', function() {
            this.classList.remove('error');
        }, { once: true });
    }
});

// Add error styles dynamically
const style = document.createElement('style');
style.textContent = `
    .form-control.error {
        border-color: var(--error-color) !important;
        box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2) !important;
    }
`;
document.head.appendChild(style);

console.log('App.js loaded successfully');
