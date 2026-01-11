// Supabase Configuration
// Your Supabase project credentials

const SUPABASE_URL = 'https://sxamhmcgmcmhxfefzeyh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RPzUFJdtPm5vFg7rW0S5LQ_EMtxWBdP'; // Anon/public key (safe for frontend)

// Initialize Supabase client
// IMPORTANT: This script must load AFTER the Supabase CDN script in HTML
// The Supabase CDN script creates a global object we use to create clients

// Declare supabase variable globally (use var for global scope)
var supabase;

// Initialize Supabase client
// The CDN script loads, we need to wait for it and initialize
(function initSupabaseClient() {
    var retries = 0;
    var maxRetries = 100; // Try for up to 10 seconds (100 * 100ms)
    
    function tryInit() {
        retries++;
        try {
            // The Supabase CDN script exposes the library in different ways depending on version
            // Try different ways it might be exposed
            if (typeof window.supabase !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
                // Most common: window.supabase.createClient
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('Supabase client initialized successfully');
                return;
            } else if (typeof createClient !== 'undefined' && typeof createClient === 'function') {
                // Alternative: createClient as global function
                supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('Supabase client initialized successfully');
                return;
            }
            
            // If not initialized and haven't exceeded retries, try again
            if (retries < maxRetries) {
                setTimeout(tryInit, 100);
            } else {
                console.warn('Supabase library not found. Make sure the CDN script is included BEFORE this script in HTML.');
            }
        } catch (error) {
            console.error('Error initializing Supabase:', error);
            if (retries < maxRetries) {
                setTimeout(tryInit, 200);
            }
        }
    }
    
    // Start initialization
    tryInit();
})();

// Helper functions
async function getCurrentUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

async function getCurrentSession() {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

async function isLoggedIn() {
    if (!supabase) return false;
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
}

// Get user profile
async function getUserProfile() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    
    return data;
}
