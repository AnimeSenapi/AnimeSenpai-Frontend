# 🎌 AnimeSenpai Frontend

> **Discover anime, track your journey, connect with fans** — A beautiful, modern web app for anime lovers.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.2-orange)](https://bun.sh)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

---

## ✨ Features

### 🎨 Modern UI/UX
- **Glass-morphism Design** - Premium frosted glass effects throughout
- **Dark Theme** - OLED-optimized with gradient accents (primary blue + secondary purple)
- **Fully Responsive** - Optimized for desktop, tablet, and mobile
- **iPad Optimized** - Special attention to iPad experience
- **Smooth Animations** - Polished transitions and micro-interactions
- **Loading States** - Skeleton screens for better perceived performance
- **Toast Notifications** - Beautiful notifications for user feedback

### 🔐 Authentication
- Email/password signup with verification
- Secure sign-in with "remember me"
- Password reset functionality
- Email verification system
- Protected routes with automatic redirects
- Session management with auto-refresh

### 🎬 Anime Features
- **Browse & Discover** - Trending, popular, and recommended anime
- **Advanced Search** - Filter by genre, year, status, and more
- **Detailed Pages** - Rich anime information with:
  - Synopsis and background
  - Genres (clickable to filter search)
  - Ratings and statistics
  - **Trailer videos** (YouTube integration)
  - **Streaming platform links** (where to watch)
  - Related seasons and similar anime
- **Personal Lists** - Track anime across 4 lists:
  - 👁️ Watching
  - ✅ Completed
  - 📌 Plan to Watch
  - ❤️ Favorite
- **Ratings & Reviews** - Rate anime (1-10) and write reviews
- **Quick Bookmark** - One-click add to "Plan to Watch"

### 👥 Social Features
- **User Profiles** - Customizable profiles with bio and avatar
- **Follow System** - Follow users and build your network
- **Friends Lists** - View followers, following, and mutual friends
- **Social Recommendations** - See what friends are watching
- **Share Anime** - Share to Twitter, Facebook, Discord, Reddit, or native sharing
- **Share Profiles** - Share your profile with others
- **Activity Feed** - See friend ratings and completions

### 🏆 Achievements & Gamification
- **35+ Achievements** across 5 categories:
  - 🎬 Watching (episodes watched, anime completed)
  - 👥 Social (followers, friends)
  - 📚 Collection (list size, favorites)
  - ⭐ Rating (ratings given, high ratings)
  - 🌍 Exploration (genres, studios)
- **5 Tiers** per achievement (Bronze → Silver → Gold → Platinum → Legendary)
- **Progress Tracking** - See how close you are to unlocking
- **Achievement Showcase** - Display on your profile

### ❓ Help & Support
- **FAQ Page** - Searchable help center with categories
- **Privacy Policy** - Comprehensive privacy information
- **Terms of Service** - Clear terms and conditions

### 🍪 Privacy & Compliance
- **Cookie Consent** - GDPR-compliant cookie banner
- **Privacy Controls** - Control what's visible on your profile
- **Data Management** - Export or delete your data
- **Notification Preferences** - Granular control over notifications

---

## 🚀 Quick Start

### Prerequisites
- **Bun** 1.2+ — [Install here](https://bun.sh/)
- **AnimeSenpai Backend** running on port 3001

### Installation

```bash
# Install dependencies
bun install

# Set up environment
cp env.example .env.local
# Edit .env.local with your configuration

# Start development server
bun dev -p 3002

# Open browser
open http://localhost:3002
```

### Environment Configuration

Create `.env.local`:

```env
# Backend API (Required)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/trpc

# Frontend URL (Optional)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3002

# Environment
NODE_ENV=development
```

---

## 📦 Production Build

### Build for Production

```bash
# Create optimized production build
bun run build

# Start production server
bun run start
```

### Build Performance
- **Build Time:** ~2.2 seconds ⚡
- **Static Bundle:** 780 KB
- **Server Bundle:** 912 KB
- **Average Page:** ~123 KB (all under 150 KB)
- **Total Pages:** 18 (all statically generated)

### Page Sizes

| Route | Size | First Load JS |
|-------|------|---------------|
| `/` | 1.48 kB | 106 KB |
| `/dashboard` | 6.37 kB | 133 KB |
| `/search` | 5.39 kB | 125 KB |
| `/mylist` | 7.04 kB | 126 KB |
| `/user/profile` | 6.78 kB | 134 KB |
| `/user/settings` | 6.07 kB | 127 KB |
| `/achievements` | 5.25 kB | 126 KB |

---

## 📁 Project Structure

```
AnimeSenpai-Frontend/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── anime/[slug]/          # Dynamic anime detail pages
│   │   ├── auth/                  # Authentication pages
│   │   │   ├── signin/           # Sign in page
│   │   │   ├── signup/           # Sign up page
│   │   │   ├── forgot-password/  # Password reset request
│   │   │   ├── reset-password/   # Password reset with token
│   │   │   └── verify-email/     # Email verification
│   │   ├── dashboard/             # Main dashboard
│   │   ├── mylist/                # User's anime list
│   │   ├── search/                # Search & filter page
│   │   ├── achievements/          # Achievements page
│   │   ├── help/                  # FAQ/Help center
│   │   ├── social/friends/        # Friends management
│   │   ├── user/                  # User pages
│   │   │   ├── profile/          # User profile
│   │   │   └── settings/         # Account settings
│   │   ├── users/[username]/     # Public user profiles
│   │   ├── privacy/               # Privacy policy
│   │   ├── terms/                 # Terms of service
│   │   ├── lib/                   # Core utilities
│   │   │   ├── api.ts            # Backend API client
│   │   │   ├── auth-context.tsx  # Auth state management
│   │   │   ├── protected-route.tsx # Route protection
│   │   │   └── utils.ts          # Helper functions
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Global styles
│   │
│   ├── components/                # React components
│   │   ├── anime/                # Anime components
│   │   │   ├── AnimeCard.tsx    # Standard anime card
│   │   │   ├── MyListAnimeCard.tsx # List-specific card
│   │   │   ├── SearchAnimeCard.tsx # Search result card
│   │   │   └── TrailerPlayer.tsx # YouTube trailer modal
│   │   ├── navbar/               # Navigation
│   │   │   ├── navbar.tsx       # Main navigation
│   │   │   ├── GuestAuth.tsx    # Guest auth buttons
│   │   │   └── StandaloneDropdown.tsx # Search dropdown
│   │   ├── search/               # Search components
│   │   │   └── SearchBar.tsx    # Search with autocomplete
│   │   ├── social/               # Social components
│   │   │   ├── FollowButton.tsx # Follow/unfollow button
│   │   │   ├── FollowList.tsx   # Followers/following list
│   │   │   ├── FriendsWatching.tsx # Friends carousel
│   │   │   ├── ShareButton.tsx  # Universal share button
│   │   │   └── ShareAnimeCard.tsx # Share modal
│   │   ├── achievements/         # Achievement components
│   │   │   ├── AchievementBadge.tsx # Single badge
│   │   │   └── AchievementsShowcase.tsx # Grid display
│   │   ├── recommendations/      # Recommendation components
│   │   │   └── RecommendationCarousel.tsx # Scrolling carousel
│   │   └── ui/                   # UI primitives (Shadcn)
│   │       ├── button.tsx       # Button component
│   │       ├── badge.tsx        # Badge component
│   │       ├── card.tsx         # Card component
│   │       ├── checkbox.tsx     # Checkbox component
│   │       ├── dropdown-menu.tsx # Dropdown component
│   │       ├── skeleton.tsx     # Loading skeletons
│   │       ├── toast.tsx        # Toast notifications
│   │       ├── separator.tsx    # Divider component
│   │       └── back-button.tsx  # Navigation button
│   │
│   ├── lib/                      # Shared utilities
│   │   ├── achievements.ts      # Achievement definitions & logic
│   │   ├── api-errors.ts        # API error handling
│   │   ├── toast-context.tsx   # Toast notification context
│   │   └── utils.ts             # Helper functions
│   │
│   └── types/                    # TypeScript types
│       ├── anime.ts             # Anime type definitions
│       └── tags.ts              # Tag/genre definitions
│
├── public/                       # Static assets
│   └── assets/logo/             # Brand logos
│
├── .env.example                  # Environment template
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind configuration
├── components.json              # Shadcn UI config
└── package.json                 # Dependencies
```

---

## 🛠️ Tech Stack

### Core Framework
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety
- **[Bun](https://bun.sh)** - Fast JavaScript runtime

### Styling & UI
- **[Tailwind CSS 3](https://tailwindcss.com/)** - Utility-first CSS
- **[Shadcn UI](https://ui.shadcn.com/)** - Component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible primitives
- **[Lucide React](https://lucide.dev/)** - Icon library
- **CSS Variables** - Dynamic theming

### State Management
- **React Context** - Global state (Auth, Toast)
- **Local State** - Component-level state
- **Server Components** - Where applicable

### Integration
- **tRPC Client** - Type-safe backend communication
- **YouTube API** - Trailer embeds
- **Native Share API** - Mobile sharing

---

## 📱 Pages Overview

| Route | Description | Auth | Features |
|-------|-------------|------|----------|
| `/` | Landing page | No | Hero, trending anime |
| `/dashboard` | Main browse page | No | Recommendations, carousels |
| `/search` | Search & filter | No | Advanced filters, grid/list view |
| `/anime/[slug]` | Anime details | No | Full info, trailer, add to list |
| `/mylist` | User's anime list | ✅ | All lists, filter, sort |
| `/achievements` | Achievements | ✅ | All badges, progress |
| `/help` | FAQ/Help center | No | Searchable, categorized |
| `/social/friends` | Friends management | ✅ | Followers, following, mutual |
| `/user/profile` | User profile | ✅ | Stats, achievements, activity |
| `/user/settings` | Account settings | ✅ | Profile, security, privacy, notifications |
| `/users/[username]` | Public profiles | No | View other users |
| `/auth/signin` | Sign in | Guest only | Email/password login |
| `/auth/signup` | Sign up | Guest only | Email/password registration |
| `/auth/forgot-password` | Password reset | Guest only | Request reset email |
| `/privacy` | Privacy policy | No | GDPR information |
| `/terms` | Terms of service | No | Legal terms |

---

## 🎯 Key Features Breakdown

### Dashboard
- Personalized recommendations based on your taste
- Friends watching carousel (see what friends are watching)
- Trending anime
- Recently added anime
- One-click bookmark to "Plan to Watch"
- Dismiss recommendations you're not interested in

### Search Page
- Real-time search with autocomplete
- Filter by:
  - Genre (clickable from anime pages)
  - Year
  - Studio
  - Status
- Sort by: Relevance, Rating, Year
- Grid and list view options
- Clean, modern design

### Anime Detail Page
- Large poster with glass frame
- Quick stats sidebar (rating, year, episodes, studio)
- Add to list with 4 options
- Change list status easily
- Rate anime with interactive stars
- Write reviews (optional)
- Watch trailer in modal
- Share to social media
- Clickable genres (filter search)
- Streaming platform links
- Related seasons and similar anime

### User Settings (4 Tabs)
- **Profile** - Username, bio, profile preview
- **Security** - Password change with strength meter
- **Notifications** - Email, push, content updates, social (grid layout)
- **Privacy** - Profile visibility, data visibility controls

### My List
- Filter by status (all, watching, completed, plan-to-watch, favorite)
- Sort by date added, title, rating
- Track progress (episodes watched)
- Rate and review
- Statistics overview

---

## 🔌 Backend Integration

Requires AnimeSenpai Backend API running.

### API Configuration

```typescript
// Default API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/trpc'
```

### Endpoints Used

**Authentication:**
- `auth.signup`, `auth.signin`, `auth.me`
- `auth.forgotPassword`, `auth.resetPassword`
- `auth.verifyEmail`, `auth.updateProfile`
- `auth.changePassword`

**Anime:**
- `anime.getAll`, `anime.getBySlug`
- `anime.getTrending`, `anime.getGenres`

**User:**
- `user.getMyList`, `user.addToList`, `user.removeFromList`
- `user.rateAnime`, `user.getProfile`, `user.getStats`
- `user.getPreferences`, `user.updatePreferences`

**Social:**
- `social.followUser`, `social.unfollowUser`
- `social.getFollowers`, `social.getFollowing`
- `social.getSocialCounts`, `social.getFriendsWatching`

**Recommendations:**
- `recommendations.getPersonalized`
- `recommendations.dismissRecommendation`

---

## 🎨 Design System

### Colors
```css
/* Primary - Blue */
--primary-400: #00aaff;
--primary-500: #0099ee;
--primary-600: #0088dd;

/* Secondary - Purple */
--secondary-400: #cf5db3;
--secondary-500: #bd4894;
--secondary-600: #ab3a85;

/* Status Colors */
--success-400: #4ade80;
--error-400: #f87171;
--warning-400: #fbbf24;
```

### Glass-morphism
```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Typography
- **Headings:** Bold, white, large sizes (2xl-6xl)
- **Body:** Medium, gray-300, readable line-height
- **Labels:** Small, gray-400/500, uppercase for sections

---

## 🛠️ Development

### Available Scripts

```bash
# Development
bun dev -p 3002           # Start dev server

# Production
bun run build             # Build for production
bun run start             # Start production server

# Quality
bun run lint              # Run linter
bunx tsc --noEmit        # Type checking
```

### Development Workflow

```bash
# Terminal 1: Backend
cd AnimeSenpai-Backend
bun dev

# Terminal 2: Frontend
cd AnimeSenpai-Frontend
bun dev -p 3002

# Terminal 3: Type checking
cd AnimeSenpai-Frontend
bunx tsc --noEmit --watch
```

---

## 🚢 Deployment

### Vercel (Recommended)

**1. Connect Repository**
- Import project to Vercel
- Select `AnimeSenpai-Frontend` as root directory

**2. Configure Build**
```
Framework: Next.js
Build Command: bun run build
Output Directory: .next
Install Command: bun install
```

**3. Set Environment Variables**
```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api/trpc
NODE_ENV=production
```

**4. Deploy!**
```bash
vercel --prod
```

### Other Platforms
- **Netlify** - Next.js support
- **Railway** - One-click deploy
- **Cloudflare Pages** - Edge deployment

---

## ⚡ Performance

### Optimization Features
- **Code Splitting** - Automatic route-based splitting
- **Image Optimization** - Lazy loading, WebP/AVIF
- **Font Optimization** - Google Fonts with display swap
- **Static Generation** - Pre-rendered pages for instant loads
- **Prefetching** - Link prefetching for faster navigation

### Measured Performance
- **Build Time:** 2.2 seconds
- **Page Load:** < 2 seconds
- **FCP:** < 1 second
- **LCP:** < 2.5 seconds
- **Bundle Size:** 780 KB static + 912 KB server

---

## 🧪 Testing Checklist

Before release, test:

- [ ] Sign up and email verification
- [ ] Sign in and remember me
- [ ] Password reset flow
- [ ] Browse dashboard
- [ ] Search with filters
- [ ] View anime details
- [ ] Add to list (all 4 lists)
- [ ] Rate anime
- [ ] Write review
- [ ] Follow users
- [ ] View friend activity
- [ ] Achievement progress
- [ ] Profile settings
- [ ] Privacy controls
- [ ] Notification preferences
- [ ] Mobile responsive (especially iPad)
- [ ] All toast notifications working
- [ ] Trailers playing
- [ ] Sharing working
- [ ] Genre filtering from clickable badges

---

## 🐛 Troubleshooting

### Common Issues

**API Connection Failed**
```bash
# Check backend is running
curl http://localhost:3001/health

# Verify .env.local
cat .env.local | grep NEXT_PUBLIC_API_URL
```

**Build Errors**
```bash
# Clean rebuild
rm -rf .next node_modules bun.lock
bun install
bun run build
```

**Type Errors**
```bash
# Regenerate types
bunx tsc --noEmit
```

**Port Already in Use**
```bash
# Use different port
bun dev -p 3003
```

---

## 🎯 Component Library

### Reusable Components

**Anime Cards:**
- `AnimeCard` - Standard card with variants (featured, grid, list, compact)
- `MyListAnimeCard` - List-specific card with progress
- `SearchAnimeCard` - Search result card with hover effects

**Social:**
- `FollowButton` - Follow/unfollow with loading states
- `FollowList` - Display followers/following
- `FriendsWatching` - Carousel of friends' activity
- `ShareButton` - Universal share button
- `ShareAnimeCard` - Rich share modal

**Achievements:**
- `AchievementBadge` - Single achievement display
- `AchievementsShowcase` - Grid with filtering

**UI Primitives:**
- `Button`, `Badge`, `Card`, `Checkbox`
- `Dropdown`, `Separator`, `Skeleton`
- `Toast` - Notification system
- `BackButton` - Navigation helper

---

## 📚 Useful Commands

```bash
# Development
bun dev -p 3002                    # Start dev server
bun dev -p 3002 --turbo            # Use Turbopack (faster)

# Production
bun run build                      # Build for production
bun run start                      # Start production server

# Code Quality
bunx tsc --noEmit                 # Type check
bun run lint                       # Lint code
bun run lint --fix                 # Auto-fix linting issues

# Analysis
ANALYZE=true bun run build         # Analyze bundle size
bun run build --profile            # Build with profiling
```

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (especially on iPad!)
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push and create a Pull Request

### Code Standards
- ✅ Use TypeScript with proper types
- ✅ Follow existing component patterns
- ✅ Add loading and error states
- ✅ Test on mobile and tablet
- ✅ Use glass-morphism design
- ✅ Add toast notifications for user feedback
- ✅ Handle edge cases gracefully
- ✅ Match brand voice (friendly, clear, welcoming)

### Testing Your Changes
- Test on Chrome, Safari, Firefox
- Test on iPhone, iPad, Android
- Test with slow 3G network
- Test authentication flow
- Test error scenarios

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🔗 Related

- **Backend API:** [AnimeSenpai-Backend](../AnimeSenpai-Backend)
- **Design Assets:** `animesenpai-logo.ai` (Adobe Illustrator source file)

---

<div align="center">

**Built with ❤️ for anime fans worldwide**
*Discover. Track. Connect.*

**Status:** ✅ Production Ready | **Version:** 1.0.0 | **Last Updated:** October 2025

🌟 **Star this repo if you love anime!** 🌟

</div>
