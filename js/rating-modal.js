// Rating Modal UI
// Beautiful modal for rating anime

// Create and show rating modal
function showRatingModal() {
    // Get anime ID
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = parseInt(urlParams.get('id'));
    
    if (!animeId) {
        showNotification('Anime ID not found', 'error');
        return;
    }
    
    // Get anime title if available
    const animeTitle = document.getElementById('anime-title')?.textContent || 'this anime';
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'rating-modal-overlay';
    overlay.id = 'rating-modal-overlay';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'rating-modal';
    
    modal.innerHTML = `
        <div class="rating-modal-header">
            <h2>Rate ${animeTitle}</h2>
            <button class="rating-modal-close" id="rating-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="rating-modal-body">
            <div class="rating-stars-container">
                <div class="rating-stars" id="rating-stars">
                    ${[1, 2, 3, 4, 5].map(i => `
                        <span class="rating-star" data-rating="${i}">☆</span>
                    `).join('')}
                </div>
                <div class="rating-text" id="rating-text">Click a star to rate</div>
            </div>
            <div class="rating-modal-actions">
                <button class="btn btn-secondary" id="rating-modal-cancel">Cancel</button>
                <button class="btn btn-primary" id="rating-modal-submit" disabled>Submit Rating</button>
            </div>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Get elements
    const stars = modal.querySelectorAll('.rating-star');
    const ratingText = modal.querySelector('#rating-text');
    const submitBtn = modal.querySelector('#rating-modal-submit');
    const cancelBtn = modal.querySelector('#rating-modal-cancel');
    const closeBtn = modal.querySelector('#rating-modal-close');
    let selectedRating = 0;
    
    // Star hover and click handlers
    stars.forEach((star, index) => {
        const rating = index + 1;
        
        star.addEventListener('mouseenter', function() {
            highlightStars(rating);
            updateRatingText(rating);
        });
        
        star.addEventListener('click', function() {
            selectedRating = rating;
            highlightStars(rating);
            updateRatingText(rating);
            submitBtn.disabled = false;
        });
    });
    
    // Reset stars on mouse leave
    const starsContainer = modal.querySelector('#rating-stars');
    starsContainer.addEventListener('mouseleave', function() {
        if (selectedRating === 0) {
            resetStars();
            ratingText.textContent = 'Click a star to rate';
        } else {
            highlightStars(selectedRating);
            updateRatingText(selectedRating);
        }
    });
    
    // Highlight stars function
    function highlightStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.textContent = '★';
                star.classList.add('active');
            } else {
                star.textContent = '☆';
                star.classList.remove('active');
            }
        });
    }
    
    // Reset stars function
    function resetStars() {
        stars.forEach(star => {
            star.textContent = '☆';
            star.classList.remove('active');
        });
    }
    
    // Update rating text
    function updateRatingText(rating) {
        const texts = {
            1: 'Poor',
            2: 'Fair',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent'
        };
        ratingText.textContent = `${rating} star${rating > 1 ? 's' : ''} - ${texts[rating]}`;
    }
    
    // Submit rating
    submitBtn.addEventListener('click', async function() {
        if (selectedRating > 0) {
            // Save rating (update watchlist if exists, or save separately)
            try {
                // Try to update watchlist rating if anime is in watchlist
                if (typeof supabase !== 'undefined' && supabase) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session && typeof updateWatchlistItemByAnimeId === 'function') {
                        // Update rating in watchlist
                        await updateWatchlistItemByAnimeId(animeId, { rating: selectedRating });
                    }
                }
                
                // Also save to local storage for fallback
                const storedData = JSON.parse(localStorage.getItem('animeTracking')) || {};
                if (!storedData.tracking) storedData.tracking = {};
                if (!storedData.tracking[animeId]) storedData.tracking[animeId] = {};
                storedData.tracking[animeId].rating = selectedRating;
                localStorage.setItem('animeTracking', JSON.stringify(storedData));
                
                closeModal();
                if (typeof showNotification === 'function') {
                    showNotification(`Thank you for rating! You gave it ${selectedRating} star${selectedRating > 1 ? 's' : ''}.`, 'success');
                }
            } catch (error) {
                console.error('Error saving rating:', error);
                closeModal();
                if (typeof showNotification === 'function') {
                    showNotification('Thank you for rating!', 'success');
                }
            }
        }
    });
    
    // Cancel/Close handlers
    function closeModal() {
        overlay.remove();
    }
    
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('rating-modal-overlay')) {
            closeModal();
        }
    });
}

// Helper function to update watchlist item by anime ID
async function updateWatchlistItemByAnimeId(animeId, updates) {
    if (!supabase) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // First find the watchlist item
    const { data: items } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('anime_id', animeId)
        .maybeSingle();
    
    if (items && items.id) {
        // Update existing item
        await supabase
            .from('watchlist')
            .update({
                ...updates,
                updated_date: new Date().toISOString()
            })
            .eq('id', items.id);
    } else {
        // Create new item with rating
        await supabase
            .from('watchlist')
            .insert({
                user_id: user.id,
                anime_id: animeId,
                status: 'watchlist',
                rating: updates.rating || null,
                progress: 0,
                notes: ''
            });
    }
}
