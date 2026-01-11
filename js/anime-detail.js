// Anime Detail Page Functionality

document.addEventListener('DOMContentLoaded', async function() {
    // Get anime ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = parseInt(urlParams.get('id'));
    
    if (animeId) {
        await loadAnimeDetail(animeId);
    } else {
        showError('Anime ID not found. Please search for an anime or select one from the list.');
    }
    
    // Trailer button
    const watchTrailerBtn = document.getElementById('watch-trailer-btn');
    if (watchTrailerBtn) {
        watchTrailerBtn.addEventListener('click', function() {
            toggleTrailer();
        });
    }
    
    // Add to watchlist button
    const addWatchlistBtn = document.getElementById('add-watchlist-btn');
    if (addWatchlistBtn) {
        addWatchlistBtn.addEventListener('click', async function() {
            const currentAnimeId = parseInt(new URLSearchParams(window.location.search).get('id'));
            if (currentAnimeId) {
                await addToWatchlist(currentAnimeId);
                await updateButtonStates(currentAnimeId);
            }
        });
    }
    
    // Add to watch later button
    const addWatchLaterBtn = document.getElementById('add-watch-later-btn');
    if (addWatchLaterBtn) {
        addWatchLaterBtn.addEventListener('click', async function() {
            const currentAnimeId = parseInt(new URLSearchParams(window.location.search).get('id'));
            if (currentAnimeId) {
                if (typeof addToWatchLater === 'function') {
                    await addToWatchLater(currentAnimeId);
                } else if (typeof addAnimeToStatus === 'function') {
                    await addAnimeToStatus(currentAnimeId, 'watch-later');
                    // Cache current anime
                    if (typeof window.currentAnime === 'object' && window.currentAnime && typeof cacheAnimeData === 'function') {
                        cacheAnimeData(window.currentAnime);
                    }
                    // addAnimeToStatus will show notification
                } else {
                    // Fallback
                    const storedData = JSON.parse(localStorage.getItem('animeTracking')) || {};
                    if (!storedData['watch-later']) storedData['watch-later'] = [];
                    if (!storedData['watch-later'].includes(currentAnimeId)) {
                        storedData['watch-later'].push(currentAnimeId);
                        localStorage.setItem('animeTracking', JSON.stringify(storedData));
                    }
                    // Cache current anime
                    if (typeof window.currentAnime === 'object' && window.currentAnime && typeof cacheAnimeData === 'function') {
                        cacheAnimeData(window.currentAnime);
                    }
                    showNotification('Added to Watch Later!', 'success');
                }
                await updateButtonStates(currentAnimeId);
            }
        });
    }
    
    // Status button
    const statusBtn = document.getElementById('status-btn');
    if (statusBtn) {
        statusBtn.addEventListener('click', async function() {
            const currentAnimeId = parseInt(new URLSearchParams(window.location.search).get('id'));
            if (currentAnimeId) {
                await showStatusModal(currentAnimeId);
            }
        });
    }
    
    // Rate button
    const rateBtn = document.getElementById('rate-btn');
    if (rateBtn) {
        rateBtn.addEventListener('click', function() {
            showRatingModal();
        });
    }
    
    // Update button states based on current status
    if (animeId) {
        updateButtonStates(animeId).catch(err => console.error('Error updating button states:', err));
    }
    
    // Tab switching
    const infoTabs = document.querySelectorAll('.info-tab');
    infoTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
});

