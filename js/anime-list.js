// Anime List Page Functionality

let currentAnimeList = [];
let currentFilter = 'all';
let currentSort = 'title';
let currentSearch = '';
let currentPage = 1;
let itemsPerPage = 10; // Number of anime per page (changed from 24 to 10)

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize anime list - Use MAL API
    await loadAnimeList();
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            currentSearch = this.value.trim();
            
            // Debounce search
            clearTimeout(searchTimeout);
            if (currentSearch.length === 0) {
                loadAnimeList(); // Reload all anime
                return;
            }
            
            searchTimeout = setTimeout(async () => {
                if (currentSearch.length >= 2) {
                    // Reset to first page
                    currentPage = 1;
                    // Try AniList API search first
                    if (typeof searchAnimeFromAniList === 'function') {
                        try {
                            const anilistResults = await Promise.race([
                                searchAnimeFromAniList(currentSearch, 100),
                                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                            ]);
                            
                            if (anilistResults && anilistResults.length > 0 && typeof convertAniListToAnimeFormat === 'function') {
                                const formatted = anilistResults.map(anime => convertAniListToAnimeFormat(anime)).filter(a => a !== null);
                                currentAnimeList = formatted;
                                displayAnimeList(formatted);
                                return;
                            }
                        } catch (error) {
                            console.error('AniList search failed:', error);
                        }
                    }
                    // Try MAL API search
                    if (typeof searchAndDisplayAnimeFromMAL === 'function') {
                        await searchAndDisplayAnimeFromMAL(currentSearch, 'anime-list-grid');
                    } else {
                        filterAndDisplayAnime(); // Fallback to local
                    }
                } else {
                    // Reload all anime if search is cleared
                    await loadAnimeList();
                }
            }, 500);
        });
        
        searchInput.addEventListener('keypress', async function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                currentPage = 1; // Reset to first page
                if (currentSearch.trim().length >= 2) {
                    // Try AniList API search first
                    if (typeof searchAnimeFromAniList === 'function') {
                        try {
                            const anilistResults = await Promise.race([
                                searchAnimeFromAniList(currentSearch, 100),
                                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                            ]);
                            
                            if (anilistResults && anilistResults.length > 0 && typeof convertAniListToAnimeFormat === 'function') {
                                const formatted = anilistResults.map(anime => convertAniListToAnimeFormat(anime)).filter(a => a !== null);
                                currentAnimeList = formatted;
                                displayAnimeList(formatted);
                                return;
                            }
                        } catch (error) {
                            console.error('AniList search failed:', error);
                        }
                    }
                    if (typeof searchAndDisplayAnimeFromMAL === 'function') {
                        await searchAndDisplayAnimeFromMAL(currentSearch, 'anime-list-grid');
                    } else {
                        filterAndDisplayAnime();
                    }
                } else {
                    await loadAnimeList();
                }
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', async function() {
            if (searchInput) {
                currentPage = 1; // Reset to first page
                currentSearch = searchInput.value.trim();
                if (currentSearch.length >= 2) {
                    // Try AniList API search first
                    if (typeof searchAnimeFromAniList === 'function') {
                        try {
                            const anilistResults = await Promise.race([
                                searchAnimeFromAniList(currentSearch, 100),
                                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                            ]);
                            
                            if (anilistResults && anilistResults.length > 0 && typeof convertAniListToAnimeFormat === 'function') {
                                const formatted = anilistResults.map(anime => convertAniListToAnimeFormat(anime)).filter(a => a !== null);
                                currentAnimeList = formatted;
                                displayAnimeList(formatted);
                                return;
                            }
                        } catch (error) {
                            console.error('AniList search failed:', error);
                        }
                    }
                    if (typeof searchAndDisplayAnimeFromMAL === 'function') {
                        await searchAndDisplayAnimeFromMAL(currentSearch, 'anime-list-grid');
                    } else {
                        filterAndDisplayAnime();
                    }
                } else {
                    await loadAnimeList(); // Reload all if empty
                }
            }
        });
    }
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            currentFilter = this.getAttribute('data-filter');
            filterAndDisplayAnime();
        });
    });
    
    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            filterAndDisplayAnime();
        });
    }
});

