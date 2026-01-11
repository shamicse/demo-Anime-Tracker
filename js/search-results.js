// Search Results Page Functionality

document.addEventListener('DOMContentLoaded', async function() {
    // Get search query from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || urlParams.get('query') || '';
    
    // Update search input with query
    const searchInput = document.getElementById('search-input');
    const globalSearchInput = document.getElementById('global-search-input');
    
    if (searchInput && query) {
        searchInput.value = query;
    }
    if (globalSearchInput && query) {
        globalSearchInput.value = query;
    }
    
    // Update page header
    const searchHeader = document.getElementById('search-header');
    const searchSubtitle = document.getElementById('search-subtitle');
    
    if (query) {
        if (searchHeader) {
            searchHeader.textContent = `Search Results for "${query}"`;
        }
        if (searchSubtitle) {
            searchSubtitle.textContent = `Found results from MyAnimeList for: ${query}`;
        }
        
        // Perform search
        await performSearch(query);
    } else {
        // No query provided
        if (searchHeader) {
            searchHeader.textContent = 'Search Results';
        }
        if (searchSubtitle) {
            searchSubtitle.textContent = 'Enter a search term above to find anime';
        }
        
        const loading = document.getElementById('loading');
        const noResults = document.getElementById('no-results');
        const resultsGrid = document.getElementById('search-results-grid');
        
        if (loading) loading.style.display = 'none';
        if (noResults) {
            noResults.innerHTML = '<p>Please enter a search term to find anime.</p>';
            noResults.style.display = 'block';
        }
        if (resultsGrid) resultsGrid.innerHTML = '';
        
        const resultsInfo = document.getElementById('results-info');
        if (resultsInfo) resultsInfo.textContent = '';
    }
    
    // Search button functionality
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            if (searchInput) {
                const searchQuery = searchInput.value.trim();
                if (searchQuery.length >= 2) {
                    // Navigate to search results page with query
                    window.location.href = `search-results.html?q=${encodeURIComponent(searchQuery)}`;
                } else {
                    showNotification('Please enter at least 2 characters to search.', 'info');
                }
            }
        });
    }
    
    // Search on Enter key
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchQuery = this.value.trim();
                if (searchQuery.length >= 2) {
                    // Navigate to search results page with query
                    window.location.href = `search-results.html?q=${encodeURIComponent(searchQuery)}`;
                } else {
                    showNotification('Please enter at least 2 characters to search.', 'info');
                }
            }
        });
    }
});

