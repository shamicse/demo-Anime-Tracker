// Watchlist Management System

// Status types
const STATUS = {
    WATCHLIST: 'watchlist',
    WATCH_LATER: 'watch-later',
    WATCHING: 'watching',
    COMPLETED: 'completed',
    DROPPED: 'dropped',
    PLAN_TO_WATCH: 'plan-to-watch'
};

// Initialize watchlist on page load
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('watchlist-grid')) {
        loadWatchlistPage();
    }
    
    // Tab switching
    const tabs = document.querySelectorAll('.watchlist-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchWatchlistTab(tabName);
        });
    });
});

// Load watchlist page
async function loadWatchlistPage() {
    await loadWatchlist('watchlist');
    await loadWatchlist('watch-later');
    await loadWatchlist('watching');
    await loadWatchlist('completed');
    await loadWatchlist('dropped');
    await loadWatchlist('plan-to-watch');
}

// Load specific watchlist type
async function loadWatchlist(type) {
    const container = document.getElementById(`${type}-grid`);
    const countElement = document.getElementById(`${type}-count`);
    
    if (!container) return;
    
    // Check if user is logged in with Supabase
    let isSupabaseAvailable = false;
    let session = null;
    
    if (typeof supabase !== 'undefined' && supabase) {
        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            session = currentSession;
            isSupabaseAvailable = !!session;
        } catch (error) {
            console.error('Error checking Supabase session:', error);
        }
    }
    
    // Use Supabase if available and user is logged in
    if (isSupabaseAvailable && typeof getWatchlistByStatus === 'function') {
        try {
            const watchlistItems = await getWatchlistByStatus(type);
            
            if (countElement) {
                countElement.textContent = watchlistItems.length;
            }
            
            if (watchlistItems.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--gray-text);">
                        <p>${getEmptyStateMessage(type)}</p>
                    </div>
                `;
                return;
            }
            
            // Fetch anime details for each watchlist item
            const animePromises = watchlistItems.map(async (item) => {
                // Try to get from cache first
                let anime = null;
                if (typeof getAnimeByIdCached === 'function') {
                    anime = getAnimeByIdCached(item.anime_id);
                } else if (typeof getAnimeById === 'function') {
                    anime = getAnimeById(item.anime_id);
                }
                
                // If not in cache, try to fetch from API (but use minimal data for now)
                if (!anime) {
                    // Create minimal anime object from what we have
                    // We'll store basic info to avoid too many API calls
                    anime = {
                        id: item.anime_id,
                        title: `Anime ID: ${item.anime_id}`,
                        image: 'https://via.placeholder.com/300x400?text=No+Image',
                        score: 0,
                        year: null,
                        episodes: 0
                    };
                }
                
                if (anime) {
                    return {
                        ...anime,
                        progress: item.progress || 0,
                        rating: item.rating || null,
                        notes: item.notes || '',
                        watchlistId: item.id
                    };
                }
                return null;
            });
            
            const animeList = (await Promise.all(animePromises)).filter(a => a !== null);
            container.innerHTML = animeList.map(anime => createWatchlistCard(anime, type)).join('');
            
            // Add event listeners for remove buttons (Supabase)
            container.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', async function(e) {
                    e.stopPropagation();
                    const watchlistId = this.getAttribute('data-watchlist-id');
                    if (watchlistId && typeof removeFromWatchlistSupabase === 'function') {
                        try {
                            await removeFromWatchlistSupabase(watchlistId);
                            await loadWatchlist(type);
                            if (typeof showNotification === 'function') {
                                showNotification('Removed from list!', 'info');
                            }
                        } catch (error) {
                            console.error('Error removing from watchlist:', error);
                            if (typeof showNotification === 'function') {
                                showNotification('Error removing item', 'error');
                            }
                        }
                    } else {
                        // Fallback to old method
                        const animeId = parseInt(this.getAttribute('data-anime-id'));
                        removeFromList(animeId, type);
                    }
                });
            });
            
            // Add event listeners for status change (Supabase)
            container.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', async function(e) {
                    e.stopPropagation();
                    const watchlistId = this.getAttribute('data-watchlist-id');
                    const newStatus = this.value;
                    
                    if (watchlistId && typeof updateWatchlistItem === 'function') {
                        try {
                            await updateWatchlistItem(watchlistId, { status: newStatus });
                            await loadWatchlist(type);
                            if (typeof showNotification === 'function') {
                                showNotification(`Status changed to ${newStatus.replace('-', ' ')}!`, 'success');
                            }
                        } catch (error) {
                            console.error('Error updating status:', error);
                            if (typeof showNotification === 'function') {
                                showNotification('Error updating status', 'error');
                            }
                        }
                    } else {
                        // Fallback to old method
                        const animeId = parseInt(this.getAttribute('data-anime-id'));
                        changeAnimeStatus(animeId, type, newStatus);
                    }
                });
            });
            
            return;
        } catch (error) {
            console.error('Error loading watchlist from Supabase:', error);
            // Fallback to localStorage below
        }
    }
    
    // Fallback to localStorage for non-logged-in users or if Supabase fails
    const animeList = getAnimeListByStatus(type);
    
    if (countElement) {
        countElement.textContent = animeList.length;
    }
    
    if (animeList.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--gray-text);">
                <p>${getEmptyStateMessage(type)}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = animeList.map(anime => createWatchlistCard(anime, type)).join('');
    
    // Add event listeners for remove buttons (localStorage)
    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const animeId = parseInt(this.getAttribute('data-anime-id'));
            removeFromList(animeId, type);
        });
    });
    
    // Add event listeners for status change (localStorage)
    container.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', function(e) {
            e.stopPropagation();
            const animeId = parseInt(this.getAttribute('data-anime-id'));
            const newStatus = this.value;
            changeAnimeStatus(animeId, type, newStatus);
        });
    });
}

// Get anime list by status
function getAnimeListByStatus(status) {
    const storedData = JSON.parse(localStorage.getItem('animeTracking')) || {};
    const animeIds = storedData[status] || [];
    
    return animeIds.map(id => {
        let anime = null;
        // Try to get from cache first, then local data
        if (typeof getAnimeByIdCached === 'function') {
            anime = getAnimeByIdCached(id);
        } else if (typeof getAnimeById === 'function') {
            anime = getAnimeById(id);
        }
        
        if (anime) {
            // Get additional tracking info
            const trackingInfo = storedData.tracking || {};
            const info = trackingInfo[id] || {};
            return {
                ...anime,
                progress: info.progress || 0,
                rating: info.rating || null,
                notes: info.notes || ''
            };
        }
        return null;
    }).filter(anime => anime !== null);
}

// Create watchlist card with management options
function createWatchlistCard(anime, currentStatus) {
    return `
        <div class="watchlist-card">
            <div class="watchlist-card-image" onclick="window.location.href='anime-detail.html?id=${anime.id}'">
                <img src="${anime.image}" alt="${anime.title}" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
                <div class="watchlist-overlay">
                    <button class="btn btn-primary" onclick="window.location.href='anime-detail.html?id=${anime.id}'">View Details</button>
                </div>
            </div>
            <div class="watchlist-card-content">
                <h3 class="watchlist-card-title" onclick="window.location.href='anime-detail.html?id=${anime.id}'">${anime.title}</h3>
                <div class="watchlist-card-meta">
                    <span>${anime.year}</span>
                    <span class="watchlist-rating">★ ${anime.score || 'N/A'}</span>
                </div>
                ${anime.progress > 0 ? `<div class="progress-bar">
                    <div class="progress-fill" style="width: ${(anime.progress / anime.episodes) * 100}%"></div>
                    <span class="progress-text">${anime.progress}/${anime.episodes} episodes</span>
                </div>` : ''}
                <div class="watchlist-actions">
                    <select class="status-select" data-anime-id="${anime.id}" ${anime.watchlistId ? `data-watchlist-id="${anime.watchlistId}"` : ''} aria-label="Change status">
                        <option value="watchlist" ${currentStatus === 'watchlist' ? 'selected' : ''}>Watchlist</option>
                        <option value="watch-later" ${currentStatus === 'watch-later' ? 'selected' : ''}>Watch Later</option>
                        <option value="watching" ${currentStatus === 'watching' ? 'selected' : ''}>Watching</option>
                        <option value="completed" ${currentStatus === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="dropped" ${currentStatus === 'dropped' ? 'selected' : ''}>Dropped</option>
                        <option value="plan-to-watch" ${currentStatus === 'plan-to-watch' ? 'selected' : ''}>Plan to Watch</option>
                    </select>
                    <button class="btn btn-secondary remove-btn" data-anime-id="${anime.id}" ${anime.watchlistId ? `data-watchlist-id="${anime.watchlistId}"` : ''} aria-label="Remove from list">Remove</button>
                </div>
            </div>
        </div>
    `;
}

// Add to watchlist (existing function - keep for compatibility)
function addToWatchlist(animeId) {
    addAnimeToStatus(animeId, STATUS.WATCHLIST);
    showNotification('Added to watchlist!', 'success');
}

// Add to watch later
function addToWatchLater(animeId) {
    addAnimeToStatus(animeId, STATUS.WATCH_LATER);
    showNotification('Added to Watch Later!', 'success');
}

// Add anime to specific status
async function addAnimeToStatus(animeId, status) {
    // Check if Supabase is available and user is logged in
    if (typeof supabase !== 'undefined' && supabase && supabase.auth && typeof addToWatchlistSupabase === 'function') {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Use Supabase
                await addToWatchlistSupabase(animeId, status);
                // Show notification based on status
                const statusMessages = {
                    'watchlist': 'Added to watchlist!',
                    'watch-later': 'Added to Watch Later!',
                    'watching': 'Marked as Watching!',
                    'completed': 'Marked as Completed!',
                    'dropped': 'Marked as Dropped!',
                    'plan-to-watch': 'Added to Plan to Watch!'
                };
                const message = statusMessages[status] || 'Added to list!';
                if (typeof showNotification === 'function') {
                    showNotification(message, 'success');
                } else {
                    alert(message);
                }
                return;
            }
        } catch (error) {
            console.error('Error adding to Supabase watchlist:', error);
            if (typeof showNotification === 'function') {
                showNotification('Error adding to watchlist. Using local storage.', 'error');
            }
            // Fallback to localStorage below
        }
    }
    
    // Fallback to localStorage
    const storedData = JSON.parse(localStorage.getItem('animeTracking')) || {};
    
    // Initialize status arrays if they don't exist
    if (!storedData[status]) {
        storedData[status] = [];
    }
    
    // Remove from other statuses first (anime can only be in one status)
    Object.keys(STATUS).forEach(key => {
        const statusKey = STATUS[key];
        if (statusKey !== status && storedData[statusKey]) {
            storedData[statusKey] = storedData[statusKey].filter(id => id !== animeId);
        }
    });
    
    // Add to specified status if not already there
    if (!storedData[status].includes(animeId)) {
        storedData[status].push(animeId);
    }
    
    // Initialize tracking info if needed
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
    
    // Show notification for localStorage
    const statusMessages = {
        'watchlist': 'Added to watchlist!',
        'watch-later': 'Added to Watch Later!',
        'watching': 'Marked as Watching!',
        'completed': 'Marked as Completed!',
        'dropped': 'Marked as Dropped!',
        'plan-to-watch': 'Added to Plan to Watch!'
    };
    const message = statusMessages[status] || 'Added to list!';
    if (typeof showNotification === 'function') {
        showNotification(message, 'success');
    }
}

// Remove from list
async function removeFromList(animeId, status) {
    // Check if using Supabase
    if (typeof supabase !== 'undefined' && supabase && typeof removeFromWatchlistByAnimeId === 'function') {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await removeFromWatchlistByAnimeId(animeId);
                await loadWatchlist(status);
                if (typeof showNotification === 'function') {
                    showNotification('Removed from list!', 'info');
                }
                return;
            }
        } catch (error) {
            console.error('Error removing from Supabase:', error);
        }
    }
    
    // Fallback to localStorage
    const storedData = JSON.parse(localStorage.getItem('animeTracking')) || {};
    
    if (storedData[status]) {
        storedData[status] = storedData[status].filter(id => id !== animeId);
        localStorage.setItem('animeTracking', JSON.stringify(storedData));
        
        // Reload the current tab
        await loadWatchlist(status);
        if (typeof showNotification === 'function') {
            showNotification('Removed from list!', 'info');
        }
    }
}

// Change anime status
async function changeAnimeStatus(animeId, oldStatus, newStatus) {
    // Check if using Supabase
    if (typeof supabase !== 'undefined' && supabase && supabase.auth && typeof addToWatchlistSupabase === 'function') {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Update status in Supabase (this will update if exists, or create if new)
                await addToWatchlistSupabase(animeId, newStatus);
                await loadWatchlist(oldStatus);
                await loadWatchlist(newStatus);
                if (typeof showNotification === 'function') {
                    showNotification(`Status changed to ${newStatus.replace('-', ' ')}!`, 'success');
                }
                return;
            }
        } catch (error) {
            console.error('Error changing status in Supabase:', error);
        }
    }
    
    // Fallback to localStorage
    const storedData = JSON.parse(localStorage.getItem('animeTracking')) || {};
    
    if (storedData[oldStatus]) {
        storedData[oldStatus] = storedData[oldStatus].filter(id => id !== animeId);
    }
    
    if (!storedData[newStatus]) {
        storedData[newStatus] = [];
    }
    if (!storedData[newStatus].includes(animeId)) {
        storedData[newStatus].push(animeId);
    }
    
    localStorage.setItem('animeTracking', JSON.stringify(storedData));
    
    // Reload both tabs
    await loadWatchlist(oldStatus);
    await loadWatchlist(newStatus);
    
    if (typeof showNotification === 'function') {
        showNotification(`Status changed to ${newStatus.replace('-', ' ')}!`, 'success');
    }
}

// Switch watchlist tab
function switchWatchlistTab(tabName) {
    // Update tab buttons
    const tabs = document.querySelectorAll('.watchlist-tab');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update tab panes
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => {
        if (pane.id === `${tabName}-pane`) {
            pane.style.display = 'block';
            pane.classList.add('active');
        } else {
            pane.style.display = 'none';
            pane.classList.remove('active');
        }
    });
}

// Get empty state message
function getEmptyStateMessage(type) {
    const messages = {
        'watchlist': 'Your watchlist is empty. Add anime from the anime detail pages!',
        'watch-later': 'No anime saved for later. Click "Watch Later" on any anime to add it here!',
        'watching': 'No anime marked as watching. Update status from anime detail pages!',
        'completed': 'No completed anime yet. Mark anime as completed when you finish watching!',
        'dropped': 'No dropped anime. Mark anime as dropped if you stop watching!',
        'plan-to-watch': 'No anime planned to watch. Add anime to plan your future viewing!'
    };
    return messages[type] || 'No anime found.';
}

// Check if anime is in any list
function isAnimeInList(animeId) {
    const storedData = JSON.parse(localStorage.getItem('animeTracking')) || {};
    
    for (const status in STATUS) {
        const statusKey = STATUS[status];
        if (storedData[statusKey] && storedData[statusKey].includes(animeId)) {
            return statusKey;
        }
    }
    
    return null;
}

// Update progress (for future use)
function updateProgress(animeId, progress) {
    const storedData = JSON.parse(localStorage.getItem('animeTracking')) || {};
    
    if (!storedData.tracking) {
        storedData.tracking = {};
    }
    if (!storedData.tracking[animeId]) {
        storedData.tracking[animeId] = {};
    }
    
    storedData.tracking[animeId].progress = progress;
    storedData.tracking[animeId].lastUpdated = new Date().toISOString();
    
    localStorage.setItem('animeTracking', JSON.stringify(storedData));
}

