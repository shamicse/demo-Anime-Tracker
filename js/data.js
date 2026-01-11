// Anime Data - Mock database
const animeData = [
    {
        id: 1,
        title: "Demon Slayer: Kimetsu no Yaiba",
        year: 2019,
        status: "Completed",
        episodes: 26,
        rating: "TV-14",
        genres: ["Action", "Adventure", "Fantasy", "Horror"],
        score: 8.7,
        ranked: 25,
        popularity: 1,
        studio: "Ufotable",
        synopsis: "Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
        trailer: "VQGCKyvzIM4",
        characters: [
            { name: "Tanjiro Kamado", role: "Main Character", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200" },
            { name: "Nezuko Kamado", role: "Main Character", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200" },
            { name: "Zenitsu Agatsuma", role: "Supporting", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200" }
        ],
        episodeList: [
            { number: 1, title: "Cruelty", aired: "2019-04-06" },
            { number: 2, title: "Trainer Sakonji Urokodaki", aired: "2019-04-13" },
            { number: 3, title: "Sabito and Makomo", aired: "2019-04-20" }
        ],
        reviews: [
            { user: "AnimeFan2024", rating: 5, comment: "Amazing animation and story!", date: "2024-01-15" },
            { user: "OtakuKing", rating: 5, comment: "Best anime of 2019. Highly recommended!", date: "2024-02-01" }
        ]
    },
    {
        id: 2,
        title: "Attack on Titan",
        year: 2013,
        status: "Completed",
        episodes: 75,
        rating: "TV-MA",
        genres: ["Action", "Drama", "Fantasy", "Horror"],
        score: 9.1,
        ranked: 5,
        popularity: 2,
        studio: "WIT Studio",
        synopsis: "Humanity fights for survival against the Titans in this epic tale.",
        image: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=400",
        trailer: "M_U8D4F2N8Q",
        characters: [
            { name: "Eren Yeager", role: "Main Character", image: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=200" },
            { name: "Mikasa Ackerman", role: "Main Character", image: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=200" }
        ],
        episodeList: [
            { number: 1, title: "To You, in 2000 Years", aired: "2013-04-07" },
            { number: 2, title: "That Day", aired: "2013-04-14" }
        ],
        reviews: [
            { user: "ReviewQueen", rating: 5, comment: "Masterpiece! The plot twists are incredible.", date: "2024-01-20" }
        ]
    },
    {
        id: 3,
        title: "Jujutsu Kaisen",
        year: 2020,
        status: "Ongoing",
        episodes: 24,
        rating: "TV-14",
        genres: ["Action", "Fantasy", "Horror", "Supernatural"],
        score: 8.6,
        ranked: 35,
        popularity: 3,
        studio: "MAPPA",
        synopsis: "A high schooler enters the world of Cursed Spirits and Jujutsu Sorcerers.",
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
        trailer: "pkKu9t3gsMY",
        characters: [
            { name: "Yuji Itadori", role: "Main Character", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200" }
        ],
        episodeList: [
            { number: 1, title: "Ryomen Sukuna", aired: "2020-10-03" }
        ],
        reviews: [
            { user: "AnimeCritic", rating: 5, comment: "Great animation and interesting story!", date: "2024-02-05" }
        ]
    },
    {
        id: 4,
        title: "One Piece",
        year: 1999,
        status: "Ongoing",
        episodes: "1000+",
        rating: "TV-14",
        genres: ["Action", "Adventure", "Comedy", "Fantasy"],
        score: 9.0,
        ranked: 10,
        popularity: 4,
        studio: "Toei Animation",
        synopsis: "Monkey D. Luffy and his pirate crew search for the ultimate treasure.",
        image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400",
        trailer: "S8_YwFLCh4U",
        characters: [
            { name: "Monkey D. Luffy", role: "Main Character", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200" }
        ],
        episodes: [],
        reviews: []
    },
    {
        id: 5,
        title: "My Hero Academia",
        year: 2016,
        status: "Ongoing",
        episodes: 113,
        rating: "TV-14",
        genres: ["Action", "Comedy", "School", "Super Power"],
        score: 8.4,
        ranked: 50,
        popularity: 5,
        studio: "Bones",
        synopsis: "A boy without powers strives to become a hero in a world of superpowers.",
        image: "https://images.unsplash.com/photo-1568292234323-60a200031b52?w=400",
        trailer: "Wo5dMEP_BbI",
        characters: [
            { name: "Izuku Midoriya", role: "Main Character", image: "https://images.unsplash.com/photo-1568292234323-60a200031b52?w=200" }
        ],
        episodes: [],
        reviews: []
    },
    {
        id: 6,
        title: "Death Note",
        year: 2006,
        status: "Completed",
        episodes: 37,
        rating: "TV-14",
        genres: ["Mystery", "Psychological", "Supernatural", "Thriller"],
        score: 9.0,
        ranked: 8,
        popularity: 6,
        studio: "Madhouse",
        synopsis: "A high schooler finds a notebook that can kill anyone whose name is written in it.",
        image: "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=400",
        trailer: "NlJZ-YgB-b0",
        characters: [
            { name: "Light Yagami", role: "Main Character", image: "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=200" }
        ],
        episodes: [],
        reviews: []
    },
    {
        id: 7,
        title: "Naruto",
        year: 2002,
        status: "Completed",
        episodes: 220,
        rating: "TV-PG",
        genres: ["Action", "Adventure", "Comedy", "Martial Arts"],
        score: 8.5,
        ranked: 40,
        popularity: 7,
        studio: "Pierrot",
        synopsis: "A young ninja seeks recognition and dreams of becoming the village leader.",
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
        trailer: "j2hiC9BmJlQ",
        characters: [],
        episodeList: [],
        reviews: []
    },
    {
        id: 8,
        title: "Fullmetal Alchemist: Brotherhood",
        year: 2009,
        status: "Completed",
        episodes: 64,
        rating: "TV-14",
        genres: ["Action", "Adventure", "Comedy", "Drama"],
        score: 9.2,
        ranked: 1,
        popularity: 8,
        studio: "Bones",
        synopsis: "Two brothers search for the Philosopher's Stone to restore their bodies.",
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
        trailer: "k4v_q4f3hPs",
        characters: [],
        episodeList: [],
        reviews: []
    },
    {
        id: 9,
        title: "Spirited Away",
        year: 2001,
        status: "Completed",
        episodes: 1,
        rating: "PG",
        genres: ["Adventure", "Fantasy", "Family", "Supernatural"],
        score: 8.9,
        ranked: 15,
        popularity: 9,
        studio: "Studio Ghibli",
        synopsis: "A young girl enters a world of spirits to save her parents.",
        image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400",
        trailer: "ByXuk9QqQkk",
        characters: [],
        episodeList: [],
        reviews: []
    },
    {
        id: 10,
        title: "Hunter x Hunter",
        year: 2011,
        status: "Completed",
        episodes: 148,
        rating: "TV-14",
        genres: ["Action", "Adventure", "Fantasy", "Supernatural"],
        score: 9.0,
        ranked: 12,
        popularity: 10,
        studio: "Madhouse",
        synopsis: "A boy sets out to become a Hunter and find his father.",
        image: "https://images.unsplash.com/photo-1568292234323-60a200031b52?w=400",
        trailer: "faqmNf_fZlE",
        characters: [],
        episodeList: [],
        reviews: []
    },
    {
        id: 11,
        title: "Tokyo Ghoul",
        year: 2014,
        status: "Completed",
        episodes: 12,
        rating: "TV-MA",
        genres: ["Action", "Drama", "Horror", "Supernatural"],
        score: 7.8,
        ranked: 150,
        popularity: 11,
        studio: "Pierrot",
        synopsis: "A college student becomes half-ghoul after an encounter with one.",
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
        trailer: "uMeR2W15wT8",
        characters: [],
        episodeList: [],
        reviews: []
    },
    {
        id: 12,
        title: "Your Name",
        year: 2016,
        status: "Completed",
        episodes: 1,
        rating: "PG",
        genres: ["Romance", "Drama", "Supernatural", "Slice of Life"],
        score: 8.7,
        ranked: 28,
        popularity: 12,
        studio: "CoMix Wave Films",
        synopsis: "Two teenagers swap bodies and develop a connection.",
        image: "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=400",
        trailer: "k4xGqY5IDBE",
        characters: [],
        episodeList: [],
        reviews: []
    }
];

// Get anime by ID
function getAnimeById(id) {
    return animeData.find(anime => anime.id === id);
}

// Get all anime
function getAllAnime() {
    return animeData;
}

// Filter anime by genre
function filterAnimeByGenre(genre) {
    if (genre === 'all') return animeData;
    return animeData.filter(anime => 
        anime.genres.some(g => g.toLowerCase().replace(/\s+/g, '-') === genre)
    );
}

// Search anime
function searchAnime(query) {
    const lowerQuery = query.toLowerCase();
    return animeData.filter(anime =>
        anime.title.toLowerCase().includes(lowerQuery) ||
        anime.studio.toLowerCase().includes(lowerQuery) ||
        anime.genres.some(g => g.toLowerCase().includes(lowerQuery))
    );
}

// Sort anime
function sortAnime(animeList, sortBy) {
    const sorted = [...animeList];
    switch(sortBy) {
        case 'title':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'rating':
            return sorted.sort((a, b) => b.score - a.score);
        case 'year':
            return sorted.sort((a, b) => b.year - a.year);
        case 'popularity':
            return sorted.sort((a, b) => a.popularity - b.popularity);
        default:
            return sorted;
    }
}

// Get featured anime (top rated)
function getFeaturedAnime(count = 6) {
    return [...animeData]
        .sort((a, b) => b.score - a.score)
        .slice(0, count);
}

// Get popular anime
function getPopularAnime(count = 6) {
    return [...animeData]
        .sort((a, b) => a.popularity - b.popularity)
        .slice(0, count);
}

// Get trending anime
function getTrendingAnime(count = 6) {
    return [...animeData]
        .filter(anime => anime.year >= 2020)
        .sort((a, b) => b.score - a.score)
        .slice(0, count);
}

// Get recommendations based on preferences
function getRecommendations(preferences) {
    let recommendations = [...animeData];
    
    // Filter by genres
    if (preferences.genres && preferences.genres.length > 0) {
        recommendations = recommendations.filter(anime =>
            anime.genres.some(genre => 
                preferences.genres.includes(genre.toLowerCase().replace(/\s+/g, '-'))
            )
        );
    }
    
    // Filter by rating
    if (preferences.rating === 'high') {
        recommendations = recommendations.filter(anime => anime.score >= 8.0);
    } else if (preferences.rating === 'medium') {
        recommendations = recommendations.filter(anime => anime.score >= 6.0 && anime.score < 8.0);
    }
    
    // Filter by year
    if (preferences.year === 'recent') {
        recommendations = recommendations.filter(anime => anime.year >= 2020);
    } else if (preferences.year === 'classic') {
        recommendations = recommendations.filter(anime => anime.year < 2010);
    }
    
    // Sort by score
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 12);
}

// Get similar anime based on genres
function getSimilarAnime(animeId, count = 6) {
    const anime = getAnimeById(animeId);
    if (!anime) return [];
    
    return animeData
        .filter(a => a.id !== animeId && a.genres.some(g => anime.genres.includes(g)))
        .sort((a, b) => {
            const aCommonGenres = a.genres.filter(g => anime.genres.includes(g)).length;
            const bCommonGenres = b.genres.filter(g => anime.genres.includes(g)).length;
            return bCommonGenres - aCommonGenres;
        })
        .slice(0, count);
}