// Load anime detail - Using multiple APIs with fallbacks
async function loadAnimeDetail(id) {
    let anime = null;
    
    // Show loading state
    const loading = document.getElementById('detail-loading');
    const content = document.getElementById('anime-detail-content');
    if (loading) {
        loading.style.display = 'block';
        loading.innerHTML = '<p>Loading anime details...</p>';
    }
    if (content) content.style.display = 'none';
    
    // Try AniList API first (more reliable and faster)
    if (typeof loadAnimeDetailFromAniList === 'function') {
        try {
            if (loading) loading.innerHTML = '<p>Loading from AniList...</p>';
            anime = await Promise.race([
                loadAnimeDetailFromAniList(id),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 12000))
            ]);
            
            if (anime && anime.title) {
                // Successfully loaded from AniList
                fillAnimeDetails(anime);
                
                // Cache anime data for watchlist
                if (typeof cacheAnimeData === 'function') {
                    cacheAnimeData(anime);
                }
                window.currentAnime = anime;
                
                // Hide loading, show content
                if (loading) loading.style.display = 'none';
                if (content) content.style.display = 'block';
                
                // Load related anime from recommendations
                if (anime.recommendations && anime.recommendations.length > 0) {
                    const relatedContainer = document.getElementById('related-anime');
                    if (relatedContainer && typeof createAnimeCard === 'function') {
                        relatedContainer.innerHTML = anime.recommendations.map(a => createAnimeCard(a)).join('');
                    } else {
                        loadRelatedAnime(anime.mal_id || anime.id);
                    }
                } else {
                    loadRelatedAnime(anime.mal_id || anime.id);
                }
                return;
            }
        } catch (error) {
            console.error('AniList API failed, trying MAL API:', error);
        }
    }
    
    // Try MAL API as fallback
    if (!anime && typeof loadAnimeDetailFromMAL === 'function') {
        try {
            if (loading) loading.innerHTML = '<p>Loading from MyAnimeList...</p>';
            anime = await Promise.race([
                loadAnimeDetailFromMAL(id),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
            ]);
            
            if (anime && anime.title) {
                // Successfully loaded from MAL
                fillAnimeDetails(anime);
                
                // Cache anime data for watchlist
                if (typeof cacheAnimeData === 'function') {
                    cacheAnimeData(anime);
                }
                window.currentAnime = anime;
                
                // Hide loading, show content
                if (loading) loading.style.display = 'none';
                if (content) content.style.display = 'block';
                
                // Load related anime from MAL
                if (anime.mal_id && typeof getAnimeRecommendationsFromMAL === 'function') {
                    try {
                        const recommendations = await Promise.race([
                            getAnimeRecommendationsFromMAL(anime.mal_id),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
                        ]);
                        const relatedContainer = document.getElementById('related-anime');
                        if (relatedContainer && recommendations && recommendations.length > 0) {
                            const formatted = recommendations.map(a => convertMALToAnimeFormat ? convertMALToAnimeFormat(a) : a).filter(a => a !== null);
                            relatedContainer.innerHTML = formatted.map(a => createAnimeCard(a)).join('');
                        } else {
                            loadRelatedAnime(id);
                        }
                    } catch (error) {
                        console.error('Failed to load recommendations from MAL:', error);
                        loadRelatedAnime(id);
                    }
                } else {
                    loadRelatedAnime(id);
                }
                return;
            }
        } catch (error) {
            console.error('MAL API failed, trying direct fetch:', error);
        }
    }
    
    // Try direct MAL fetch as last API attempt
    if (!anime && typeof getAnimeFromMAL === 'function') {
        try {
            if (loading) loading.innerHTML = '<p>Loading from MyAnimeList...</p>';
            const malAnime = await Promise.race([
                getAnimeFromMAL(id),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
            ]);
            
            if (malAnime && typeof convertMALToAnimeFormat === 'function') {
                anime = convertMALToAnimeFormat(malAnime);
                if (anime && anime.title) {
                    // Load additional data
                    try {
                        const [characters, episodes] = await Promise.all([
                            Promise.race([getAnimeCharactersFromMAL(id), new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))]).catch(() => []),
                            Promise.race([getAnimeEpisodesFromMAL(id), new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))]).catch(() => [])
                        ]);
                        anime.characters = characters || [];
                        anime.episodeList = episodes || [];
                    } catch (error) {
                        console.error('Error loading additional data:', error);
                        anime.characters = [];
                        anime.episodeList = [];
                    }
                    
                    fillAnimeDetails(anime);
                    
                    // Cache anime data for watchlist
                    if (typeof cacheAnimeData === 'function') {
                        cacheAnimeData(anime);
                    }
                    window.currentAnime = anime;
                    
                    // Hide loading, show content
                    if (loading) loading.style.display = 'none';
                    if (content) content.style.display = 'block';
                    
                    // Load recommendations
                    loadRelatedAnime(id);
                    return;
                }
            }
        } catch (error) {
            console.error('Failed to fetch from MAL API directly:', error);
        }
    }
    
    // Final fallback to local data
    if (!anime && typeof getAnimeById === 'function') {
        if (loading) loading.innerHTML = '<p>Using local data...</p>';
        anime = getAnimeById(id);
    }
    
    if (!anime || !anime.title) {
        showError('Anime not found. The API may be temporarily unavailable. Please try searching for it again or check back later.');
        if (loading) {
            loading.style.display = 'block';
            loading.innerHTML = '<p style="color: var(--error-color);">Anime not found. Please try searching for it again.</p>';
        }
        if (content) content.style.display = 'none';
        return;
    }
    
    // Update page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = `${anime.title} - AnimeTracker`;
    }
    
    // Hide loading, show content
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';
    
    // Fill in anime details
    fillAnimeDetails(anime);
    
    // Cache anime data for watchlist
    if (typeof cacheAnimeData === 'function') {
        cacheAnimeData(anime);
    }
    
    // Store in global variable for easy access
    window.currentAnime = anime;
    
    // Load related anime
    loadRelatedAnime(id);
}

