// Login Page Functionality

// Password toggle functionality
function initPasswordToggles() {
    // Login password toggle
    const loginPasswordInput = document.getElementById('login-password');
    const loginPasswordToggle = document.getElementById('login-password-toggle');
    if (loginPasswordInput && loginPasswordToggle) {
        loginPasswordToggle.addEventListener('click', function() {
            const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            loginPasswordInput.setAttribute('type', type);
            const eyeIcon = loginPasswordToggle.querySelector('.eye-icon');
            if (eyeIcon) {
                eyeIcon.textContent = type === 'password' ? '👁️' : '🙈';
            }
        });
    }
    
    // Signup password toggle
    const signupPasswordInput = document.getElementById('signup-password');
    const signupPasswordToggle = document.getElementById('signup-password-toggle');
    if (signupPasswordInput && signupPasswordToggle) {
        signupPasswordToggle.addEventListener('click', function() {
            const type = signupPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            signupPasswordInput.setAttribute('type', type);
            const eyeIcon = signupPasswordToggle.querySelector('.eye-icon');
            if (eyeIcon) {
                eyeIcon.textContent = type === 'password' ? '👁️' : '🙈';
            }
        });
    }
    
    // Signup confirm password toggle
    const signupConfirmInput = document.getElementById('signup-confirm');
    const signupConfirmToggle = document.getElementById('signup-confirm-toggle');
    if (signupConfirmInput && signupConfirmToggle) {
        signupConfirmToggle.addEventListener('click', function() {
            const type = signupConfirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
            signupConfirmInput.setAttribute('type', type);
            const eyeIcon = signupConfirmToggle.querySelector('.eye-icon');
            if (eyeIcon) {
                eyeIcon.textContent = type === 'password' ? '👁️' : '🙈';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize password toggles
    initPasswordToggles();
    
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchAuthTab(tab);
        });
    });
    
    // Login form
    const loginForm = document.getElementById('login-form-element');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(this);
        });
    }
    
    // Signup form
    const signupForm = document.getElementById('signup-form-element');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup(this);
        });
    }
});

// Switch between login and signup tabs
function switchAuthTab(tab) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    
    // Update tab buttons
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update forms
    authForms.forEach(form => {
        if (form.id === `${tab}-form`) {
            form.style.display = 'block';
            form.classList.add('active');
        } else {
            form.style.display = 'none';
            form.classList.remove('active');
        }
    });
}

// Handle login
async function handleLogin(form) {
    const formData = new FormData(form);
    const data = {
        email: formData.get('email'),
        password: formData.get('password'),
        remember: formData.get('remember-me')
    };
    
    // Validate form
    if (!validateLoginForm(data)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
    }
    
    // Try Supabase first, fallback to localStorage
    try {
        // Check if Supabase is available
        if (typeof supabase !== 'undefined' && supabase) {
            // Use Supabase authentication
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password
            });
            
            if (error) throw error;
            
            // Save user to localStorage for compatibility
            if (authData && authData.user) {
                localStorage.setItem('currentUser', JSON.stringify(authData.user));
                sessionStorage.setItem('justLoggedIn', 'true');
            }
            
            showLoginMessage('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            return;
        }
    } catch (supabaseError) {
        console.error('Supabase login error:', supabaseError);
    }
    
    // Fallback to localStorage (for development/testing)
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === data.email && u.password === data.password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            sessionStorage.setItem('justLoggedIn', 'true');
            showLoginMessage('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showLoginMessage('Invalid email or password. Please try again.', 'error');
            
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    }, 1000);
}

// Handle signup
async function handleSignup(form) {
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirm-password')
    };
    
    // Validate form (terms checkbox is checked inside validateSignupForm)
    if (!validateSignupForm(data)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;
    }
    
    // Try Supabase first, fallback to localStorage
    try {
        // Check if Supabase is available
        if (typeof supabase !== 'undefined' && supabase) {
            // Use Supabase authentication
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.name
                    }
                }
            });
            
            if (error) throw error;
            
            // Save user to localStorage for compatibility
            if (authData && authData.user) {
                localStorage.setItem('currentUser', JSON.stringify(authData.user));
                sessionStorage.setItem('justLoggedIn', 'true');
            }
            
            showSignupMessage('Account created successfully! Please check your email to verify (or login if email confirmation is disabled).', 'success');
            
            // Auto-login after signup
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
    } catch (supabaseError) {
        console.error('Supabase signup error:', supabaseError);
    }
    
    // Fallback to localStorage (for development/testing)
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const existingUser = users.find(u => u.email === data.email);
        
        if (existingUser) {
            showSignupMessage('An account with this email already exists.', 'error');
            
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } else {
            const newUser = {
                id: Date.now(),
                name: data.name,
                email: data.email,
                password: data.password,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            sessionStorage.setItem('justLoggedIn', 'true');
            
            showSignupMessage('Account created successfully! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }, 1000);
}

// Validate login form
function validateLoginForm(data) {
    const loginMessage = document.getElementById('login-message');
    
    if (!data.email || !data.password) {
        if (loginMessage) {
            showLoginMessage('Please fill in all fields.', 'error');
        }
        return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        if (loginMessage) {
            showLoginMessage('Please enter a valid email address.', 'error');
        }
        return false;
    }
    
    return true;
}

// Validate signup form
function validateSignupForm(data) {
    const signupMessage = document.getElementById('signup-message');
    
    if (!data.name || !data.email || !data.password || !data.confirmPassword) {
        if (signupMessage) {
            showSignupMessage('Please fill in all fields.', 'error');
        }
        return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        if (signupMessage) {
            showSignupMessage('Please enter a valid email address.', 'error');
        }
        return false;
    }
    
    // Validate password length
    if (data.password.length < 6) {
        if (signupMessage) {
            showSignupMessage('Password must be at least 6 characters long.', 'error');
        }
        return false;
    }
    
    // Validate password match
    if (data.password !== data.confirmPassword) {
        if (signupMessage) {
            showSignupMessage('Passwords do not match.', 'error');
        }
        return false;
    }
    
    // Validate terms acceptance
    // FormData.get() returns "on" for checked checkboxes, null for unchecked
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox || !termsCheckbox.checked) {
        if (signupMessage) {
            showSignupMessage('Please accept the Terms of Service and Privacy Policy.', 'error');
        }
        return false;
    }
    
    return true;
}

// Show login message
function showLoginMessage(message, type) {
    const loginMessage = document.getElementById('login-message');
    if (loginMessage) {
        loginMessage.textContent = message;
        loginMessage.className = `form-message ${type}`;
    }
}

// Show signup message
function showSignupMessage(message, type) {
    const signupMessage = document.getElementById('signup-message');
    if (signupMessage) {
        signupMessage.textContent = message;
        signupMessage.className = `form-message ${type}`;
    }
}

