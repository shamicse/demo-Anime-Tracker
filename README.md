# AnimeTracker - Complete Setup & Documentation Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Quick Start](#quick-start)
4. [Project Structure](#project-structure)
5. [Setup Instructions](#setup-instructions)
6. [Configuration](#configuration)
7. [Using AnimeTracker](#using-animetracker)
8. [Pages Guide](#pages-guide)
9. [API Integration](#api-integration)
10. [Mobile Responsiveness](#mobile-responsiveness)
11. [Troubleshooting](#troubleshooting)
12. [About AnimeTracker](#about-animetracker)

---

## 🎯 Overview

AnimeTracker is a comprehensive web-based platform for anime enthusiasts to discover, track, and manage their favorite anime series. Built with HTML, CSS, and JavaScript, it provides a modern, mobile-friendly interface with features like watchlist management, personalized recommendations, community engagement, and an extensive anime database.

**Tech Stack:**
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- APIs: MyAnimeList (MAL) API, AniList API
- Backend: Supabase (for user authentication and data storage)
- Styling: Custom CSS with CSS Variables
- Icons: Unicode emojis and symbols

---

## ✨ Features

### Core Features
- 🔍 **Anime Search & Discovery** - Search from thousands of anime with instant results
- 📝 **Personal Watchlist** - Organize anime into categories (Watching, Completed, Plan to Watch, Dropped, etc.)
- ⭐ **Rating System** - Rate anime on a 1-10 scale with detailed reviews
- 🎯 **Smart Recommendations** - Get personalized anime suggestions based on your preferences
- 📱 **Mobile Responsive** - Fully optimized for mobile, tablet, and desktop devices
- 👥 **Community Features** - Engage with discussions and see community rankings
- 📰 **Blog Section** - Read articles about anime news, reviews, and insights
- ❓ **FAQ Page** - Comprehensive answers to common questions
- ℹ️ **About Page** - Learn about AnimeTracker's mission and values

### Advanced Features
- Real-time search with dropdown preview
- Anime detail pages with trailers, characters, and reviews
- Progress tracking for ongoing series
- Multiple anime database sources (MAL & AniList)
- User authentication with Supabase
- Local storage fallback for watchlists
- Dark theme optimized UI

---

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A code editor (VS Code recommended)
- Optional: Supabase account for full authentication features
- Optional: API keys for MAL/AniList (works with default endpoints)

### Installation Steps

1. **Clone or Download the Project**
   ```bash
   # If using git
   git clone <repository-url>
   cd anime-tracker
   
   # Or simply extract the zip file
   ```

2. **Open in Browser**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     
     # Using VS Code Live Server extension
     # Right-click index.html → Open with Live Server
     ```

3. **Access the Application**
   - Open your browser and go to `http://localhost:8000` (or the port your server uses)
   - Start exploring!

---

## 📁 Project Structure

```
anime-tracker/
│
├── index.html              # Homepage with hero slider and featured anime
├── anime-list.html         # Browse all anime with filters
├── anime-detail.html       # Individual anime detail page
├── my-watchlist.html       # User watchlist management
├── recommendations.html    # Personalized recommendations
├── search-results.html     # Search results page
├── blog.html              # Blog listing page
├── blog-post-1.html       # Blog post: Top 10 Upcoming Anime
├── blog-post-2.html       # Blog post: Best Romance Anime
├── blog-post-3.html       # Blog post: Isekai Anime History
├── blog-post-4.html       # Blog post: Best Waifu Characters
├── blog-post-5.html       # Blog post: Shonen vs Seinen
├── community.html         # Community discussions and rankings
├── contact.html           # Contact form page
├── faq.html              # Frequently Asked Questions
├── about.html            # About AnimeTracker page
├── updates.html          # Site updates and changelog
├── login.html            # User authentication page
│
├── css/
│   └── style.css         # Main stylesheet with all styles
│
├── js/
│   ├── main.js           # Main JavaScript file (navigation, search, hero slider)
│   ├── data.js           # Local anime data (fallback)
│   ├── anime-list.js     # Anime list page functionality
│   ├── anime-detail.js   # Anime detail page functionality
│   ├── watchlist.js      # Watchlist management
│   ├── watchlist-supabase.js  # Supabase watchlist integration
│   ├── recommendations.js     # Recommendation engine
│   ├── search-results.js      # Search functionality
│   ├── anime-cache.js         # Caching system
│   ├── mal-api.js             # MyAnimeList API integration
│   ├── anilist-api.js         # AniList API integration
│   ├── youtube-api.js         # YouTube trailer integration
│   ├── rating-modal.js        # Rating modal functionality
│   ├── navbar-auth.js         # Navigation authentication
│   ├── contact.js             # Contact form handling
│   ├── community.js           # Community page functionality
│   └── supabase-config.js     # Supabase configuration
│
└── README.md             # This file
```

---

## ⚙️ Setup Instructions

### Basic Setup (No Backend)

1. **Open the Project**
   - Extract all files to a folder
   - Open `index.html` in a browser
   - That's it! The site works with local storage

### With Supabase (Recommended for Full Features)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Create a free account
   - Create a new project

2. **Get Your Supabase Credentials**
   - Go to Project Settings → API
   - Copy your Project URL and anon/public key

3. **Configure Supabase**
   - Open `js/supabase-config.js`
   - Replace with your credentials:
     ```javascript
     const SUPABASE_URL = 'your-project-url';
     const SUPABASE_ANON_KEY = 'your-anon-key';
     ```

4. **Set Up Database Tables**
   - Go to SQL Editor in Supabase
   - Run the SQL from `supabase-sql-setup.sql` to create tables:
     - `watchlists` - User watchlist data
     - `ratings` - User ratings
     - `profiles` - User profiles

### API Configuration (Optional)

The app works with default MAL and AniList endpoints. For better performance:

1. **MyAnimeList API**
   - Register at [MyAnimeList](https://myanimelist.net)
   - Create an API client (if needed)
   - Update `js/mal-api.js` with your client ID

2. **AniList API**
   - Works with public GraphQL endpoint (no auth required)
   - No configuration needed

---

## 🎨 Configuration

### Customizing Colors

Edit `css/style.css` and modify CSS variables:

```css
:root {
    --primary-color: #f47521;      /* Orange theme color */
    --secondary-color: #232530;    /* Dark secondary */
    --dark-bg: #14151a;            /* Background */
    --light-text: #ffffff;         /* Text color */
    /* ... more variables */
}
```

### Adding Custom Anime Data

Edit `js/data.js` to add local anime data:

```javascript
const animeData = [
    {
        id: 1,
        title: "Anime Title",
        image: "image-url",
        year: 2024,
        // ... more fields
    }
];
```

---

## 📖 Using AnimeTracker

### Getting Started

1. **Browse Anime**
   - Click "Anime List" in navigation
   - Use filters to find anime by genre, year, etc.
   - Click on any anime card to see details

2. **Create Account**
   - Click "Login" in navigation
   - Sign up with email/password
   - Or continue as guest (uses local storage)

3. **Add to Watchlist**
   - Go to any anime detail page
   - Click "Add to Watchlist"
   - Choose category: Watching, Completed, Plan to Watch, etc.

4. **Rate Anime**
   - Open anime detail page
   - Click "Rate" button
   - Select 1-10 stars
   - Your rating is saved

5. **Get Recommendations**
   - Go to "Recommendations" page
   - Select your preferences (genres, themes, etc.)
   - Click "Get Recommendations"
   - Browse suggested anime

### Search Functionality

- **Global Search**: Use the search bar in navigation
  - Type anime title
  - See instant dropdown results
  - Click result to go to detail page
  - Or click search button for full results page

- **Advanced Search**: Go to Anime List page
  - Use search bar at top
  - Apply genre filters
  - Sort by title, rating, year, popularity

### Watchlist Management

1. **Access Watchlist**: Click "Watchlist" in navigation
2. **View Categories**: 
   - All Watchlist
   - Watch Later
   - Currently Watching
   - Completed
   - Dropped
   - Plan to Watch
3. **Update Status**: Click dropdown on any anime card
4. **Track Progress**: Progress bar shows episodes watched
5. **Remove Anime**: Click "Remove" button

### Community Features

1. **Browse Discussions**: Go to Community page
2. **View Rankings**: See top contributors
3. **Join Discussions**: Click on discussion cards (coming soon)
4. **View Stats**: See community statistics

---

## 📄 Pages Guide

### Homepage (`index.html`)
- Hero slider with featured anime
- Featured This Season section
- Popular Now section
- Trending section
- Latest Blog Posts (3 featured)
- Fully responsive design

### Anime List (`anime-list.html`)
- Browse all anime
- Search functionality
- Filter by genre
- Sort by title, rating, year, popularity
- Pagination support

### Anime Detail (`anime-detail.html`)
- Complete anime information
- Synopsis and metadata
- Genre tags
- Rating and statistics
- Watch trailer button
- Add to watchlist options
- Rate anime functionality
- Characters tab
- Episodes tab
- Reviews tab
- Related anime suggestions

### Watchlist (`my-watchlist.html`)
- Multiple category tabs
- Progress tracking
- Status management
- Remove anime
- Empty state messages
- Statistics (count per category)

### Recommendations (`recommendations.html`)
- Preference filters
- Genre selection
- Theme selection
- Anime type selection
- Get personalized recommendations
- Display results in grid

### Search Results (`search-results.html`)
- Display search query
- Filter and sort options
- Results grid
- Pagination
- "No results" state

### Blog (`blog.html`)
- List of all blog posts
- Featured images
- Categories
- Meta information
- Pagination
- Links to individual posts

### Blog Posts (`blog-post-1.html` through `blog-post-5.html`)
- Full blog content
- Formatted text
- Lists and sections
- Back to blog link
- Responsive layout

### Community (`community.html`)
- Community statistics
- Featured discussions
- Top contributors ranking
- Join community CTA
- Interactive elements

### Contact (`contact.html`)
- Contact information
- Social media links
- Contact form with validation
- Subject categories
- Success/error messages

### FAQ (`faq.html`)
- Expandable FAQ items
- Organized by category
- Smooth animations
- Comprehensive answers

### About (`about.html`)
- Mission statement
- Features overview
- Story/history
- Core values
- Call-to-action buttons

### Updates (`updates.html`)
- Changelog entries
- Update categories (new, improvement, bugfix, etc.)
- Timeline layout
- Version history

### Login (`login.html`)
- Sign up form
- Sign in form
- Password toggle
- Form validation
- Supabase integration

---

## 🔌 API Integration

### MyAnimeList API

The app integrates with MAL API for anime data:

**Endpoints Used:**
- `https://api.myanimelist.net/v2/anime` - Search and get anime
- `https://api.myanimelist.net/v2/anime/{id}` - Get anime details
- `https://api.myanimelist.net/v2/anime/ranking` - Get top anime

**Rate Limits:** Free tier has limits. App includes error handling and fallbacks.

### AniList API

Uses AniList GraphQL API:

**Endpoint:** `https://graphql.anilist.co`

**Features:**
- Search anime
- Get anime details
- Get trending/popular anime
- No authentication required for public queries

### Supabase Integration

**Tables Used:**
- `watchlists` - User anime lists
- `ratings` - User ratings
- `profiles` - User profiles

**Features:**
- User authentication
- Real-time data sync
- Secure data storage
- Row-level security

---

## 📱 Mobile Responsiveness

### Breakpoints
- **Desktop**: > 768px
- **Tablet**: 481px - 768px
- **Mobile**: ≤ 480px

### Mobile Features
- Hamburger menu navigation
- Touch-optimized buttons (44px minimum)
- Swipe-friendly carousels
- Responsive grid layouts
- Mobile-optimized forms
- Bottom-positioned search results
- Landscape mode support

### Touch Optimizations
- Large tap targets
- Smooth scrolling
- Touch-action properties
- Prevent zoom on input focus (font-size: 16px)
- Optimized animations

---

## 🔧 Troubleshooting

### Common Issues

**1. Search Not Working**
- Check browser console for errors
- Verify API endpoints are accessible
- Check network connectivity
- Try refreshing the page

**2. Watchlist Not Saving**
- Check if logged in (for Supabase)
- Check browser localStorage permissions
- Clear cache and try again
- Check console for Supabase errors

**3. Images Not Loading**
- Check internet connection
- Some images may be from external APIs
- Fallback placeholder images should appear

**4. Supabase Not Working**
- Verify credentials in `js/supabase-config.js`
- Check Supabase project is active
- Verify database tables exist
- Check browser console for auth errors

**5. Mobile Menu Not Opening**
- Check JavaScript is enabled
- Clear browser cache
- Verify `js/main.js` is loaded
- Check for JavaScript errors in console

**6. Ratings Not Saving**
- Must be logged in for Supabase
- Check database connection
- Verify ratings table exists
- Check console for errors

### Debug Mode

Enable console logging:
```javascript
// In any JS file
const DEBUG = true;
if (DEBUG) console.log('Debug message');
```

---

## 📝 About AnimeTracker

### Mission
AnimeTracker provides anime fans with the best platform for discovering, tracking, and sharing their favorite series. We combine powerful tracking tools with a vibrant community.

### Features Philosophy
- **User-First**: Everything designed for the best user experience
- **Free & Accessible**: Always free, always accessible
- **Community-Driven**: Built for fans, by fans
- **Continuous Innovation**: Always improving based on feedback

### Technology
- Modern web standards (HTML5, CSS3, ES6+)
- RESTful API integration
- GraphQL queries (AniList)
- Real-time database (Supabase)
- Responsive design principles
- Progressive enhancement

### Data Sources
- **MyAnimeList API**: Comprehensive anime database
- **AniList API**: Alternative data source with GraphQL
- **YouTube API**: Trailer videos (requires API key)
- **Local Data**: Fallback anime data in `js/data.js`

---

## 🚀 Quick Commands Reference

### Development

**Start Local Server:**
```bash
# Python
python -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

**Open in Browser:**
- Navigate to `http://localhost:8000`
- Or open `index.html` directly

### File Locations

**Main Entry Point:** `index.html`

**Styles:** `css/style.css`

**Main Script:** `js/main.js`

**Configuration:** `js/supabase-config.js`

**Database Setup:** `supabase-sql-setup.sql`

---

## 📚 Additional Resources

### Documentation Files
- `SETUP.md` - Detailed setup guide
- `SUPABASE_SETUP.md` - Supabase configuration
- `FRONTEND_INTEGRATION.md` - Frontend integration guide
- `NEXT_STEPS.md` - Next steps for development

### Support
- **FAQ Page**: Visit `faq.html` for common questions
- **Contact Page**: Use `contact.html` to reach out
- **Community**: Join discussions on `community.html`

---

## 🎯 Getting Started Checklist

- [ ] Download/extract project files
- [ ] Open `index.html` in browser
- [ ] Test basic functionality
- [ ] (Optional) Set up Supabase account
- [ ] (Optional) Configure API keys
- [ ] Customize colors/branding if desired
- [ ] Test on mobile device
- [ ] Share with users!

---

## 📄 License & Credits

### Built With
- MyAnimeList API
- AniList API
- Supabase
- Font Awesome (if used)
- Unsplash (placeholder images)

### Contributors
- Built with ❤️ for the anime community

---

## 🔄 Version History

See `updates.html` for detailed changelog.

**Current Version:** 1.0.0

**Last Updated:** March 2024

---

## 📞 Need Help?

1. **Check FAQ**: Visit `faq.html` for answers
2. **Contact Us**: Use the contact form at `contact.html`
3. **Community**: Join discussions on `community.html`
4. **Read Docs**: Check documentation files in project root

---

## 🎉 You're All Set!

AnimeTracker is ready to use. Start by opening `index.html` and exploring the features. Enjoy tracking your anime journey!

**Happy Anime Tracking! 🎌**

---

*For the latest updates and features, visit the Updates page or check the project repository.*
