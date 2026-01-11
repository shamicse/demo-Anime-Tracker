// Anime Cache - Store anime metadata for watchlist
// This allows us to display anime in watchlist even if they're from APIs

// Cache anime data in localStorage
function cacheAnimeData(anime) {
    if (!anime || !anime.id) return;
    
    try {
        const cache = JSON.parse(localStorage.getItem('animeCache')) || {};
        cache[anime.id] = {
            id: anime.id,
            mal_id: anime.mal_id || anime.id,
            title: anime.title,
            title_english: anime.title_english || anime.title,
            year: anime.year,
            status: anime.status,
            episodes: anime.episodes || 0,
            score: anime.score || 0,
            rating: anime.rating || 'N/A',
            genres: anime.genres || [],
            studio: anime.studio || 'Unknown',
            synopsis: anime.synopsis || '',
            image: anime.image || '',
            bannerImage: anime.bannerImage || ''
        };
        localStorage.setItem('animeCache', JSON.stringify(cache));
    } catch (error) {
        console.error('Error caching anime data:', error);
    }
}

// Get anime from cache
function getCachedAnime(animeId) {
    try {
        const cache = JSON.parse(localStorage.getItem('animeCache')) || {};
        return cache[animeId] || null;
    } catch (error) {
        console.error('Error getting cached anime:', error);
        return null;
    }
}

// Get anime by ID (checks cache first, then local data)
function getAnimeByIdCached(animeId) {
    // First check cache
    const cached = getCachedAnime(animeId);
    if (cached) return cached;
    
    // Then check local data
    if (typeof getAnimeById === 'function') {
        const local = getAnimeById(animeId);
        if (local) return local;
    }
    
    return null;
}

// Store current anime in cache when viewing detail page
function cacheCurrentAnime() {
    // This will be called from anime-detail.js after loading anime
    // We'll extract anime data from the page
    const titleElement = document.getElementById('anime-title');
    const imageElement = document.querySelector('.anime-poster img');
    const animeId = parseInt(new URLSearchParams(window.location.search).get('id'));
    
    if (!animeId) return;
    
    // Try to get from global variable if available
    if (typeof window.currentAnime === 'object' && window.currentAnime) {
        cacheAnimeData(window.currentAnime);
    }
}
