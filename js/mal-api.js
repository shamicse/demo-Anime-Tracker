// MyAnimeList API Integration using Jikan API
// Jikan API Documentation: https://docs.api.jikan.moe/

const JIKAN_API_BASE = 'https://api.jikan.moe/v4';

// Rate limiting: Jikan API has rate limits (3 requests per second)
let lastRequestTime = 0;
const REQUEST_DELAY = 350; // milliseconds between requests

// Helper function to handle rate limiting
async function rateLimitedFetch(url) {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < REQUEST_DELAY) {
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest));
    }
    
    lastRequestTime = Date.now();
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Search anime by query
async function searchAnimeFromMAL(query, limit = 10) {
    try {
        const url = `${JIKAN_API_BASE}/anime?q=${encodeURIComponent(query)}&limit=${limit}`;
        const data = await rateLimitedFetch(url);
        return data.data || [];
    } catch (error) {
        console.error('Error searching anime:', error);
        return [];
    }
}

// Get anime by ID
async function getAnimeFromMAL(id) {
    try {
        const url = `${JIKAN_API_BASE}/anime/${id}`;
        const data = await rateLimitedFetch(url);
        return data.data || null;
    } catch (error) {
        console.error('Error fetching anime:', error);
        return null;
    }
}

// Get top anime
async function getTopAnimeFromMAL(type = 'bypopularity', limit = 25) {
    try {
        const url = `${JIKAN_API_BASE}/top/anime?filter=${type}&limit=${limit}`;
        const data = await rateLimitedFetch(url);
        return data.data || [];
    } catch (error) {
        console.error('Error fetching top anime:', error);
        return [];
    }
}

// Get multiple pages of anime from MAL (for large lists)
async function getMultiplePagesAnimeFromMAL(totalLimit = 1000, type = 'bypopularity') {
    try {
        const perPage = 25; // Jikan API max per page
        const pagesNeeded = Math.ceil(totalLimit / perPage);
        const allAnime = [];
        
        // Fetch multiple pages
        for (let page = 1; page <= pagesNeeded && allAnime.length < totalLimit; page++) {
            try {
                const url = `${JIKAN_API_BASE}/top/anime?filter=${type}&limit=${perPage}&page=${page}`;
                const data = await rateLimitedFetch(url);
                
                if (data && data.data && data.data.length > 0) {
                    allAnime.push(...data.data);
                    
                    // Check pagination
                    if (data.pagination && !data.pagination.has_next_page) {
                        break;
                    }
                    
                    // Rate limiting delay
                    if (page < pagesNeeded) {
                        await new Promise(resolve => setTimeout(resolve, 400));
                    }
                } else {
                    break; // No more data
                }
            } catch (error) {
                console.error(`Error fetching MAL page ${page}:`, error);
                break; // Stop on error
            }
        }
        
        return allAnime.slice(0, totalLimit); // Return exactly the requested amount
    } catch (error) {
        console.error('Error fetching multiple pages from MAL:', error);
        return [];
    }
}

// Get top anime by time period (yearly, monthly, weekly)
async function getTopAnimeByPeriodFromMAL(period = 'yearly', limit = 10) {
    try {
        const now = new Date();
        let year = now.getFullYear();
        let season = '';
        
        if (period === 'yearly') {
            // Get top anime by popularity for the year
            return await getTopAnimeFromMAL('bypopularity', limit);
        } else if (period === 'monthly') {
            // Get current season anime (closest approximation)
            const month = now.getMonth();
            if (month >= 0 && month < 3) season = 'winter';
            else if (month >= 3 && month < 6) season = 'spring';
            else if (month >= 6 && month < 9) season = 'summer';
            else season = 'fall';
            
            const seasonal = await getSeasonalAnimeFromMAL(year, season, limit);
            return seasonal.slice(0, limit);
        } else if (period === 'weekly') {
            // For weekly, use trending/popular (MAL doesn't have weekly filter)
            return await getTopAnimeFromMAL('bypopularity', limit);
        }
        
        return [];
    } catch (error) {
        console.error(`Error fetching ${period} top anime from MAL:`, error);
        return [];
    }
}

