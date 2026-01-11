// Community Page Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeCommunity();
});

function initializeCommunity() {
    // Add click handlers for discussion cards
    const discussionCards = document.querySelectorAll('.discussion-card');
    discussionCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't navigate if clicking on a link
            if (e.target.tagName !== 'A') {
                const link = this.querySelector('a');
                if (link) {
                    // For now, show a message (in production, navigate to discussion page)
                    showCommunityMessage('Discussion feature coming soon! This would navigate to the full discussion thread.', 'info');
                }
            }
        });
        
        // Add hover effect
        card.style.cursor = 'pointer';
    });
    
    // Handle "View All Discussions" button
    const viewAllBtn = document.querySelector('.btn-primary');
    if (viewAllBtn && viewAllBtn.textContent.includes('View All Discussions')) {
        viewAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showCommunityMessage('More discussions feature coming soon! This would show a full list of community discussions.', 'info');
        });
    }
    
    // Make ranking items interactive
    const rankingItems = document.querySelectorAll('.ranking-item');
    rankingItems.forEach(item => {
        item.addEventListener('click', function() {
            const userName = this.querySelector('strong');
            if (userName) {
                showCommunityMessage(`Viewing ${userName.textContent}'s profile feature coming soon!`, 'info');
            }
        });
        item.style.cursor = 'pointer';
    });
    
    // Initialize community stats animation
    animateStats();
}

function animateStats() {
    const statCards = document.querySelectorAll('.stat-card h3');
    
    statCards.forEach(stat => {
        const targetValue = stat.textContent.replace(/,/g, '');
        if (!isNaN(targetValue)) {
            // Animate number counting
            let currentValue = 0;
            const increment = targetValue / 50;
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= targetValue) {
                    stat.textContent = parseInt(targetValue).toLocaleString();
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(currentValue).toLocaleString();
                }
            }, 30);
        }
    });
}

function showCommunityMessage(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const isMobile = window.innerWidth <= 768;
    const topPosition = isMobile ? '20px' : '80px';
    const rightPosition = isMobile ? '15px' : '20px';
    const leftPosition = isMobile ? '15px' : 'auto';
    const maxWidth = isMobile ? 'calc(100% - 30px)' : '400px';
    
    notification.style.cssText = `
        position: fixed;
        top: ${topPosition};
        right: ${rightPosition};
        left: ${leftPosition};
        max-width: ${maxWidth};
        padding: ${isMobile ? '0.875rem 1.25rem' : '1rem 2rem'};
        background-color: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: ${isMobile ? '8px' : '4px'};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-size: ${isMobile ? '0.95rem' : '1rem'};
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Add social link handlers
document.addEventListener('DOMContentLoaded', function() {
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.textContent.trim();
            showCommunityMessage(`${platform} link would open here. Update the href attribute with your actual social media URLs.`, 'info');
        });
    });
});