// Fill anime details
function fillAnimeDetails(anime) {
    if (!anime) return;
    
    // Update page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle && anime.title) {
        pageTitle.textContent = `${anime.title} - AnimeTracker`;
    }
    
    // Title
    const titleEl = document.getElementById('anime-title');
    if (titleEl) {
        titleEl.textContent = anime.title || anime.title_english || anime.title_japanese || 'Unknown Title';
    }
    
    // Poster
    const posterEl = document.getElementById('anime-poster-img');
    if (posterEl) {
        posterEl.src = anime.image || '';
        posterEl.alt = anime.title || 'Anime Poster';
        posterEl.onerror = function() {
            this.src = 'https://via.placeholder.com/300x400?text=No+Image';
        };
    }
    
    // Meta information - Year
    const yearEl = document.getElementById('anime-year');
    if (yearEl) {
        const year = anime.year || (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : null);
        yearEl.textContent = year ? year.toString() : 'Year: N/A';
    }
    
    // Status
    const statusEl = document.getElementById('anime-status');
    if (statusEl) {
        statusEl.textContent = anime.status || 'Status: Unknown';
    }
    
    // Episodes - Show total episodes from MAL
    const episodesEl = document.getElementById('anime-episodes');
    if (episodesEl) {
        const episodes = anime.episodes || 0;
        if (episodes > 0) {
            episodesEl.textContent = `${episodes} Episode${episodes !== 1 ? 's' : ''}`;
        } else {
            episodesEl.textContent = 'Episodes: TBA';
        }
    }
    
    // Rating (content rating, not score)
    const ratingEl = document.getElementById('anime-rating');
    if (ratingEl) {
        ratingEl.textContent = anime.rating || anime.rating_mal || 'Not Rated';
    }
    
    // Genres
    const genresEl = document.getElementById('anime-genres');
    if (genresEl) {
        if (anime.genres && anime.genres.length > 0) {
            genresEl.innerHTML = anime.genres.map(genre => {
                const genreName = typeof genre === 'string' ? genre : (genre.name || 'Unknown');
                return `<span class="genre-tag">${genreName}</span>`;
            }).join('');
        } else {
            genresEl.innerHTML = '<span class="genre-tag">No genres listed</span>';
        }
    }
    
    // Synopsis/Description - This is the key field the user wants
    const synopsisEl = document.getElementById('anime-synopsis');
    if (synopsisEl) {
        // Clean up synopsis text (remove source references)
        let synopsis = anime.synopsis || anime.background || '';
        
        // Remove source references like [Written by MAL Rewrite]
        synopsis = synopsis.replace(/\[Written by.*?\]/g, '').trim();
        
        // If synopsis is too long, truncate it but keep it readable
        if (synopsis.length > 500) {
            synopsis = synopsis.substring(0, 500);
            const lastPeriod = synopsis.lastIndexOf('.');
            if (lastPeriod > 400) {
                synopsis = synopsis.substring(0, lastPeriod + 1);
            } else {
                synopsis += '...';
            }
        }
        
        if (synopsis) {
            synopsisEl.textContent = synopsis;
        } else {
            synopsisEl.textContent = 'No synopsis available for this anime.';
        }
    }
    
    // Stats - Score (rating)
    const scoreEl = document.getElementById('anime-score');
    if (scoreEl) {
        if (anime.score && anime.score > 0) {
            scoreEl.textContent = `${anime.score.toFixed(2)} / 10`;
        } else {
            scoreEl.textContent = 'N/A';
        }
    }
    
    // Ranked
    const rankedEl = document.getElementById('anime-ranked');
    if (rankedEl) {
        if (anime.ranked && anime.ranked > 0) {
            rankedEl.textContent = `#${anime.ranked}`;
        } else if (anime.rank && anime.rank > 0) {
            rankedEl.textContent = `#${anime.rank}`;
        } else {
            rankedEl.textContent = 'N/A';
        }
    }
    
    // Popularity
    const popularityEl = document.getElementById('anime-popularity');
    if (popularityEl) {
        if (anime.popularity && anime.popularity > 0) {
            popularityEl.textContent = `#${anime.popularity}`;
        } else {
            popularityEl.textContent = 'N/A';
        }
    }
    
    // Studio
    const studioEl = document.getElementById('anime-studio');
    if (studioEl) {
        if (anime.studio) {
            studioEl.textContent = anime.studio;
        } else if (anime.studios && anime.studios.length > 0) {
            const studios = anime.studios.map(s => typeof s === 'string' ? s : s.name).join(', ');
            studioEl.textContent = studios;
        } else {
            studioEl.textContent = 'Unknown';
        }
    }
    
    // Set trailer video ID - try multiple sources
    const trailerSection = document.getElementById('trailer-section');
    if (trailerSection) {
        let trailerId = anime.trailer || '';
        
        // Try extracting from trailer_url if available
        if (!trailerId && anime.trailer_url) {
            if (typeof extractYouTubeId === 'function') {
                trailerId = extractYouTubeId(anime.trailer_url);
            } else if (typeof extractYouTubeVideoId === 'function') {
                trailerId = extractYouTubeVideoId(anime.trailer_url);
            }
        }
        
        // If still no trailer, try to fetch from YouTube (async, non-blocking)
        if (!trailerId && anime.title) {
            // Store anime info for async trailer fetch
            trailerSection.setAttribute('data-anime-title', anime.title);
            if (anime.year) trailerSection.setAttribute('data-anime-year', anime.year);
            if (anime.mal_id) trailerSection.setAttribute('data-anime-mal-id', anime.mal_id);
            
            // Try to fetch trailer asynchronously
            if (typeof enhanceTrailerWithYouTube === 'function') {
                enhanceTrailerWithYouTube(anime.title, null, anime.year, anime.mal_id)
                    .then(fetchedTrailerId => {
                        if (fetchedTrailerId && trailerSection) {
                            trailerSection.setAttribute('data-trailer-id', fetchedTrailerId);
                            // Update button if trailer was found
                            const watchTrailerBtn = document.getElementById('watch-trailer-btn');
                            if (watchTrailerBtn && !watchTrailerBtn.disabled) {
                                watchTrailerBtn.textContent = 'Watch Trailer';
                            }
                        }
                    })
                    .catch(err => console.error('Error fetching YouTube trailer:', err));
            }
        }
        
        trailerSection.setAttribute('data-trailer-id', trailerId || '');
    }
    
    // Load characters, episodes, reviews
    loadCharacters(anime.characters || []);
    // episodes is a number (total), episodeList is an array of episode objects
    loadEpisodes(anime.episodeList || []);
    loadReviews(anime.reviews || []);
}

