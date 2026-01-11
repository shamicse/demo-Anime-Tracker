// YouTube API Integration for fetching anime trailers
// Uses YouTube Data API v3 (requires API key) or fallback search method
//
// SETUP INSTRUCTIONS:
// 1. Go to https://console.cloud.google.com/apis/credentials
// 2. Create a new project or select existing one
// 3. Enable "YouTube Data API v3"
// 4. Create credentials (API Key)
// 5. Replace YOUTUBE_API_KEY below with your key
// 6. (Optional) Restrict the API key to YouTube Data API v3 for security
//
// Note: Without an API key, the system will use fallback methods (YouTube search URLs)

const YOUTUBE_API_KEY = ''; // Replace with your YouTube Data API v3 key
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

// Create YouTube search URL (fallback method - opens YouTube search)
function createYouTubeSearchUrl(animeTitle, year = null) {
    let searchQuery = `${animeTitle} official trailer`;
    if (year) {
        searchQuery += ` ${year}`;
    }
    searchQuery += ' anime';
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
}

// Search YouTube using Data API v3 (requires API key)
async function searchYouTubeWithAPI(animeTitle, year = null) {
    if (!YOUTUBE_API_KEY) {
        return null;
    }
    
    try {
        let searchQuery = `${animeTitle} official trailer`;
        if (year) {
            searchQuery += ` ${year}`;
        }
        searchQuery += ' anime';
        
        const url = `${YOUTUBE_API_URL}?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            // Find the most relevant trailer (usually first result)
            const video = data.items[0];
            return {
                videoId: video.id.videoId,
                title: video.snippet.title,
                thumbnail: video.snippet.thumbnails.medium.url,
                channelTitle: video.snippet.channelTitle
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching from YouTube API:', error);
        return null;
    }
}

// Main function to get YouTube trailer ID
// Tries multiple methods to find the best trailer
async function getYouTubeTrailerId(animeTitle, year = null, malId = null) {
    // Method 1: Try YouTube Data API if key is available
    if (YOUTUBE_API_KEY) {
        try {
            const apiResult = await Promise.race([
                searchYouTubeWithAPI(animeTitle, year),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            if (apiResult && apiResult.videoId) {
                return apiResult.videoId;
            }
        } catch (error) {
            console.error('YouTube API search failed:', error);
        }
    }
    
    // Method 2: Return null - will use fallback search URL
    // In production with YouTube API key, this would search YouTube
    return null;
}

// Enhanced function that uses existing trailer data and enhances it
async function enhanceTrailerWithYouTube(animeTitle, existingTrailerId = null, year = null, malId = null) {
    // If we already have a trailer ID, use it
    if (existingTrailerId) {
        return existingTrailerId;
    }
    
    // Try to find trailer using YouTube API (if API key is configured)
    const trailerId = await getYouTubeTrailerId(animeTitle, year, malId);
    
    if (trailerId) {
        return trailerId;
    }
    
    // Fallback: return null - UI will show YouTube search option
    return null;
}

// Get YouTube search URL for anime trailer
function getYouTubeTrailerSearchUrl(animeTitle, year = null) {
    return createYouTubeSearchUrl(animeTitle, year);
}

// Extract YouTube video ID from various URL formats
function extractYouTubeVideoId(url) {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
        /youtu\.be\/([^?\n#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    // If it's already just an ID (11 characters)
    if (url.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
    }
    
    return null;
}

// Create YouTube embed URL from video ID
function createYouTubeEmbedUrl(videoId, autoplay = false) {
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`;
}

// Search YouTube using a public method (no API key required)
// This uses YouTube's search page and extracts video IDs
// Note: This is a fallback method and may not always work due to CORS
async function searchYouTubePublic(animeTitle, year = null) {
    try {
        // Construct search query
        let query = `${animeTitle} official trailer`;
        if (year) {
            query += ` ${year}`;
        }
        query += ' anime';
        
        // Use YouTube's search API endpoint (public, no key required but rate limited)
        // Note: This endpoint may be blocked by CORS in browsers
        // For production, use YouTube Data API v3 with an API key
        
        // Alternative: Use a proxy service or backend API
        // For now, we'll return null and rely on trailer data from AniList/MAL
        
        return null;
    } catch (error) {
        console.error('Error in public YouTube search:', error);
        return null;
    }
}
