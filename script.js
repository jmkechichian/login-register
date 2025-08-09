// DOM Elements cache
const domElements = {
    form: document.getElementById('registrationForm'),
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    terms: document.getElementById('terms'),
    button: document.querySelector('.register-btn')
};

// Constants
const PASSWORD_REQUIREMENTS = {
    minLength: 6,
    maxLength: 18,
    upperCase: /[A-Z]/,
    lowerCase: /[a-z]/,
    number: /[0-9]/,
    specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
};

// Initial setup
function init() {
    setupEventListeners();
    ensurePasswordErrorsContainer();
}

function setupEventListeners() {
    domElements.form.addEventListener('submit', handleFormSubmit);
    domElements.password.addEventListener('input', handlePasswordInput);
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });
    
    // Input focus effects
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]').forEach(input => {
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
    });
}

function ensurePasswordErrorsContainer() {
    if (!document.getElementById('password-errors')) {
        const container = document.createElement('div');
        container.id = 'password-errors';
        container.className = 'password-errors';
        domElements.password.closest('.input-group').appendChild(container);
    }
}

// Main form handler
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: domElements.name.value.trim(),
        email: domElements.email.value.trim(),
        password: domElements.password.value,
        terms: domElements.terms.checked
    };

    if (!validateForm(formData)) return;

    showLoadingState();
    simulateRegistration(formData);
}

// Validation functions
function validateForm({name, email, password, terms}) {
    clearAlerts();

    if (!name) return showAlert('Please enter your name', 'name');
    if (!email) return showAlert('Please enter your email', 'email');
    if (!password) return showAlert('Please enter a password', 'password');
    if (!terms) return showAlert('You must agree to the Terms & Conditions', 'terms');
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showAlert('Please enter a valid email address', 'email');
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length) {
        return showAlert(passwordErrors.join('<br>'), 'password');
    }

    return true;
}

function validatePassword(password) {
    const errors = [];
    const {minLength, maxLength, upperCase, lowerCase, number, specialChar} = PASSWORD_REQUIREMENTS;

    if (password.length < minLength || password.length > maxLength) {
        errors.push('• Password must be 6-18 characters long');
    }
    if (!upperCase.test(password)) errors.push('• At least one uppercase letter (A-Z)');
    if (!lowerCase.test(password)) errors.push('• At least one lowercase letter (a-z)');
    if (!number.test(password)) errors.push('• At least one number (0-9)');
    if (!specialChar.test(password)) errors.push('• At least one special character (!@#$%^&* etc.)');

    return errors;
}

// Alert system
function showAlert(message, field = 'general') {
    clearAlerts(field);

    if (field === 'password') {
        showPasswordErrors(message);
        return;
    }

    const alert = createAlertElement(message, field);
    positionAlert(alert, field);
    setupAutoRemove(alert);
}

function showPasswordErrors(message) {
    const container = document.getElementById('password-errors');
    container.innerHTML = '';

    const messages = typeof message === 'string' && message.includes('<br>') 
        ? message.split('<br>') 
        : [message];

    messages.forEach(msg => {
        const errorItem = document.createElement('div');
        errorItem.className = 'password-error-item';
        errorItem.textContent = msg;
        container.appendChild(errorItem);
    });

    container.closest('.input-group').classList.add('has-error');
    domElements.password.focus();
}

function createAlertElement(message, field) {
    const alert = document.createElement('div');
    alert.className = `custom-alert ${field}-alert`;
    alert.textContent = message;
    return alert;
}

function positionAlert(alert, field) {
    if (['general', 'success'].includes(field)) {
        document.body.appendChild(alert);
    } else {
        const inputField = document.getElementById(field);
        if (inputField) {
            const inputGroup = inputField.closest('.input-group') || inputField.closest('.checkbox-group');
            inputGroup.appendChild(alert);
            inputGroup.classList.add('has-error');
            inputField.focus();
        }
    }
}

function setupAutoRemove(element) {
    setTimeout(() => element.remove(), 5000);
}

function clearAlerts(field = 'all') {
    if (field === 'all') {
        document.querySelectorAll('.custom-alert').forEach(alert => alert.remove());
        document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
    } else {
        document.querySelectorAll(`.${field}-alert`).forEach(alert => alert.remove());
        const inputGroup = document.getElementById(field)?.closest('.input-group, .checkbox-group');
        if (inputGroup) inputGroup.classList.remove('has-error');
    }
}

// Password strength indicator
function handlePasswordInput(e) {
    const password = e.target.value;
    const strengthIndicator = document.getElementById('password-strength') || createPasswordStrengthIndicator();
    
    if (!password) {
        strengthIndicator.style.width = '0%';
        return;
    }
    
    strengthIndicator.style.width = `${calculatePasswordStrength(password)}%`;
    strengthIndicator.style.backgroundColor = getStrengthColor(calculatePasswordStrength(password));
}

function calculatePasswordStrength(password) {
    let strength = Math.min(1, password.length / 6) * 25;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    if (/(.)\1{2,}/.test(password)) strength -= 10;
    
    return Math.max(0, Math.min(100, strength));
}

function createPasswordStrengthIndicator() {
    const container = document.createElement('div');
    container.className = 'password-strength-container';
    
    const indicator = document.createElement('div');
    indicator.id = 'password-strength';
    indicator.className = 'password-strength';
    
    container.appendChild(indicator);
    domElements.password.parentNode.appendChild(container);
    return indicator;
}

function getStrengthColor(strength) {
    return strength < 40 ? '#f5576c' : 
           strength < 70 ? '#f093fb' : '#4facfe';
}

// Other handlers
function handleInputFocus() {
    this.parentElement.style.transform = 'scale(1.02)';
    clearAlerts(this.id);
}

function handleInputBlur() {
    this.parentElement.style.transform = 'scale(1)';
}

function handleSmoothScroll(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    target?.scrollIntoView({ behavior: 'smooth' });
}

// Registration simulation
function showLoadingState() {
    domElements.button.innerHTML = '<span class="spinner"></span> Registering...';
    domElements.button.disabled = true;
}

function simulateRegistration({name}) {
    setTimeout(() => {
        showAlert(`Registration successful! Welcome ${name}!`, 'success');
        resetForm();
    }, 2000);
}

function resetForm() {
    domElements.button.innerHTML = 'Register';
    domElements.button.disabled = false;
    domElements.form.reset();
}

// Particles animation
function createParticle() {
    const particle = document.createElement('div');
    Object.assign(particle.style, {
        position: 'absolute',
        width: `${Math.random() * 4 + 2}px`,
        height: particle.style.width,
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '50%',
        left: `${Math.random() * 100}%`,
        top: '100%',
        pointerEvents: 'none',
        zIndex: '1'
    });
    
    document.body.appendChild(particle);
    
    const animation = particle.animate([
        { transform: 'translateY(0px)', opacity: 1 },
        { transform: 'translateY(-100vh)', opacity: 0 }
    ], {
        duration: Math.random() * 3000 + 2000,
        easing: 'linear'
    });
    
    animation.onfinish = () => particle.remove();
}

// Initialize the application
init();
setInterval(createParticle, 300);