// Get anime by genre (at least 10 per genre)
async function getAnimeByGenreFromMAL(genre, limit = 10) {
    try {
        // Map common genre names to MAL format
        const genreMap = {
            'action': 'Action',
            'adventure': 'Adventure',
            'comedy': 'Comedy',
            'drama': 'Drama',
            'fantasy': 'Fantasy',
            'romance': 'Romance',
            'sci-fi': 'Sci-Fi',
            'horror': 'Horror',
            'sci fi': 'Sci-Fi'
        };
        
        const malGenre = genreMap[genre.toLowerCase()] || genre;
        
        // Search by genre - MAL API doesn't have direct genre filter, so we search
        // We'll use top anime and filter by genre, or use a search approach
        const topAnime = await getTopAnimeFromMAL('bypopularity', 50);
        
        if (topAnime && topAnime.length > 0) {
            const filtered = topAnime.filter(anime => {
                const genres = anime.genres?.map(g => g.name?.toLowerCase()) || [];
                return genres.includes(malGenre.toLowerCase());
            });
            
            return filtered.slice(0, Math.max(limit, 10));
        }
        
        return [];
    } catch (error) {
        console.error(`Error fetching ${genre} anime from MAL:`, error);
        return [];
    }
}

// Get seasonal anime
async function getSeasonalAnimeFromMAL(year, season, limit = 25) {
    try {
        // season: winter, spring, summer, fall
        const url = `${JIKAN_API_BASE}/seasons/${year}/${season}?limit=${limit}`;
        const data = await rateLimitedFetch(url);
        return data.data || [];
    } catch (error) {
        console.error('Error fetching seasonal anime:', error);
        return [];
    }
}

// Convert MAL API response to our anime format
function convertMALToAnimeFormat(malAnime) {
    if (!malAnime) return null;
    
    // Clean synopsis - remove source references and trim
    let synopsis = malAnime.synopsis || malAnime.background || '';
    if (synopsis) {
        // Remove [Written by MAL Rewrite] and similar tags
        synopsis = synopsis.replace(/\[Written by.*?\]/g, '').trim();
        // Remove extra whitespace
        synopsis = synopsis.replace(/\s+/g, ' ').trim();
    }
    
    return {
        id: malAnime.mal_id,
        title: malAnime.title || malAnime.title_english || malAnime.title_japanese || 'Unknown Title',
        year: malAnime.year || (malAnime.aired?.from ? new Date(malAnime.aired.from).getFullYear() : null),
        status: malAnime.status || 'Unknown',
        episodes: malAnime.episodes || 0,
        rating: malAnime.rating || 'Not Rated',
        genres: (malAnime.genres || []).map(g => g.name || g),
        score: malAnime.score || 0,
        ranked: malAnime.rank || 0,
        popularity: malAnime.popularity || 0,
        studio: malAnime.studios?.[0]?.name || 'Unknown',
        synopsis: synopsis || 'No synopsis available for this anime.',
        image: malAnime.images?.jpg?.large_image_url || malAnime.images?.jpg?.image_url || '',
        trailer: extractYouTubeId(malAnime.trailer?.url || ''),
        url: malAnime.url,
        // Additional MAL-specific data
        mal_id: malAnime.mal_id,
        title_english: malAnime.title_english,
        title_japanese: malAnime.title_japanese,
        source: malAnime.source,
        duration: malAnime.duration,
        rating_mal: malAnime.rating,
        aired: malAnime.aired
    };
}

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
    if (!url) return '';
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
}

// Get anime characters
async function getAnimeCharactersFromMAL(animeId) {
    try {
        const url = `${JIKAN_API_BASE}/anime/${animeId}/characters`;
        const data = await rateLimitedFetch(url);
        
        if (!data.data) return [];
        
        return data.data.slice(0, 10).map(char => ({
            name: char.character?.name || 'Unknown',
            role: char.role || 'Unknown',
            image: char.character?.images?.jpg?.image_url || ''
        }));
    } catch (error) {
        console.error('Error fetching characters:', error);
        return [];
    }
}

// Get anime episodes (if available)
async function getAnimeEpisodesFromMAL(animeId, page = 1) {
    try {
        const url = `${JIKAN_API_BASE}/anime/${animeId}/episodes?page=${page}`;
        const data = await rateLimitedFetch(url);
        
        if (!data.data || !Array.isArray(data.data)) return [];
        
        return data.data.map((ep, index) => {
            // Jikan API v4: episodes have mal_id (episode ID) and title
            // The episode number is usually the index + 1 or can be calculated from pagination
            const episodeNumber = ep.mal_id ? (index + 1 + (page - 1) * 100) : (index + 1);
            return {
                number: episodeNumber,
                title: ep.title || ep.title_romanji || ep.title_japanese || `Episode ${episodeNumber}`,
                aired: ep.aired || 'TBA',
                episode_id: ep.mal_id || null,
                mal_id: ep.mal_id
            };
        });
    } catch (error) {
        console.error('Error fetching episodes:', error);
        return [];
    }
}

