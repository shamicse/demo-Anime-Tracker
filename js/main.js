// Main JavaScript file for common functionality

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            // Prevent body scroll when menu is open on mobile
            if (navMenu.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });
        
        // Close menu when clicking outside or on a link
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                body.style.overflow = '';
            }
        });

        // Close menu when clicking on a navigation link
        const navLinks = navMenu.querySelectorAll('a:not(.nav-dropdown-toggle)');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                body.style.overflow = '';
            });
        });

        // Close menu on window resize if screen becomes larger
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                body.style.overflow = '';
            }
        });
    }
    
    // Mobile dropdown toggle
    const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        const dropdown = toggle.closest('.nav-dropdown');
        
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close other dropdowns
            dropdownToggles.forEach(otherToggle => {
                if (otherToggle !== toggle) {
                    otherToggle.closest('.nav-dropdown')?.classList.remove('active');
                }
            });
            
            // Toggle current dropdown
            dropdown?.classList.toggle('active');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.nav-dropdown')) {
            dropdownToggles.forEach(toggle => {
                toggle.closest('.nav-dropdown')?.classList.remove('active');
            });
        }
    });
    
    // Global search functionality
    initGlobalSearch();
    
    // Load featured content on index page
    if (document.querySelector('#featured-anime')) {
        loadFeaturedContent();
    }
    
    // Initialize hero slider on homepage
    if (document.querySelector('.hero-slider')) {
        initHeroSlider();
    }
});

// Global search functionality
function initGlobalSearch() {
    const searchInput = document.getElementById('global-search-input');
    const searchBtn = document.getElementById('global-search-btn');
    const searchResults = document.getElementById('global-search-results');
    
    if (!searchInput || !searchBtn) return;
    
    // Search on button click - redirect to search results page
    searchBtn.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            // Navigate to dedicated search results page
            window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
        } else {
            if (searchResults) searchResults.style.display = 'none';
            showNotification('Please enter at least 2 characters to search.', 'info');
        }
    });
    
    // Search on Enter key - redirect to search results page
    if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
                const query = this.value.trim();
                if (query.length >= 2) {
                    // Navigate to dedicated search results page
                    window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
                } else {
                    if (searchResults) searchResults.style.display = 'none';
                    showNotification('Please enter at least 2 characters to search.', 'info');
                }
        }
    });
    }
    
    // Search as you type (with debounce) - show dropdown preview
    if (searchResults && searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length === 0) {
            searchResults.style.display = 'none';
            return;
        }
        
        // Debounce search - wait 500ms after user stops typing
            // Only show dropdown preview if not pressing Enter or clicking search button
        searchTimeout = setTimeout(() => {
            if (query.length >= 2) {
                performGlobalSearch(query);
                } else {
                    searchResults.style.display = 'none';
            }
        }, 500);
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', function(event) {
        if (searchResults && 
            !searchInput.contains(event.target) && 
            !searchBtn.contains(event.target) && 
            searchResults && !searchResults.contains(event.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Close search results on mobile when tapping outside
    if (window.innerWidth <= 768) {
        document.addEventListener('touchstart', function(event) {
            if (searchResults && 
                !searchInput.contains(event.target) && 
                !searchBtn.contains(event.target) && 
                searchResults && !searchResults.contains(event.target)) {
                searchResults.style.display = 'none';
            }
        });
    }
    }
}

