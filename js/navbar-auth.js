// Navbar Authentication State Management
// Shows/hides login button based on authentication status

// Logout function
async function logout() {
    try {
        // Logout from Supabase
        if (typeof supabase !== 'undefined' && supabase && supabase.auth) {
            await supabase.auth.signOut();
        }
        
        // Clear localStorage
        localStorage.removeItem('currentUser');
        sessionStorage.clear();
        
        // Redirect to home page
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error during logout:', error);
        // Still clear local data and redirect
        localStorage.removeItem('currentUser');
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

// Check authentication status and update navbar
async function updateNavbarAuth() {
    const loginButtons = document.querySelectorAll('.btn-login, a[href="login.html"].btn-login');
    const footerLoginLinks = document.querySelectorAll('.footer a[href="login.html"]');
    
    // Check if user is logged in (Supabase)
    let isLoggedIn = false;
    
    if (typeof supabase !== 'undefined' && supabase && supabase.auth) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            isLoggedIn = !!session;
        } catch (error) {
            console.error('Error checking session:', error);
        }
    }
    
    // Also check localStorage as fallback
    if (!isLoggedIn) {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            try {
                const user = JSON.parse(currentUser);
                isLoggedIn = !!user;
            } catch (error) {
                // Invalid JSON, user not logged in
            }
        }
    }
    
    // Hide/show login buttons
    loginButtons.forEach(btn => {
        if (isLoggedIn) {
            btn.style.display = 'none';
        } else {
            btn.style.display = '';
        }
    });
    
    // Hide/show footer login links
    footerLoginLinks.forEach(link => {
        if (isLoggedIn) {
            link.style.display = 'none';
        } else {
            link.style.display = '';
        }
    });
    
    // Add/remove logout button
    const navMenu = document.querySelector('.nav-menu');
    let logoutBtn = document.querySelector('.btn-logout');
    
    if (isLoggedIn) {
        // Show logout button if not already present
        if (!logoutBtn && navMenu) {
            logoutBtn = document.createElement('li');
            logoutBtn.innerHTML = '<a href="#" class="btn-logout">Logout</a>';
            navMenu.appendChild(logoutBtn);
            
            // Add click event
            const logoutLink = logoutBtn.querySelector('.btn-logout');
            if (logoutLink) {
                logoutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
            }
        }
        if (logoutBtn) logoutBtn.style.display = '';
    } else {
        // Hide logout button
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
    
    // If on login page and already logged in, redirect to home
    if (isLoggedIn && window.location.pathname.includes('login.html')) {
        // Don't redirect if just logged in (let the login function handle it)
        // Only redirect if user navigates to login page while already logged in
        const justLoggedIn = sessionStorage.getItem('justLoggedIn');
        if (!justLoggedIn) {
            window.location.href = 'index.html';
        } else {
            sessionStorage.removeItem('justLoggedIn');
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateNavbarAuth();
});

// Also check when Supabase auth state changes
if (typeof supabase !== 'undefined' && supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
        updateNavbarAuth();
    });
}
