// Watchlist functions using Supabase

// Get all watchlist items for current user
async function getWatchlistItems() {
    if (!supabase) {
        console.error('Supabase not initialized');
        return [];
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_date', { ascending: false });
    
    if (error) {
        console.error('Error fetching watchlist:', error);
        return [];
    }
    
    return data || [];
}

// Get watchlist by status
async function getWatchlistByStatus(status) {
    if (!supabase) {
        console.error('Supabase not initialized');
        return [];
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', status)
        .order('updated_date', { ascending: false });
    
    if (error) {
        console.error(`Error fetching ${status}:`, error);
        return [];
    }
    
    return data || [];
}

// Add anime to watchlist
async function addToWatchlistSupabase(animeId, status = 'watchlist', progress = 0, rating = null, notes = '') {
    if (!supabase) {
        throw new Error('Supabase not initialized');
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('You must be logged in to add to watchlist');
    }
    
    // Check if already exists (use maybeSingle() instead of single() to handle "no rows" case)
    const { data: existing, error: checkError } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('anime_id', animeId)
        .maybeSingle();
    
    // If checkError is not a "no rows" error, handle it
    if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing watchlist item:', checkError);
    }
    
    if (existing && existing.id) {
        // Update existing
        const { data, error } = await supabase
            .from('watchlist')
            .update({
                status: status,
                progress: progress,
                rating: rating,
                notes: notes,
                updated_date: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating watchlist:', error);
            throw error;
        }
        return data;
    } else {
        // Insert new
        const { data, error } = await supabase
            .from('watchlist')
            .insert({
                user_id: user.id,
                anime_id: animeId,
                status: status,
                progress: progress,
                rating: rating,
                notes: notes
            })
            .select()
            .single();
        
        if (error) {
            console.error('Error inserting watchlist:', error);
            throw error;
        }
        return data;
    }
}

// Update watchlist item
async function updateWatchlistItem(itemId, updates) {
    if (!supabase) {
        throw new Error('Supabase not initialized');
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('You must be logged in');
    }
    
    const { data, error } = await supabase
        .from('watchlist')
        .update({
            ...updates,
            updated_date: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('user_id', user.id)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

// Remove from watchlist
async function removeFromWatchlistSupabase(itemId) {
    if (!supabase) {
        throw new Error('Supabase not initialized');
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('You must be logged in');
    }
    
    const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);
    
    if (error) throw error;
}

// Remove by animeId
async function removeFromWatchlistByAnimeId(animeId) {
    if (!supabase) {
        throw new Error('Supabase not initialized');
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('You must be logged in');
    }
    
    const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('anime_id', animeId);
    
    if (error) throw error;
}

// Check if anime is in watchlist
async function isAnimeInWatchlist(animeId) {
    if (!supabase) return null;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data } = await supabase
        .from('watchlist')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('anime_id', animeId)
        .single();
    
    return data ? data.status : null;
}