// Toggle trailer visibility
async function toggleTrailer() {
    const trailerSection = document.getElementById('trailer-section');
    const trailerIframe = document.getElementById('trailer-iframe');
    let trailerId = trailerSection ? trailerSection.getAttribute('data-trailer-id') : '';
    
    // If no trailer ID, try to fetch one
    if (!trailerId && trailerSection) {
        const animeTitle = trailerSection.getAttribute('data-anime-title');
        const animeYear = trailerSection.getAttribute('data-anime-year');
        const malId = trailerSection.getAttribute('data-anime-mal-id');
        
        if (animeTitle && typeof enhanceTrailerWithYouTube === 'function') {
            const watchTrailerBtn = document.getElementById('watch-trailer-btn');
            if (watchTrailerBtn) {
                watchTrailerBtn.textContent = 'Searching trailer...';
                watchTrailerBtn.disabled = true;
            }
            
            try {
                trailerId = await enhanceTrailerWithYouTube(animeTitle, null, animeYear, malId);
                if (trailerId && trailerSection) {
                    trailerSection.setAttribute('data-trailer-id', trailerId);
                }
            } catch (error) {
                console.error('Error fetching trailer:', error);
            } finally {
                if (watchTrailerBtn) {
                    watchTrailerBtn.textContent = 'Watch Trailer';
                    watchTrailerBtn.disabled = false;
                }
            }
        }
    }
    
    if (!trailerSection || !trailerIframe || !trailerId) {
        // Try to create a YouTube search link as fallback
        const animeTitle = trailerSection ? trailerSection.getAttribute('data-anime-title') : '';
        const animeYear = trailerSection ? trailerSection.getAttribute('data-anime-year') : null;
        
        if (animeTitle) {
            let searchUrl;
            if (typeof getYouTubeTrailerSearchUrl === 'function') {
                searchUrl = getYouTubeTrailerSearchUrl(animeTitle, animeYear);
            } else {
                let query = `${animeTitle} official trailer`;
                if (animeYear) query += ` ${animeYear}`;
                query += ' anime';
                searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            }
            
            // Show a better UI for YouTube search
            const searchYouTube = confirm(`Trailer not found in our database.\n\nWould you like to search YouTube for "${animeTitle}" trailer?`);
            if (searchYouTube) {
                window.open(searchUrl, '_blank');
            }
        } else {
            showNotification('Trailer not available. Try searching YouTube manually.', 'info');
        }
        return;
    }
    
    if (trailerSection.style.display === 'none' || trailerSection.style.display === '') {
        // Show trailer
        if (typeof createYouTubeEmbedUrl === 'function') {
            trailerIframe.src = createYouTubeEmbedUrl(trailerId, true);
        } else {
        trailerIframe.src = `https://www.youtube.com/embed/${trailerId}?autoplay=1`;
        }
        trailerSection.style.display = 'block';
        
        // Scroll to trailer
        trailerSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        // Hide trailer
        trailerIframe.src = '';
        trailerSection.style.display = 'none';
    }
}