// Perform global search
async function performGlobalSearch(query = null) {
    const searchInput = document.getElementById('global-search-input');
    const searchResults = document.getElementById('global-search-results');
    
    if (!searchInput || !searchResults) return;
    
    query = query || searchInput.value.trim();
    
    if (query.length < 2) {
        searchResults.style.display = 'none';
        return;
    }
    
    // Show loading state
    searchResults.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--gray-text);">Searching...</div>';
    searchResults.style.display = 'block';
    
    try {
        let results = [];
        
        // Try AniList API first (more reliable)
        if (typeof searchAnimeFromAniList === 'function') {
            try {
                const anilistResults = await Promise.race([
                    searchAnimeFromAniList(query, 8),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
                ]);
                
                // Convert AniList format to anime format
                if (anilistResults && anilistResults.length > 0 && typeof convertAniListToAnimeFormat === 'function') {
                    results = anilistResults.map(anime => {
                        const converted = convertAniListToAnimeFormat(anime);
                        return converted;
                    }).filter(anime => anime !== null);
                }
            } catch (error) {
                console.error('AniList search failed, trying MAL:', error);
            }
        }
        
        // Fallback to MAL API if AniList failed
        if (results.length === 0 && typeof searchAnimeFromMAL === 'function') {
            try {
                const malResults = await Promise.race([
                    searchAnimeFromMAL(query, 8),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
                ]);
                
                // Convert MAL format to anime format if needed
                if (malResults.length > 0 && typeof convertMALToAnimeFormat === 'function') {
                    results = malResults.map(anime => {
                        const converted = convertMALToAnimeFormat(anime);
                        return converted;
                    }).filter(anime => anime !== null);
                }
            } catch (error) {
                console.error('MAL search failed:', error);
            }
        }
        
        // Final fallback to local search only if all APIs failed
        if (results.length === 0) {
            if (typeof searchAnime === 'function') {
                results = searchAnime(query);
            } else {
                // Try loading all anime and filtering
                const allAnime = typeof getAllAnime === 'function' ? getAllAnime() : [];
                const lowerQuery = query.toLowerCase();
                results = allAnime.filter(anime =>
                    anime.title.toLowerCase().includes(lowerQuery) ||
                    (anime.studio && anime.studio.toLowerCase().includes(lowerQuery)) ||
                    (anime.genres && anime.genres.some(g => g.toLowerCase().includes(lowerQuery)))
                );
            }
        }
        
        // Display results (limited to 8 for dropdown preview)
        const displayResults = results.slice(0, 8);
        
        if (displayResults.length === 0) {
            searchResults.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--gray-text);">No anime found. Try a different search term.</div>';
        } else {
            // Create compact search result cards
            let resultsHTML = displayResults.map(anime => `
                <div class="anime-card" onclick="window.location.href='anime-detail.html?id=${anime.id}'" style="cursor: pointer; display: flex; gap: 1rem; padding: 1rem; align-items: center;">
                    <img src="${anime.image}" alt="${anime.title}" style="width: 60px; height: 80px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://via.placeholder.com/60x80?text=No+Image'">
                    <div style="flex: 1;">
                        <h3 style="font-size: 0.95rem; margin-bottom: 0.25rem; color: var(--light-text);">${anime.title}</h3>
                        <p style="font-size: 0.85rem; color: var(--gray-text); margin-bottom: 0.25rem;">${anime.year || 'N/A'}</p>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <span style="color: var(--primary-color); font-size: 0.85rem;">★ ${anime.score || 'N/A'}</span>
                            <span style="color: var(--gray-text); font-size: 0.8rem;">${(anime.genres || []).slice(0, 2).join(', ')}</span>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Add "View All Results" link if there are more results
            if (results.length > 8) {
                resultsHTML += `
                    <div style="padding: 1rem; text-align: center; border-top: 1px solid var(--border-color); background-color: var(--bg-secondary);">
                        <a href="search-results.html?q=${encodeURIComponent(query)}" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">
                            View All ${results.length} Results →
                        </a>
                    </div>
                `;
            } else if (results.length > 0) {
                // Show link to search results page anyway for better UX
                resultsHTML += `
                    <div style="padding: 1rem; text-align: center; border-top: 1px solid var(--border-color); background-color: var(--bg-secondary);">
                        <a href="search-results.html?q=${encodeURIComponent(query)}" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">
                            View Full Results →
                        </a>
                    </div>
                `;
            }
            
            searchResults.innerHTML = resultsHTML;
        }
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--error-color);">Error searching. Please try again.</div>';
    }
}

// Initialize Hero Slider
async function initHeroSlider() {
    const slidesContainer = document.getElementById('hero-slides-container');
    const prevBtn = document.getElementById('hero-prev');
    const nextBtn = document.getElementById('hero-next');
    const dotsContainer = document.getElementById('hero-dots');
    
    if (!slidesContainer) return;
    
    let heroAnime = [];
    let currentSlide = 0;
    let slideInterval = null;
    
    // Load featured anime for slider - Use trending anime
    try {
        // Try AniList trending API first
        if (typeof getTrendingAnimeFromAniList === 'function') {
            try {
                const anilistAnime = await Promise.race([
                    getTrendingAnimeFromAniList(5),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                ]);
                
                if (anilistAnime && anilistAnime.length > 0 && typeof convertAniListToAnimeFormat === 'function') {
                    heroAnime = anilistAnime.map(anime => convertAniListToAnimeFormat(anime)).filter(a => a !== null);
                }
            } catch (error) {
                console.error('AniList trending failed for hero, trying popular:', error);
            }
        }
        
        // Fallback to AniList popular if trending failed
        if (heroAnime.length === 0 && typeof getPopularAnimeFromAniList === 'function') {
            try {
                const anilistAnime = await Promise.race([
                    getPopularAnimeFromAniList(5),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                ]);
                
                if (anilistAnime && anilistAnime.length > 0 && typeof convertAniListToAnimeFormat === 'function') {
                    heroAnime = anilistAnime.map(anime => convertAniListToAnimeFormat(anime)).filter(a => a !== null);
                }
            } catch (error) {
                console.error('AniList popular failed for hero, trying MAL:', error);
            }
        }
        
        // Try MAL API if AniList failed
        if (heroAnime.length === 0 && typeof getTopAnimeFromMAL === 'function') {
            try {
                const malAnime = await Promise.race([
                    getTopAnimeFromMAL('bypopularity', 5),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                ]);
                
                if (malAnime && malAnime.length > 0 && typeof convertMALToAnimeFormat === 'function') {
                    heroAnime = malAnime.map(anime => convertMALToAnimeFormat(anime)).filter(a => a !== null);
                }
            } catch (error) {
                console.error('MAL API failed for hero, using local data:', error);
            }
        }
        
        // Fallback to local data
        if (heroAnime.length === 0 && typeof getFeaturedAnime === 'function') {
            heroAnime = getFeaturedAnime(5);
        }
    } catch (error) {
        console.error('Error loading hero anime:', error);
        if (typeof getFeaturedAnime === 'function') {
            heroAnime = getFeaturedAnime(5);
        }
    }
    
    if (heroAnime.length === 0) {
        // Show default slide if no anime loaded
        slidesContainer.innerHTML = `
            <div class="hero-slide active">
                <div class="hero-content">
                    <h1 class="hero-title">Welcome to AnimeTracker</h1>
                    <p class="hero-description">Discover and track your favorite anime series</p>
                    <div class="hero-actions">
                        <a href="anime-list.html" class="btn btn-primary">Browse Anime</a>
                    </div>
                </div>
                <div class="hero-image" style="background-image: url('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200')"></div>
            </div>
        `;
        return;
    }
    
    // Create slides
    slidesContainer.innerHTML = heroAnime.map((anime, index) => `
        <div class="hero-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
            <div class="hero-content">
                <h1 class="hero-title">${anime.title || 'Unknown Title'}</h1>
                <p class="hero-description">${(anime.synopsis || '').substring(0, 150)}${anime.synopsis && anime.synopsis.length > 150 ? '...' : ''}</p>
                <div class="hero-actions">
                    <a href="anime-detail.html?id=${anime.id || anime.mal_id || ''}" class="btn btn-primary">View Details</a>
                    <button class="btn btn-secondary" onclick="addToWatchlist(${anime.id || anime.mal_id || ''})">Add to Watchlist</button>
                </div>
            </div>
            <div class="hero-image" style="background-image: url('${anime.image || anime.bannerImage || 'https://via.placeholder.com/1200x600'}')"></div>
        </div>
    `).join('');
    
    // Create dots
    if (dotsContainer) {
        dotsContainer.innerHTML = heroAnime.map((_, index) => `
            <button class="hero-dot ${index === 0 ? 'active' : ''}" data-slide="${index}" aria-label="Go to slide ${index + 1}"></button>
        `).join('');
    }
    
    // Function to show slide
    function showSlide(index) {
        const slides = slidesContainer.querySelectorAll('.hero-slide');
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.hero-dot') : [];
        
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;
        
        currentSlide = index;
        
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    // Next slide
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    // Previous slide
    function prevSlide() {
        showSlide(currentSlide - 1);
    }
    
    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoSlide();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoSlide();
        });
    }
    
    // Dot navigation
    if (dotsContainer) {
        dotsContainer.querySelectorAll('.hero-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                resetAutoSlide();
            });
        });
    }
    
    // Auto-slide functionality
    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }
    
    function resetAutoSlide() {
        clearInterval(slideInterval);
        startAutoSlide();
    }
    
    // Start auto-slide
    startAutoSlide();
    
    // Pause on hover
    slidesContainer.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    slidesContainer.addEventListener('mouseleave', () => {
        startAutoSlide();
    });
}

// Load featured content on homepage - Using MAL API
async function loadFeaturedContent() {
    const featuredContainer = document.querySelector('#featured-anime');
    const popularContainer = document.querySelector('#popular-anime');
    const trendingContainer = document.querySelector('#trending-anime');
    
    try {
        // Try to load from MAL API first
        if (typeof loadPopularAnimeFromMAL === 'function') {
            // Load featured (top rated)
            if (featuredContainer) {
                try {
                    const featured = await getTopAnimeFromMAL('bypopularity', 6);
                    if (featured && featured.length > 0) {
                        const formatted = featured.map(anime => convertMALToAnimeFormat(anime));
                        featuredContainer.innerHTML = formatted.map(anime => createAnimeCard(anime)).join('');
                    } else {
                        throw new Error('No featured anime');
                    }
                } catch (error) {
                    console.error('MAL API failed for featured, using local data:', error);
                    const featured = getFeaturedAnime(6);
                    featuredContainer.innerHTML = featured.map(anime => createAnimeCard(anime)).join('');
                }
            }
            
            // Load popular
            if (popularContainer) {
                try {
                    await loadPopularAnimeFromMAL('popular-anime', 6);
                } catch (error) {
                    console.error('MAL API failed for popular, using local data:', error);
                    const popular = getPopularAnime(6);
                    popularContainer.innerHTML = popular.map(anime => createAnimeCard(anime)).join('');
                }
            }
            
            // Load trending anime
            if (trendingContainer) {
                try {
                    // Try AniList trending first
                    if (typeof getTrendingAnimeFromAniList === 'function') {
                        try {
                            const anilistTrending = await Promise.race([
                                getTrendingAnimeFromAniList(6),
                                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                            ]);
                            
                            if (anilistTrending && anilistTrending.length > 0 && typeof convertAniListToAnimeFormat === 'function') {
                                const formatted = anilistTrending.map(anime => convertAniListToAnimeFormat(anime)).filter(a => a !== null);
                                trendingContainer.innerHTML = formatted.map(anime => createAnimeCard(anime)).join('');
                                return; // Success, exit early
                            }
                        } catch (error) {
                            console.error('AniList trending failed, trying MAL:', error);
                        }
                    }
                    
                    // Try MAL trending (using top anime by popularity as trending)
                    const now = new Date();
                    const season = getSeason(now.getMonth());
                    const seasonAnime = await getSeasonalAnimeFromMAL(now.getFullYear(), season, 6);
                    if (seasonAnime && seasonAnime.length > 0) {
                        const formatted = seasonAnime.map(anime => convertMALToAnimeFormat(anime));
                        trendingContainer.innerHTML = formatted.map(anime => createAnimeCard(anime)).join('');
                    } else {
                        // Fallback to top anime
                        const topAnime = await getTopAnimeFromMAL('bypopularity', 6);
                        if (topAnime && topAnime.length > 0) {
                            const formatted = topAnime.slice(0, 6).map(anime => convertMALToAnimeFormat(anime));
                            trendingContainer.innerHTML = formatted.map(anime => createAnimeCard(anime)).join('');
                        } else {
                            throw new Error('No trending anime');
                        }
                    }
                } catch (error) {
                    console.error('MAL API failed for trending, using local data:', error);
                    const trending = getTrendingAnime(6);
                    trendingContainer.innerHTML = trending.map(anime => createAnimeCard(anime)).join('');
                }
            }
        } else {
            // Fallback to local data if MAL API not loaded
            if (featuredContainer) {
                const featured = getFeaturedAnime(6);
                featuredContainer.innerHTML = featured.map(anime => createAnimeCard(anime)).join('');
            }
            
            if (popularContainer) {
                const popular = getPopularAnime(6);
                popularContainer.innerHTML = popular.map(anime => createAnimeCard(anime)).join('');
            }
            
            if (trendingContainer) {
                const trending = getTrendingAnime(6);
                trendingContainer.innerHTML = trending.map(anime => createAnimeCard(anime)).join('');
            }
        }
    } catch (error) {
        console.error('Error loading featured content:', error);
        // Fallback to local data
        if (featuredContainer) {
            const featured = getFeaturedAnime(6);
            featuredContainer.innerHTML = featured.map(anime => createAnimeCard(anime)).join('');
        }
        
        if (popularContainer) {
            const popular = getPopularAnime(6);
            popularContainer.innerHTML = popular.map(anime => createAnimeCard(anime)).join('');
        }
        
        if (trendingContainer) {
            const trending = getTrendingAnime(6);
            trendingContainer.innerHTML = trending.map(anime => createAnimeCard(anime)).join('');
        }
    }
}

// Get season from month
function getSeason(month) {
    if (month >= 0 && month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'fall';
}

// Create anime card HTML
function createAnimeCard(anime) {
    return `
        <div class="anime-card" onclick="window.location.href='anime-detail.html?id=${anime.id}'">
            <img src="${anime.image}" alt="${anime.title}" class="anime-card-image" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
            <div class="anime-card-content">
                <h3 class="anime-card-title">${anime.title}</h3>
                <div class="anime-card-meta">
                    <span>${anime.year}</span>
                    <span class="anime-card-rating">${anime.score}</span>
                </div>
            </div>
        </div>
    `;
}

// Add to watchlist (with Supabase support)
async function addToWatchlist(animeId) {
    try {
        // Check if Supabase is available and user is logged in
        if (typeof supabase !== 'undefined' && supabase && typeof addToWatchlistSupabase === 'function') {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    // Use Supabase
                    await addToWatchlistSupabase(animeId, 'watchlist');
                    
                    // Cache current anime if available
                    if (typeof window.currentAnime === 'object' && window.currentAnime && typeof cacheAnimeData === 'function') {
                        cacheAnimeData(window.currentAnime);
                    }
                    
                    showNotification('Added to watchlist!', 'success');
                    return;
                }
            } catch (error) {
                console.error('Error adding to Supabase watchlist:', error);
                showNotification('Error adding to watchlist. Please try again.', 'error');
                // Fallback to localStorage below
            }
        }
        
        // Fallback to localStorage or use watchlist.js function if available
        if (typeof addAnimeToStatus === 'function') {
            await addAnimeToStatus(animeId, 'watchlist');
            // addAnimeToStatus will show notification
        } else {
            // Old localStorage method
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    
    if (!watchlist.includes(animeId)) {
        watchlist.push(animeId);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        showNotification('Added to watchlist!', 'success');
    } else {
        showNotification('Already in watchlist!', 'info');
            }
        }
    } catch (error) {
        console.error('Error in addToWatchlist:', error);
        showNotification('Failed to add to watchlist. Please try again.', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Mobile-friendly positioning
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
    
    // Remove after 3 seconds
    setTimeout(() => {
        const isMobile = window.innerWidth <= 768;
        const animation = isMobile ? 'slideOutMobile' : 'slideOut';
        notification.style.animation = `${animation} 0.3s ease`;
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    @keyframes slideInMobile {
        from {
            transform: translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    @keyframes slideOutMobile {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-20px);
            opacity: 0;
        }
    }
    @media (max-width: 768px) {
        .notification {
            animation: slideInMobile 0.3s ease !important;
        }
        .notification.slide-out {
            animation: slideOutMobile 0.3s ease !important;
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Handle form submissions
document.addEventListener('DOMContentLoaded', function() {
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Validate
            if (!data.name || !data.email || !data.subject || !data.message) {
                showFormMessage('Please fill in all fields.', 'error');
                return;
            }
            
            // Simulate form submission
            showFormMessage('Thank you for your message! We will get back to you soon.', 'success');
            contactForm.reset();
            
            // In a real application, you would send this data to a server
            console.log('Form submitted:', data);
        });
    }
});

// Show form message
function showFormMessage(message, type) {
    const formMessage = document.getElementById('form-message');
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        
        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

