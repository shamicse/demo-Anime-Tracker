// Recommendations Page Functionality

document.addEventListener('DOMContentLoaded', async function() {
    // Load default recommendations - Using MAL API
    await loadDefaultRecommendations();
    
    // Load top anime by period
    await loadTopAnimeByPeriod();
    
    // Load genre-based recommendations
    await loadGenreRecommendations();
    
    // Get recommendations button
    const getRecommendationsBtn = document.getElementById('get-recommendations');
    if (getRecommendationsBtn) {
        getRecommendationsBtn.addEventListener('click', async function() {
            await getPersonalizedRecommendations();
        });
    }
});

// Load default recommendations (popular anime) - Using MAL API
async function loadDefaultRecommendations() {
    const defaultContainer = document.getElementById('popular-recommendations-grid');
    if (!defaultContainer) return;
    
    try {
        // Try MAL API first
        if (typeof getTopAnimeFromMAL === 'function') {
            const topAnime = await getTopAnimeFromMAL('bypopularity', 12);
            if (topAnime && topAnime.length > 0) {
                const formatted = topAnime.map(anime => {
                    if (typeof convertMALToAnimeFormat === 'function') {
                        return convertMALToAnimeFormat(anime);
                    }
                    return anime;
                });
                defaultContainer.innerHTML = formatted.map(anime => createAnimeCard(anime)).join('');
                return;
            }
        }
    } catch (error) {
        console.error('MAL API failed, using local data:', error);
    }
    
    // Fallback to local data
    const popular = getPopularAnime(12);
    defaultContainer.innerHTML = popular.map(anime => createAnimeCard(anime)).join('');
}

// Get personalized recommendations - Using MAL API
async function getPersonalizedRecommendations() {
    // Get user preferences
    const preferences = {
        genres: [],
        rating: '',
        year: ''
    };
    
    // Get selected genres
    const genreCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    genreCheckboxes.forEach(checkbox => {
        preferences.genres.push(checkbox.value);
    });
    
    // Get rating preference
    const ratingPref = document.getElementById('rating-pref');
    if (ratingPref) {
        preferences.rating = ratingPref.value;
    }
    
    // Get year preference
    const yearPref = document.getElementById('year-pref');
    if (yearPref) {
        preferences.year = yearPref.value;
    }
    
    let recommendations = [];
    
    // Try MAL API first
    try {
        if (typeof getTopAnimeFromMAL === 'function') {
            // Get top anime and filter by preferences
            const topAnime = await getTopAnimeFromMAL('bypopularity', 25);
            
            if (topAnime && topAnime.length > 0) {
                let filtered = topAnime;
                
                // Filter by genres if selected
                if (preferences.genres.length > 0) {
                    const genreMap = {
                        'action': 'Action',
                        'adventure': 'Adventure',
                        'comedy': 'Comedy',
                        'drama': 'Drama',
                        'fantasy': 'Fantasy',
                        'romance': 'Romance',
                        'sci-fi': 'Sci-Fi',
                        'horror': 'Horror'
                    };
                    
                    filtered = filtered.filter(anime => {
                        const animeGenres = anime.genres?.map(g => g.name?.toLowerCase()) || [];
                        return preferences.genres.some(pref => {
                            const genreName = genreMap[pref]?.toLowerCase();
                            return animeGenres.includes(genreName);
                        });
                    });
                }
                
                // Filter by rating
                if (preferences.rating === 'high') {
                    filtered = filtered.filter(anime => anime.score >= 8.0);
                } else if (preferences.rating === 'medium') {
                    filtered = filtered.filter(anime => anime.score >= 6.0 && anime.score < 8.0);
                }
                
                // Filter by year
                if (preferences.year === 'recent') {
                    const currentYear = new Date().getFullYear();
                    filtered = filtered.filter(anime => anime.year >= 2020);
                } else if (preferences.year === 'classic') {
                    filtered = filtered.filter(anime => anime.year < 2010);
                }
                
                // Convert to our format
                recommendations = filtered.slice(0, 12).map(anime => {
                    if (typeof convertMALToAnimeFormat === 'function') {
                        return convertMALToAnimeFormat(anime);
                    }
                    return anime;
                });
            }
        }
    } catch (error) {
        console.error('MAL API failed, using local data:', error);
    }
    
    // Fallback to local recommendations if MAL API failed or no results
    if (recommendations.length === 0) {
        recommendations = getRecommendations(preferences);
        
        // If no preferences selected, show popular anime
        if (preferences.genres.length === 0 && preferences.rating === 'any' && preferences.year === 'any') {
            recommendations = getPopularAnime(12);
        }
    }
    
    // Display recommendations
    displayRecommendations(recommendations);
    
    // Show results section
    const defaultSection = document.getElementById('default-recommendations');
    const resultsSection = document.getElementById('recommendations-results');
    
    if (defaultSection) defaultSection.style.display = 'none';
    if (resultsSection) resultsSection.style.display = 'block';
    
    // Show message if no results
    if (recommendations.length === 0) {
        showNoRecommendations();
    }
}

// Display recommendations
function displayRecommendations(animeList) {
    const grid = document.getElementById('recommended-anime-grid');
    if (!grid) return;
    
    if (animeList.length === 0) {
        showNoRecommendations();
        return;
    }
    
    grid.innerHTML = animeList.map(anime => createAnimeCard(anime)).join('');
}