// Load characters
function loadCharacters(characters) {
    const charactersGrid = document.getElementById('characters-grid');
    if (!charactersGrid) return;
    
    if (characters.length === 0) {
        charactersGrid.innerHTML = '<p style="color: var(--gray-text);">No character information available.</p>';
        return;
    }
    
    charactersGrid.innerHTML = characters.map(char => `
        <div class="character-card">
            <img src="${char.image}" alt="${char.name}" class="character-image" onerror="this.src='https://via.placeholder.com/150x200?text=No+Image'">
            <div class="character-name">${char.name}</div>
            <div style="color: var(--gray-text); font-size: 0.85rem; padding: 0 1rem 1rem;">${char.role}</div>
        </div>
    `).join('');
}

// Load episodes
function loadEpisodes(episodes) {
    const episodesList = document.getElementById('episodes-list');
    if (!episodesList) return;
    
    if (!episodes || episodes.length === 0) {
        episodesList.innerHTML = '<p style="color: var(--gray-text);">Episode list not available. Check back later for episode details.</p>';
        return;
    }
    
    episodesList.innerHTML = episodes.map((ep, index) => {
        const epNumber = ep.number || ep.mal_id || ep.episode_id || (index + 1);
        const epTitle = ep.title || `Episode ${epNumber}`;
        const epAired = ep.aired || 'TBA';
        return `
        <div class="episode-item">
            <div>
                    <strong>Episode ${epNumber}: ${epTitle}</strong>
                <div style="color: var(--gray-text); font-size: 0.9rem; margin-top: 0.25rem;">
                        Aired: ${epAired}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Load reviews
function loadReviews(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p style="color: var(--gray-text);">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div>
                    <strong class="reviewer-name">${review.user}</strong>
                    <div style="color: var(--gray-text); font-size: 0.9rem; margin-top: 0.25rem;">
                        ${review.date}
                    </div>
                </div>
                <div class="review-rating">
                    ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                </div>
            </div>
            <p style="color: var(--gray-text); line-height: 1.8; margin-top: 1rem;">
                ${review.comment}
            </p>
        </div>
    `).join('');
}

// Switch tab
function switchTab(tabName) {
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.info-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to clicked tab
    const activeTab = document.querySelector(`.info-tab[data-tab="${tabName}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    // Hide all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    // Show selected tab content
    const activeContent = document.getElementById(`${tabName}-content`);
    if (activeContent) activeContent.classList.add('active');
}

// Show rating modal (uses rating-modal.js)
// Function is defined in rating-modal.js

// Load related anime
function loadRelatedAnime(animeId) {
    const relatedContainer = document.getElementById('related-anime');
    if (!relatedContainer) return;
    
    const related = getSimilarAnime(animeId, 6);
    if (related.length === 0) {
        relatedContainer.innerHTML = '<p style="color: var(--gray-text); text-align: center; grid-column: 1 / -1;">No similar anime found.</p>';
        return;
    }
    
    relatedContainer.innerHTML = related.map(anime => createAnimeCard(anime)).join('');
}

// Show error
function showError(message) {
    const loading = document.getElementById('detail-loading');
    if (loading) {
        loading.innerHTML = `<p style="color: var(--error-color);">${message}</p>`;
    }
}

// Update button states based on current status
async function updateButtonStates(animeId) {
    let currentStatus = null;
    
    // Check Supabase first if available
    if (typeof supabase !== 'undefined' && supabase && typeof isAnimeInWatchlist === 'function') {
        try {
            if (supabase && supabase.auth) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    currentStatus = await isAnimeInWatchlist(animeId);
                }
            }
        } catch (error) {
            console.error('Error checking Supabase watchlist:', error);
        }
    }
    
    // Fallback to localStorage if not found in Supabase
    if (!currentStatus) {
        const storedData = JSON.parse(localStorage.getItem('animeTracking')) || {};
        const statuses = ['watchlist', 'watch-later', 'watching', 'completed', 'dropped', 'plan-to-watch'];
        for (const status of statuses) {
            if (storedData[status] && storedData[status].includes(animeId)) {
                currentStatus = status;
                break;
            }
        }
    }
    
    // Update button text and states
    const addWatchlistBtn = document.getElementById('add-watchlist-btn');
    const addWatchLaterBtn = document.getElementById('add-watch-later-btn');
    const statusBtn = document.getElementById('status-btn');
    
    if (addWatchlistBtn) {
        if (currentStatus === 'watchlist') {
            addWatchlistBtn.textContent = 'In Watchlist ✓';
            addWatchlistBtn.disabled = true;
            addWatchlistBtn.style.opacity = '0.6';
        } else {
            addWatchlistBtn.textContent = 'Add to Watchlist';
            addWatchlistBtn.disabled = false;
            addWatchlistBtn.style.opacity = '1';
        }
    }
    
    if (addWatchLaterBtn) {
        if (currentStatus === 'watch-later') {
            addWatchLaterBtn.textContent = 'In Watch Later ✓';
            addWatchLaterBtn.disabled = true;
            addWatchLaterBtn.style.opacity = '0.6';
        } else {
            addWatchLaterBtn.textContent = 'Watch Later';
            addWatchLaterBtn.disabled = false;
            addWatchLaterBtn.style.opacity = '1';
        }
    }
    
    if (statusBtn && currentStatus) {
        statusBtn.textContent = `Status: ${currentStatus.replace('-', ' ')}`;
    }
}

// Show status modal
async function showStatusModal(animeId) {
    // Get current status (check Supabase first, then localStorage)
    let currentStatus = 'none';
    
    if (typeof supabase !== 'undefined' && supabase && typeof isAnimeInWatchlist === 'function') {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                currentStatus = await isAnimeInWatchlist(animeId) || 'none';
            }
        } catch (error) {
            console.error('Error checking Supabase status:', error);
        }
    }
    
    // Fallback to localStorage
    if (currentStatus === 'none') {
        currentStatus = isAnimeInList(animeId) || 'none';
    }
    
    const statuses = [
        { value: 'watchlist', label: 'Watchlist' },
        { value: 'watch-later', label: 'Watch Later' },
        { value: 'watching', label: 'Watching' },
        { value: 'completed', label: 'Completed' },
        { value: 'plan-to-watch', label: 'Plan to Watch' },
        { value: 'dropped', label: 'Dropped' },
        { value: 'none', label: 'Remove from Lists' }
    ];
    
    const status = prompt(`Change status:\n\n${statuses.map(s => `${s.value === currentStatus ? '→ ' : '  '}${s.label}`).join('\n')}\n\nEnter status (watchlist, watch-later, watching, completed, plan-to-watch, dropped, or none):`, currentStatus);
    
    if (status && status !== currentStatus) {
        if (status === 'none') {
            // Remove from all lists
            if (typeof supabase !== 'undefined' && supabase && supabase.auth && typeof removeFromWatchlistByAnimeId === 'function') {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        await removeFromWatchlistByAnimeId(animeId);
                        showNotification('Removed from all lists!', 'info');
                        await updateButtonStates(animeId);
                        return;
                    }
                } catch (error) {
                    console.error('Error removing from Supabase:', error);
                }
            }
            
            // Fallback to localStorage
            const storedData = JSON.parse(localStorage.getItem('animeTracking')) || {};
            const allStatuses = ['watchlist', 'watch-later', 'watching', 'completed', 'dropped', 'plan-to-watch'];
            allStatuses.forEach(s => {
                if (storedData[s]) {
                    storedData[s] = storedData[s].filter(id => id !== animeId);
                }
            });
            localStorage.setItem('animeTracking', JSON.stringify(storedData));
            showNotification('Removed from all lists!', 'info');
        } else if (statuses.some(s => s.value === status)) {
            // Change status
            if (typeof changeAnimeStatus === 'function') {
                await changeAnimeStatus(animeId, currentStatus !== 'none' ? currentStatus : 'watchlist', status);
            } else if (typeof addAnimeToStatus === 'function') {
                await addAnimeToStatus(animeId, status);
                showNotification(`Status changed to ${status.replace('-', ' ')}!`, 'success');
            } else {
                // Fallback
                addAnimeToStatus(animeId, status);
                showNotification(`Status changed to ${status.replace('-', ' ')}!`, 'success');
            }
        } else {
            showNotification('Invalid status!', 'error');
            return;
        }
        
        await updateButtonStates(animeId);
    }
}

// Helper function to check if anime is in list (fallback if watchlist.js not loaded)
function isAnimeInList(animeId) {
    if (typeof window.isAnimeInList === 'function') {
        return window.isAnimeInList(animeId);
    }
    
    const storedData = JSON.parse(localStorage.getItem('animeTracking')) || {};
    const statuses = ['watchlist', 'watch-later', 'watching', 'completed', 'dropped', 'plan-to-watch'];
    
    for (const status of statuses) {
        if (storedData[status] && storedData[status].includes(animeId)) {
            return status;
        }
    }
    
    return null;
}

// Helper function to add anime to status (fallback if watchlist.js not loaded)
function addAnimeToStatus(animeId, status) {
    const storedData = JSON.parse(localStorage.getItem('animeTracking')) || {};
    
    // Remove from other statuses
    const allStatuses = ['watchlist', 'watch-later', 'watching', 'completed', 'dropped', 'plan-to-watch'];
    allStatuses.forEach(s => {
        if (s !== status && storedData[s]) {
            storedData[s] = storedData[s].filter(id => id !== animeId);
        }
    });
    
    // Add to specified status
    if (!storedData[status]) {
        storedData[status] = [];
    }
    if (!storedData[status].includes(animeId)) {
        storedData[status].push(animeId);
    }
    
    // Initialize tracking info
    if (!storedData.tracking) {
        storedData.tracking = {};
    }
    if (!storedData.tracking[animeId]) {
        storedData.tracking[animeId] = {
            progress: 0,
            rating: null,
            notes: '',
            addedDate: new Date().toISOString()
        };
    }
    
    localStorage.setItem('animeTracking', JSON.stringify(storedData));
}