// Load anime list - Using MAL API
async function loadAnimeList() {
    const grid = document.getElementById('anime-list-grid');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('no-results');
    
    // Reset to first page
    currentPage = 1;
    
    if (loading) loading.style.display = 'block';
    if (noResults) noResults.style.display = 'none';
    if (grid) grid.innerHTML = '';
    
    try {
        // Optimized: Load initial batch (100 anime) for faster display, then load more in background
        if (loading) {
            loading.innerHTML = '<div class="loading-spinner"></div><p>Loading anime... This may take a moment.</p>';
        }
        
        // Try to load from AniList API first (more reliable) - Start with 100 for faster load
        if (typeof getPopularAnimeFromAniList === 'function') {
            try {
                // Load initial 100 anime for quick display
                const anilistAnime = await Promise.race([
                    getPopularAnimeFromAniList(100),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
                ]);
                
                if (anilistAnime && anilistAnime.length > 0 && typeof convertAniListToAnimeFormat === 'function') {
                    const formattedAnime = anilistAnime.map(anime => convertAniListToAnimeFormat(anime)).filter(a => a !== null);
                    currentAnimeList = formattedAnime;
                    displayAnimeList(currentAnimeList);
                    if (loading) loading.style.display = 'none';
                    
                    // Load more in background (up to 1000) for pagination
                    loadMoreAnimeInBackground(1000);
                    return;
                }
            } catch (error) {
                console.error('AniList API failed, trying MAL:', error);
            }
        }
        
        // Try to load from MAL API - Start with 100 for faster load
        if (typeof getTopAnimeFromMAL === 'function') {
            try {
                const topAnime = await Promise.race([
                    getTopAnimeFromMAL('bypopularity', 100),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
                ]);
                
                if (topAnime && topAnime.length > 0) {
                    const formattedAnime = topAnime.map(anime => convertMALToAnimeFormat(anime)).filter(a => a !== null);
                    currentAnimeList = formattedAnime;
                    displayAnimeList(currentAnimeList);
                    if (loading) loading.style.display = 'none';
                    
                    // Load more in background (up to 1000) for pagination
                    loadMoreAnimeInBackground(1000);
                    return;
                } else {
                    throw new Error('No anime from MAL API');
                }
            } catch (error) {
                console.error('MAL API failed:', error);
            }
        }
        
        // Fallback to local data
        currentAnimeList = getAllAnime();
        displayAnimeList(currentAnimeList);
    } catch (error) {
        console.error('Error loading anime from APIs, using local data:', error);
        // Fallback to local data
        currentAnimeList = getAllAnime();
        displayAnimeList(currentAnimeList);
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

// Filter and display anime
function filterAndDisplayAnime() {
    // Reset to first page when filtering
    currentPage = 1;
    
    let filtered = [...currentAnimeList];
    
    // Apply search filter
    if (currentSearch.trim() !== '') {
        if (typeof searchAnime === 'function') {
            filtered = searchAnime(currentSearch);
        }
    }
    
    // Apply genre filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(anime =>
            anime.genres && anime.genres.some(g => {
                const genreName = typeof g === 'string' ? g : g.name || '';
                return genreName.toLowerCase().replace(/\s+/g, '-') === currentFilter;
            })
        );
    }
    
    // Apply sorting
    if (typeof sortAnime === 'function') {
        filtered = sortAnime(filtered, currentSort);
    }
    
    // Update current list
    currentAnimeList = filtered;
    
    // Display results
    if (filtered.length === 0) {
        showNoResults();
    } else {
        displayAnimeList(filtered);
    }
}