// Perform search and display results
async function performSearch(query) {
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('no-results');
    const resultsGrid = document.getElementById('search-results-grid');
    const resultsInfo = document.getElementById('results-info');
    
    if (!query || query.trim().length < 2) {
        if (loading) loading.style.display = 'none';
        if (noResults) {
            noResults.innerHTML = '<p>Please enter at least 2 characters to search.</p>';
            noResults.style.display = 'block';
        }
        if (resultsGrid) resultsGrid.innerHTML = '';
        if (resultsInfo) resultsInfo.textContent = '';
        return;
    }
    
    // Show loading state
    if (loading) loading.style.display = 'block';
    if (noResults) noResults.style.display = 'none';
    if (resultsGrid) resultsGrid.innerHTML = '';
    if (resultsInfo) resultsInfo.textContent = '';
    
    try {
        let searchResults = [];
        
        // Try AniList API first (more reliable)
        if (typeof searchAnimeFromAniList === 'function') {
            try {
                if (loading) loading.innerHTML = '<p>Searching AniList...</p>';
                const anilistResults = await Promise.race([
                    searchAnimeFromAniList(query, 50),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
                ]);
                
                // Convert AniList format to anime format
                if (anilistResults && anilistResults.length > 0 && typeof convertAniListToAnimeFormat === 'function') {
                    searchResults = anilistResults.map(anime => {
                        const converted = convertAniListToAnimeFormat(anime);
                        return converted;
                    }).filter(anime => anime !== null);
                }
            } catch (error) {
                console.error('AniList search failed, trying MAL:', error);
            }
        }
        
        // Fallback to MAL API if AniList failed or returned no results
        if (searchResults.length === 0 && typeof searchAnimeFromMAL === 'function') {
            try {
                if (loading) loading.innerHTML = '<p>Searching MyAnimeList...</p>';
                const malResults = await Promise.race([
                    searchAnimeFromMAL(query, 50),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
                ]);
                
                // Convert MAL format to anime format if needed
                if (malResults.length > 0 && typeof convertMALToAnimeFormat === 'function') {
                    searchResults = malResults.map(anime => {
                        const converted = convertMALToAnimeFormat(anime);
                        return converted;
                    }).filter(anime => anime !== null);
                }
            } catch (error) {
                console.error('MAL search failed:', error);
            }
        }
        
        // Final fallback to local search only if all APIs failed
        if (searchResults.length === 0) {
            if (typeof searchAnime === 'function') {
                searchResults = searchAnime(query);
            } else {
                // Try loading all anime and filtering
                const allAnime = typeof getAllAnime === 'function' ? getAllAnime() : [];
                const lowerQuery = query.toLowerCase();
                searchResults = allAnime.filter(anime =>
                    anime.title.toLowerCase().includes(lowerQuery) ||
                    (anime.studio && anime.studio.toLowerCase().includes(lowerQuery)) ||
                    (anime.genres && anime.genres.some(g => typeof g === 'string' ? g.toLowerCase().includes(lowerQuery) : g.toLowerCase().includes(lowerQuery)))
                );
            }
        }
        
        // Hide loading
        if (loading) loading.style.display = 'none';
        
        // Display results
        if (searchResults.length === 0) {
            if (noResults) {
                noResults.innerHTML = `<p>No anime found for "<strong>${query}</strong>". Try a different search term.</p>`;
                noResults.style.display = 'block';
            }
            if (resultsGrid) resultsGrid.innerHTML = '';
            if (resultsInfo) {
                resultsInfo.innerHTML = `<p>No results found for "${query}"</p>`;
            }
        } else {
            if (noResults) noResults.style.display = 'none';
            
            // Update results info
            if (resultsInfo) {
                resultsInfo.innerHTML = `<p>Found <strong>${searchResults.length}</strong> result${searchResults.length !== 1 ? 's' : ''} for "<strong>${query}</strong>"</p>`;
            }
            
            // Display results using anime cards
            if (resultsGrid && typeof createAnimeCard === 'function') {
                resultsGrid.innerHTML = searchResults.map(anime => createAnimeCard(anime)).join('');
            } else if (resultsGrid) {
                // Fallback card creation
                resultsGrid.innerHTML = searchResults.map(anime => `
                    <div class="anime-card" onclick="window.location.href='anime-detail.html?id=${anime.id}'">
                        <img src="${anime.image || ''}" alt="${anime.title}" class="anime-card-image" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
                        <div class="anime-card-content">
                            <h3 class="anime-card-title">${anime.title || 'Unknown Title'}</h3>
                            <div class="anime-card-meta">
                                <span>${anime.year || 'N/A'}</span>
                                <span class="anime-card-rating">${anime.score ? `★ ${anime.score}` : 'N/A'}</span>
                            </div>
                            ${anime.synopsis ? `<p style="font-size: 0.85rem; color: var(--gray-text); margin-top: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${anime.synopsis.substring(0, 100)}...</p>` : ''}
                        </div>
                    </div>
                `).join('');
            }
            
            // Update page title
            document.title = `"${query}" - Search Results - AnimeTracker`;
        }
    } catch (error) {
        console.error('Search error:', error);
        if (loading) loading.style.display = 'none';
        if (noResults) {
            noResults.innerHTML = '<p style="color: var(--error-color);">Error searching. Please try again later.</p>';
            noResults.style.display = 'block';
        }
        if (resultsGrid) resultsGrid.innerHTML = '';
        if (resultsInfo) {
            resultsInfo.innerHTML = '<p style="color: var(--error-color);">Error occurred while searching.</p>';
        }
    }
}