// Show no recommendations message
function showNoRecommendations() {
    const grid = document.getElementById('recommended-anime-grid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--gray-text);">
                <p style="font-size: 1.2rem; margin-bottom: 1rem;">No recommendations found</p>
                <p>Try adjusting your preferences to get better recommendations.</p>
            </div>
        `;
    }
}

// Load top anime by period (weekly, monthly, yearly)
async function loadTopAnimeByPeriod() {
    // Load weekly top 10
    await loadTopAnimeForPeriod('weekly', 'weekly-top-grid', 10);
    
    // Load monthly top 10
    await loadTopAnimeForPeriod('monthly', 'monthly-top-grid', 10);
    
    // Load yearly top 10
    await loadTopAnimeForPeriod('yearly', 'yearly-top-grid', 10);
}

// Load top anime for a specific period
async function loadTopAnimeForPeriod(period, containerId, limit = 10) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let anime = [];
    
    try {
        // Try AniList API first
        if (typeof getTopAnimeByPeriodFromAniList === 'function') {
            try {
                const anilistAnime = await Promise.race([
                    getTopAnimeByPeriodFromAniList(period, limit),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                ]);
                
                if (anilistAnime && anilistAnime.length > 0 && typeof convertAniListToAnimeFormat === 'function') {
                    anime = anilistAnime.map(a => convertAniListToAnimeFormat(a)).filter(a => a !== null);
                }
            } catch (error) {
                console.error(`AniList ${period} top anime failed, trying MAL:`, error);
            }
        }
        
        // Try MAL API if AniList failed
        if (anime.length === 0 && typeof getTopAnimeByPeriodFromMAL === 'function') {
            try {
                const malAnime = await Promise.race([
                    getTopAnimeByPeriodFromMAL(period, limit),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                ]);
                
                if (malAnime && malAnime.length > 0 && typeof convertMALToAnimeFormat === 'function') {
                    anime = malAnime.map(a => convertMALToAnimeFormat(a)).filter(a => a !== null);
                }
            } catch (error) {
                console.error(`MAL ${period} top anime failed:`, error);
            }
        }
        
        // Display anime
        if (anime.length > 0) {
            container.innerHTML = anime.map(a => createAnimeCard(a)).join('');
        } else {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--gray-text);">
                    <p>Loading ${period} top anime...</p>
                </div>
            `;
        }
    } catch (error) {
        console.error(`Error loading ${period} top anime:`, error);
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--gray-text);">
                <p>Unable to load ${period} top anime at this time.</p>
            </div>
        `;
    }
}

// Load genre-based recommendations (at least 10 per genre)
async function loadGenreRecommendations() {
    const genres = [
        { name: 'action', containerId: 'genre-action-grid' },
        { name: 'adventure', containerId: 'genre-adventure-grid' },
        { name: 'comedy', containerId: 'genre-comedy-grid' },
        { name: 'drama', containerId: 'genre-drama-grid' },
        { name: 'fantasy', containerId: 'genre-fantasy-grid' },
        { name: 'romance', containerId: 'genre-romance-grid' },
        { name: 'sci-fi', containerId: 'genre-sci-fi-grid' },
        { name: 'horror', containerId: 'genre-horror-grid' }
    ];
    
    // Load each genre (with delay to respect rate limits)
    for (let i = 0; i < genres.length; i++) {
        await loadGenreAnime(genres[i].name, genres[i].containerId, 10);
        // Small delay between requests
        if (i < genres.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
}

// Load anime for a specific genre
async function loadGenreAnime(genre, containerId, limit = 10) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let anime = [];
    
    try {
        // Try AniList API first
        if (typeof getAnimeByGenreFromAniList === 'function') {
            try {
                const anilistAnime = await Promise.race([
                    getAnimeByGenreFromAniList(genre, limit),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                ]);
                
                if (anilistAnime && anilistAnime.length > 0 && typeof convertAniListToAnimeFormat === 'function') {
                    anime = anilistAnime.map(a => convertAniListToAnimeFormat(a)).filter(a => a !== null);
                }
            } catch (error) {
                console.error(`AniList ${genre} anime failed, trying MAL:`, error);
            }
        }
        
        // Try MAL API if AniList failed
        if (anime.length === 0 && typeof getAnimeByGenreFromMAL === 'function') {
            try {
                const malAnime = await Promise.race([
                    getAnimeByGenreFromMAL(genre, limit),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                ]);
                
                if (malAnime && malAnime.length > 0 && typeof convertMALToAnimeFormat === 'function') {
                    anime = malAnime.map(a => convertMALToAnimeFormat(a)).filter(a => a !== null);
                }
            } catch (error) {
                console.error(`MAL ${genre} anime failed:`, error);
            }
        }
        
        // Display anime
        if (anime.length > 0) {
            container.innerHTML = anime.map(a => createAnimeCard(a)).join('');
        } else {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--gray-text);">
                    <p>Loading ${genre} anime...</p>
                </div>
            `;
        }
    } catch (error) {
        console.error(`Error loading ${genre} anime:`, error);
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--gray-text);">
                <p>Unable to load ${genre} anime at this time.</p>
            </div>
        `;
    }
}