// Display anime list with pagination
function displayAnimeList(animeList) {
    const grid = document.getElementById('anime-list-grid');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('no-results');
    const pagination = document.getElementById('pagination');
    
    if (loading) loading.style.display = 'none';
    if (noResults) noResults.style.display = 'none';
    
    if (grid) {
        if (animeList.length === 0) {
            showNoResults();
            if (pagination) pagination.style.display = 'none';
            return;
        }
        
        // Calculate pagination
        const totalPages = Math.ceil(animeList.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedAnime = animeList.slice(startIndex, endIndex);
        
        // Display paginated anime
        grid.innerHTML = paginatedAnime.map(anime => createAnimeCard(anime)).join('');
        
        // Display pagination controls
        if (pagination && totalPages > 1) {
            displayPagination(totalPages, animeList.length);
            pagination.style.display = 'flex';
        } else if (pagination) {
            pagination.style.display = 'none';
        }
    }
}

// Load more anime in background for pagination
async function loadMoreAnimeInBackground(targetCount = 1000) {
    // Only load if we have less than target count
    if (currentAnimeList.length >= targetCount) return;
    
    try {
        // Try AniList API first
        if (typeof getMultiplePagesAnimeFromAniList === 'function') {
            try {
                const anilistAnime = await Promise.race([
                    getMultiplePagesAnimeFromAniList(targetCount, 'POPULARITY_DESC'),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 60000))
                ]);
                
                if (anilistAnime && anilistAnime.length > 0 && typeof convertAniListToAnimeFormat === 'function') {
                    const formattedAnime = anilistAnime.map(anime => convertAniListToAnimeFormat(anime)).filter(a => a !== null);
                    currentAnimeList = formattedAnime;
                    // Update display if on first page
                    if (currentPage === 1) {
                        displayAnimeList(currentAnimeList);
                    }
                    return;
                }
            } catch (error) {
                console.error('Background AniList load failed, trying MAL:', error);
            }
        }
        
        // Try MAL API
        if (typeof getMultiplePagesAnimeFromMAL === 'function') {
            try {
                const topAnime = await Promise.race([
                    getMultiplePagesAnimeFromMAL(targetCount, 'bypopularity'),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 60000))
                ]);
                
                if (topAnime && topAnime.length > 0) {
                    const formattedAnime = topAnime.map(anime => convertMALToAnimeFormat(anime)).filter(a => a !== null);
                    currentAnimeList = formattedAnime;
                    // Update display if on first page
                    if (currentPage === 1) {
                        displayAnimeList(currentAnimeList);
                    }
                }
            } catch (error) {
                console.error('Background MAL load failed:', error);
            }
        }
    } catch (error) {
        console.error('Background load error:', error);
    }
}

// Make displayAnimeList globally accessible for MAL API
window.displayAnimeList = displayAnimeList;

// Display pagination controls
function displayPagination(totalPages, totalItems) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="goToPage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>
            ‹ Prev
        </button>
    `;
    
    // Page numbers
    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-btn disabled">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-btn disabled">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    paginationHTML += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="goToPage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            Next ›
        </button>
    `;
    
    // Page info
    paginationHTML += `
        <span class="pagination-info">
            Showing ${startItem}-${endItem} of ${totalItems}
        </span>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Go to specific page (make it globally accessible)
window.goToPage = function(page) {
    const totalPages = Math.ceil(currentAnimeList.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    
    // Apply filters and display
    let filtered = [...currentAnimeList];
    
    // Apply search filter
    if (currentSearch.trim() !== '') {
        if (typeof searchAnime === 'function') {
            filtered = searchAnime(currentSearch);
        }
    }
    
    // Apply genre filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(anime =>
            anime.genres && anime.genres.some(g => {
                const genreName = typeof g === 'string' ? g : g.name || '';
                return genreName.toLowerCase().replace(/\s+/g, '-') === currentFilter;
            })
        );
    }
    
    // Apply sorting
    if (typeof sortAnime === 'function') {
        filtered = sortAnime(filtered, currentSort);
    }
    
    // Update current list and display
    currentAnimeList = filtered;
    displayAnimeList(filtered);
    
    // Scroll to top of anime grid
    const grid = document.getElementById('anime-list-grid');
    if (grid) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Show no results message
function showNoResults() {
    const grid = document.getElementById('anime-list-grid');
    const noResults = document.getElementById('no-results');
    
    if (grid) grid.innerHTML = '';
    if (noResults) noResults.style.display = 'block';
}

// Show loading state
function showLoading() {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('anime-list-grid');
    
    if (grid) grid.innerHTML = '';
    if (loading) loading.style.display = 'block';
}

