// Contact Page Functionality

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactSubmit(this);
        });
    }
});

// Handle contact form submission
function handleContactSubmit(form) {
    // Get form data
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    // Validate form
    if (!validateContactForm(data)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
    }
    
    // Simulate form submission (in a real application, you would send this to a server)
    // You can integrate with services like EmailJS, Formspree, or your own backend API here
    setTimeout(() => {
        // Show success message
        showFormMessage('Thank you for your message! We have received your inquiry and will get back to you within 24-48 hours. Your support means the world to us!', 'success');
        
        // Reset form
        form.reset();
        
        // Reset button
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
        
        // Store form submission in localStorage (for demo purposes)
        // In production, this would be sent to your backend/email service
        try {
            const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
            submissions.push({
                ...data,
                timestamp: new Date().toISOString(),
                id: Date.now()
            });
            localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
        } catch (error) {
            console.error('Error storing submission:', error);
        }
        
        // Log form data (in a real application, this would be sent to a server)
        console.log('Contact form submitted:', data);
        
        // Optional: Redirect to thank you page or show confirmation
        // window.location.href = 'thank-you.html';
    }, 1500);
}

// Validate contact form
function validateContactForm(data) {
    const formMessage = document.getElementById('form-message');
    
    // Check if all fields are filled
    if (!data.name || !data.email || !data.subject || !data.message) {
        if (formMessage) {
            showFormMessage('Please fill in all required fields.', 'error');
        }
        return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        if (formMessage) {
            showFormMessage('Please enter a valid email address.', 'error');
        }
        return false;
    }
    
    // Validate message length
    if (data.message.length < 10) {
        if (formMessage) {
            showFormMessage('Please write a message with at least 10 characters.', 'error');
        }
        return false;
    }
    
    return true;
}

// Show form message
function showFormMessage(message, type) {
    const formMessage = document.getElementById('form-message');
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        
        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Hide message after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                formMessage.className = 'form-message';
                formMessage.textContent = '';
            }, 5000);
        }
    }
}

