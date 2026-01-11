// AniList API Integration using GraphQL
// AniList API Documentation: https://anilist.gitbook.io/anilist-apiv2-docs/

const ANILIST_API_URL = 'https://graphql.anilist.co';

// GraphQL query to get popular anime
const POPULAR_ANIME_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: ANIME, sort: POPULARITY_DESC) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        description
        episodes
        status
        format
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        season
        seasonYear
        genres
        tags {
          name
        }
        averageScore
        meanScore
        popularity
        studios {
          nodes {
            name
          }
        }
        coverImage {
          large
          medium
        }
        bannerImage
        siteUrl
        trailer {
          id
          site
          thumbnail
        }
      }
    }
  }
`;

// GraphQL query to get trending anime
const TRENDING_ANIME_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        description
        episodes
        status
        format
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        season
        seasonYear
        genres
        tags {
          name
        }
        averageScore
        meanScore
        popularity
        studios {
          nodes {
            name
          }
        }
        coverImage {
          large
          medium
        }
        bannerImage
        siteUrl
        trailer {
          id
          site
          thumbnail
        }
      }
    }
  }
`;

// GraphQL query to get anime by genre
const GENRE_ANIME_QUERY = `
  query ($page: Int, $perPage: Int, $genre: String) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: ANIME, genre: $genre, sort: POPULARITY_DESC) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        description
        episodes
        status
        format
        startDate {
          year
          month
          day
        }
        genres
        averageScore
        popularity
        coverImage {
          large
          medium
        }
        bannerImage
        siteUrl
      }
    }
  }
`;

// GraphQL query to search anime
const SEARCH_ANIME_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        description
        episodes
        status
        format
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        season
        seasonYear
        genres
        tags {
          name
        }
        averageScore
        meanScore
        popularity
        studios {
          nodes {
            name
          }
        }
        coverImage {
          large
          medium
        }
        bannerImage
        siteUrl
        trailer {
          id
          site
          thumbnail
        }
      }
    }
  }
`;

// GraphQL query to get anime by ID
const GET_ANIME_QUERY = `
  query ($id: Int, $idMal: Int) {
    Media(id: $id, idMal: $idMal, type: ANIME) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      description
      episodes
      status
      format
      duration
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      season
      seasonYear
      genres
      tags {
        name
        rank
      }
      averageScore
      meanScore
      popularity
      rankings {
        rank
        type
        format
        year
        season
      }
      studios {
        nodes {
          name
          siteUrl
        }
      }
      coverImage {
        large
        medium
      }
      bannerImage
      siteUrl
      trailer {
        id
        site
        thumbnail
      }
      characters(page: 1, perPage: 10) {
        edges {
          role
          node {
            id
            name {
              full
            }
            image {
              large
            }
          }
        }
      }
      relations {
        edges {
          relationType
          node {
            id
            idMal
            title {
              romaji
              english
            }
            coverImage {
              large
            }
            averageScore
          }
        }
      }
    }
  }