// Get anime recommendations (similar anime)
async function getAnimeRecommendationsFromMAL(animeId) {
    try {
        const url = `${JIKAN_API_BASE}/anime/${animeId}/recommendations`;
        const data = await rateLimitedFetch(url);
        
        if (!data.data) return [];
        
        return data.data.slice(0, 6).map(rec => {
            const anime = rec.entry;
            return convertMALToAnimeFormat(anime);
        }).filter(anime => anime !== null);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
    }
}

// Example: Load popular anime from MAL
async function loadPopularAnimeFromMAL(containerId, count = 12) {
    try {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '<p style="color: var(--gray-text);">Loading from MyAnimeList...</p>';
        
        const topAnime = await getTopAnimeFromMAL('bypopularity', count);
        const formattedAnime = topAnime.map(anime => convertMALToAnimeFormat(anime));
        
        if (formattedAnime.length === 0) {
            container.innerHTML = '<p style="color: var(--error-color);">Failed to load anime. Using local data instead.</p>';
            // Fallback to local data
            if (typeof loadFeaturedContent === 'function') {
                loadFeaturedContent();
            }
            return;
        }
        
        // Update global animeData with MAL data (optional)
        // This would replace or merge with existing data
        
        container.innerHTML = formattedAnime.map(anime => createAnimeCard(anime)).join('');
    } catch (error) {
        console.error('Error loading popular anime:', error);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<p style="color: var(--error-color);">Error loading anime. Please try again later or use local data.</p>';
        }
    }
}

// Example: Search anime and update list
async function searchAndDisplayAnimeFromMAL(query, containerId) {
    try {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!query || query.trim() === '') {
            return;
        }
        
        container.innerHTML = '<p style="color: var(--gray-text);">Searching MyAnimeList...</p>';
        
        const results = await searchAnimeFromMAL(query, 100); // Get more results for pagination
        const formattedAnime = results.map(anime => convertMALToAnimeFormat(anime)).filter(a => a !== null);
        
        if (formattedAnime.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-text);">No anime found. Try a different search term.</p>';
            // Update current list for pagination
            if (typeof window.currentAnimeList !== 'undefined') {
                window.currentAnimeList = [];
            }
            return;
        }
        
        // Update current list for pagination (if on anime-list page)
        if (containerId === 'anime-list-grid') {
            // Update the currentAnimeList variable if it exists
            if (typeof window.currentAnimeList !== 'undefined') {
                window.currentAnimeList = formattedAnime;
            }
            // Use displayAnimeList if available (for pagination)
            if (typeof window.displayAnimeList === 'function') {
                window.displayAnimeList(formattedAnime);
                return;
            }
            // Also try to update the local currentAnimeList if we're in anime-list.js scope
            try {
                if (typeof currentAnimeList !== 'undefined') {
                    currentAnimeList = formattedAnime;
                }
                if (typeof displayAnimeList === 'function') {
                    displayAnimeList(formattedAnime);
                    return;
                }
            } catch (e) {
                // Not in anime-list.js scope, continue with direct display
            }
        }
        
        container.innerHTML = formattedAnime.map(anime => createAnimeCard(anime)).join('');
    } catch (error) {
        console.error('Error searching anime:', error);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<p style="color: var(--error-color);">Search failed. Please try again later.</p>';
        }
    }
}

// Example: Load anime detail from MAL
async function loadAnimeDetailFromMAL(animeId) {
    try {
        const anime = await getAnimeFromMAL(animeId);
        if (!anime) {
            throw new Error('Anime not found in MAL');
        }
        
        const formattedAnime = convertMALToAnimeFormat(anime);
        if (!formattedAnime || !formattedAnime.title) {
            throw new Error('Failed to format anime data');
        }
        
        // Load additional data (characters and episodes) - don't wait for recommendations
        try {
            const [characters, episodes] = await Promise.all([
                getAnimeCharactersFromMAL(animeId).catch(err => {
                    console.error('Error loading characters:', err);
                    return [];
                }),
                getAnimeEpisodesFromMAL(animeId, 1).catch(err => {
                    console.error('Error loading episodes:', err);
                    return [];
                })
            ]);
            
            formattedAnime.characters = characters || [];
            formattedAnime.episodeList = episodes || [];
        } catch (error) {
            console.error('Error loading additional data:', error);
            // Continue even if additional data fails
            formattedAnime.characters = [];
            formattedAnime.episodeList = [];
        }
        
        return formattedAnime;
    } catch (error) {
        console.error('Error loading anime detail from MAL:', error);
        return null;
    }
}