`;

// Helper function to make GraphQL requests
async function anilistGraphQLRequest(query, variables = {}) {
    try {
        const response = await fetch(ANILIST_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.errors) {
            throw new Error(data.errors[0].message || 'GraphQL error');
        }

        return data.data;
    } catch (error) {
        console.error('AniList API Error:', error);
        throw error;
    }
}

// Get popular anime from AniList
async function getPopularAnimeFromAniList(limit = 25) {
    try {
        const variables = {
            page: 1,
            perPage: limit
        };

        const data = await anilistGraphQLRequest(POPULAR_ANIME_QUERY, variables);
        
        if (data && data.Page && data.Page.media) {
            return data.Page.media;
        }
        return [];
    } catch (error) {
        console.error('Error fetching popular anime from AniList:', error);
        return [];
    }
}

// Get trending anime from AniList
async function getTrendingAnimeFromAniList(limit = 25) {
    try {
        const variables = {
            page: 1,
            perPage: limit
        };

        const data = await anilistGraphQLRequest(TRENDING_ANIME_QUERY, variables);
        
        if (data && data.Page && data.Page.media) {
            return data.Page.media;
        }
        return [];
    } catch (error) {
        console.error('Error fetching trending anime from AniList:', error);
        return [];
    }
}

// Get multiple pages of anime from AniList (for large lists)
async function getMultiplePagesAnimeFromAniList(totalLimit = 1000, sortType = 'POPULARITY_DESC') {
    try {
        const perPage = 50; // AniList max per page
        const pagesNeeded = Math.ceil(totalLimit / perPage);
        const allAnime = [];
        
        // Use appropriate query based on sort type
        const query = sortType === 'TRENDING_DESC' ? TRENDING_ANIME_QUERY : POPULAR_ANIME_QUERY;
        
        // Fetch multiple pages
        for (let page = 1; page <= pagesNeeded && allAnime.length < totalLimit; page++) {
            try {
                const variables = {
                    page: page,
                    perPage: perPage
                };
                
                const data = await anilistGraphQLRequest(query, variables);
                
                if (data && data.Page && data.Page.media && data.Page.media.length > 0) {
                    allAnime.push(...data.Page.media);
                    
                    // Check if there are more pages
                    if (!data.Page.pageInfo.hasNextPage) {
                        break;
                    }
                    
                    // Small delay to respect rate limits
                    if (page < pagesNeeded) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                } else {
                    break; // No more data
                }
            } catch (error) {
                console.error(`Error fetching page ${page}:`, error);
                break; // Stop on error
            }
        }
        
        return allAnime.slice(0, totalLimit); // Return exactly the requested amount
    } catch (error) {
        console.error('Error fetching multiple pages from AniList:', error);
        return [];
    }
}

// Get top anime by time period (yearly, monthly, weekly)
async function getTopAnimeByPeriodFromAniList(period = 'yearly', limit = 10) {
    try {
        const now = new Date();
        let startDate = {};
        let endDate = {};
        
        if (period === 'yearly') {
            startDate = { year: now.getFullYear(), month: 1, day: 1 };
            endDate = { year: now.getFullYear(), month: 12, day: 31 };
        } else if (period === 'monthly') {
            startDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: 1 };
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            endDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: lastDay };
        } else if (period === 'weekly') {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            startDate = { year: weekStart.getFullYear(), month: weekStart.getMonth() + 1, day: weekStart.getDate() };
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            endDate = { year: weekEnd.getFullYear(), month: weekEnd.getMonth() + 1, day: weekEnd.getDate() };
        }
        
        // Use trending query for recent periods, popular for yearly
        const query = period === 'yearly' ? POPULAR_ANIME_QUERY : TRENDING_ANIME_QUERY;
        const variables = {
            page: 1,
            perPage: limit
        };
        
        const data = await anilistGraphQLRequest(query, variables);
        
        if (data && data.Page && data.Page.media) {
            // Filter by date if needed (for more accurate results)
            let filtered = data.Page.media;
            if (period !== 'yearly') {
                filtered = data.Page.media.filter(anime => {
                    const animeDate = anime.startDate;
                    if (!animeDate || !animeDate.year) return true; // Include if no date
                    // For trending, AniList already handles recent popularity
                    return true;
                });
            }
            return filtered.slice(0, limit);
        }
        return [];
    } catch (error) {
        console.error(`Error fetching ${period} top anime from AniList:`, error);
        return [];
    }
}

// Get anime by genre (at least 10 per genre)
async function getAnimeByGenreFromAniList(genre, limit = 10) {
    try {
        // Map common genre names to AniList format
        const genreMap = {
            'action': 'Action',
            'adventure': 'Adventure',
            'comedy': 'Comedy',
            'drama': 'Drama',
            'fantasy': 'Fantasy',
            'romance': 'Romance',
            'sci-fi': 'Sci-Fi',
            'horror': 'Horror',
            'sci-fi': 'Sci-Fi',
            'sci fi': 'Sci-Fi'
        };
        
        const anilistGenre = genreMap[genre.toLowerCase()] || genre;
        
        const variables = {
            page: 1,
            perPage: Math.max(limit, 10), // At least 10
            genre: anilistGenre
        };
        
        const data = await anilistGraphQLRequest(GENRE_ANIME_QUERY, variables);
        
        if (data && data.Page && data.Page.media) {
            return data.Page.media.slice(0, limit);
        }
        return [];
    } catch (error) {
        console.error(`Error fetching ${genre} anime from AniList:`, error);
        return [];
    }
}

// Search anime on AniList
async function searchAnimeFromAniList(query, limit = 25) {
    try {
        // If query is empty, get popular anime instead
        if (!query || query.trim() === '') {
            return await getPopularAnimeFromAniList(limit);
        }
        
        const variables = {
            search: query,
            page: 1,
            perPage: limit
        };

        const data = await anilistGraphQLRequest(SEARCH_ANIME_QUERY, variables);
        
        if (data && data.Page && data.Page.media) {
            return data.Page.media;
        }
        return [];
    } catch (error) {
        console.error('Error searching AniList:', error);
        return [];
    }
}

// Get anime by ID from AniList (can use AniList ID or MAL ID)
async function getAnimeFromAniList(id) {
    try {
        const idNum = parseInt(id);
        if (isNaN(idNum)) return null;
        
        // Try as MAL ID first (since most IDs from search will be MAL IDs)
        let variables = { idMal: idNum };
        let data = await anilistGraphQLRequest(GET_ANIME_QUERY, variables);
        
        // If not found, try as AniList ID
        if (!data || !data.Media) {
            variables = { id: idNum };
            data = await anilistGraphQLRequest(GET_ANIME_QUERY, variables);
        }

        if (data && data.Media) {
            return data.Media;
        }
        return null;
    } catch (error) {
        console.error('Error fetching anime from AniList:', error);
        return null;
    }
}

// Convert AniList format to our anime format
function convertAniListToAnimeFormat(anilistAnime) {
    if (!anilistAnime) return null;
    
    // Clean description - remove HTML tags
    let synopsis = anilistAnime.description || '';
    synopsis = synopsis.replace(/<[^>]*>/g, '').replace(/\n\n/g, '\n').trim();
    
    // Get title (prefer English, fallback to romaji, then native)
    const title = anilistAnime.title?.english || 
                  anilistAnime.title?.romaji || 
                  anilistAnime.title?.native || 
                  'Unknown Title';
    
    // Get year from startDate or seasonYear
    const year = anilistAnime.startDate?.year || 
                 anilistAnime.seasonYear || 
                 null;
    
    // Get studio
    const studio = anilistAnime.studios?.nodes?.[0]?.name || 'Unknown';
    
    // Get genres
    const genres = anilistAnime.genres || [];
    
    // Get score (averageScore is out of 100, convert to 10 scale)
    const score = anilistAnime.averageScore ? (anilistAnime.averageScore / 10).toFixed(2) : 0;
    
    // Get rank from rankings
    let ranked = 0;
    if (anilistAnime.rankings && anilistAnime.rankings.length > 0) {
        const allTimeRank = anilistAnime.rankings.find(r => r.type === 'RATED');
        ranked = allTimeRank ? allTimeRank.rank : 0;
    }
    
    // Get trailer URL
    let trailer = '';
    if (anilistAnime.trailer) {
        if (anilistAnime.trailer.site === 'youtube') {
            trailer = anilistAnime.trailer.id;
        } else if (anilistAnime.trailer.thumbnail) {
            // Extract YouTube ID from thumbnail URL if available
            const match = anilistAnime.trailer.thumbnail.match(/vi\/([^/]+)/);
            if (match) trailer = match[1];
        }
    }
    
    // Get characters
    const characters = (anilistAnime.characters?.edges || []).slice(0, 10).map(edge => ({
        name: edge.node.name.full,
        role: edge.role || 'Main',
        image: edge.node.image?.large || ''
    }));
    
    // Get related anime
    const recommendations = (anilistAnime.relations?.edges || [])
        .filter(edge => edge.relationType === 'PREQUEL' || edge.relationType === 'SEQUEL' || edge.relationType === 'SIDE_STORY')
        .slice(0, 6)
        .map(edge => ({
            id: edge.node.idMal || edge.node.id, // Use MAL ID if available, else AniList ID
            title: edge.node.title?.english || edge.node.title?.romaji || 'Unknown',
            image: edge.node.coverImage?.large || '',
            score: edge.node.averageScore ? (edge.node.averageScore / 10).toFixed(2) : 0,
            mal_id: edge.node.idMal || edge.node.id, // Use MAL ID or AniList ID as fallback
            year: edge.node.startDate?.year || null
        }));
    
    return {
        id: anilistAnime.idMal || anilistAnime.id, // Use MAL ID if available, else AniList ID (for compatibility)
        mal_id: anilistAnime.idMal || anilistAnime.id, // Use MAL ID or AniList ID as fallback
        anilist_id: anilistAnime.id,
        title: title,
        title_english: anilistAnime.title?.english,
        title_japanese: anilistAnime.title?.native,
        year: year,
        status: anilistAnime.status || 'UNKNOWN',
        episodes: anilistAnime.episodes || 0,
        rating: anilistAnime.format || 'TV',
        genres: genres,
        score: parseFloat(score),
        ranked: ranked,
        popularity: anilistAnime.popularity || 0,
        studio: studio,
        synopsis: synopsis || 'No synopsis available for this anime.',
        image: anilistAnime.coverImage?.large || anilistAnime.coverImage?.medium || '',
        bannerImage: anilistAnime.bannerImage || '',
        trailer: trailer,
        url: anilistAnime.siteUrl || '',
        duration: anilistAnime.duration || null,
        season: anilistAnime.season || null,
        seasonYear: anilistAnime.seasonYear || null,
        characters: characters,
        recommendations: recommendations
    };
}

// Load anime detail from AniList
async function loadAnimeDetailFromAniList(animeId) {
    try {
        const anime = await getAnimeFromAniList(animeId);
        if (!anime) {
            return null;
        }
        
        const formattedAnime = convertAniListToAnimeFormat(anime);
        return formattedAnime;
    } catch (error) {
        console.error('Error loading anime detail from AniList:', error);
        return null;
    }
}
