# AnimeSenpai Testing Guide

## 🧪 Comprehensive Testing Checklist

### Test Environment Setup
- **Frontend URL**: http://localhost:3006 (dev) or https://animesenpai.app (prod)
- **Backend URL**: http://localhost:3003 (dev) or https://api.animesenpai.app (prod)
- **Test Browsers**: Chrome, Firefox, Safari, Edge
- **Test Devices**: Desktop, Mobile (iOS/Android), Tablet (iPad)

---

## 1. Authentication & User Management

### 1.1 Sign Up Flow ✅
- [ ] Navigate to `/auth/signup`
- [ ] Test validation errors:
  - [ ] Empty fields show error messages
  - [ ] Invalid email format shows error
  - [ ] Password too short (<8 chars) shows error
  - [ ] Passwords don't match shows error
- [ ] Create new account with valid data
- [ ] Verify redirect to dashboard or email verification page
- [ ] Check email inbox for verification email
- [ ] Verify email template looks professional

### 1.2 Email Verification ✅
- [ ] Click verification link in email
- [ ] Verify redirect to `/auth/verify-email/[token]`
- [ ] Check success message displayed
- [ ] Verify user can now access protected routes
- [ ] Test expired token (if possible)
- [ ] Test invalid token (modify URL)
- [ ] Test "Resend verification email" button

### 1.3 Sign In Flow ✅
- [ ] Navigate to `/auth/signin`
- [ ] Test validation errors:
  - [ ] Empty email/password shows error
  - [ ] Invalid credentials show error
  - [ ] Account not verified shows message
- [ ] Sign in with valid credentials
- [ ] Verify redirect to dashboard
- [ ] Check "Remember me" functionality
- [ ] Verify session persists after page refresh

### 1.4 Password Reset ✅
- [ ] Navigate to `/auth/forgot-password`
- [ ] Enter email address
- [ ] Check email for reset link
- [ ] Click reset link
- [ ] Navigate to `/auth/reset-password/[token]`
- [ ] Enter new password
- [ ] Verify password updated successfully
- [ ] Sign in with new password
- [ ] Test expired/invalid reset token

### 1.5 Sign Out ✅
- [ ] Click sign out button in navbar
- [ ] Verify redirect to home page
- [ ] Verify session cleared
- [ ] Try accessing protected route → redirect to signin
- [ ] Check localStorage/cookies cleared

---

## 2. Home Page & Navigation

### 2.1 Landing Page ✅
- [ ] Visit home page `/`
- [ ] Verify hero section displays correctly
- [ ] Check all links work (CTA buttons, navigation)
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Verify animations work smoothly
- [ ] Check page load performance (<3s LCP)

### 2.2 Navigation ✅
- [ ] **Guest User** navbar shows:
  - [ ] Logo/Home link
  - [ ] Sign In button
  - [ ] Sign Up button
- [ ] **Authenticated User** navbar shows:
  - [ ] Logo/Home link
  - [ ] Dashboard link
  - [ ] My List link
  - [ ] Search link
  - [ ] Profile dropdown
    - [ ] Profile
    - [ ] Settings
    - [ ] Sign Out
- [ ] **Admin User** navbar shows:
  - [ ] Additional Admin link
- [ ] Test mobile hamburger menu
- [ ] Test all navigation links

### 2.3 Footer ✅
- [ ] Privacy Policy link works
- [ ] Terms of Service link works
- [ ] Social media links work (if added)
- [ ] Copyright year is current

---

## 3. Dashboard

### 3.1 Dashboard Page ✅
- [ ] Navigate to `/dashboard` (requires auth)
- [ ] Verify stats cards display:
  - [ ] Total anime count
  - [ ] Watching count
  - [ ] Completed count  
  - [ ] Plan to watch count
- [ ] Check "Continue Watching" section
- [ ] Check "Recommended for You" section
- [ ] Check "Popular This Season" section
- [ ] Test season grouping displays correctly
- [ ] Verify anime cards are clickable
- [ ] Test loading states
- [ ] Test empty states (new user)
- [ ] Test error states (disconnect network)

---

## 4. My List

### 4.1 My List Page ✅
- [ ] Navigate to `/mylist` (requires auth)
- [ ] Verify category filter buttons work:
  - [ ] All
  - [ ] Favorites (test favorite functionality)
  - [ ] Watching
  - [ ] Completed
  - [ ] Plan to Watch
- [ ] Check correct counts display
- [ ] Test search functionality:
  - [ ] Search by English title
  - [ ] Search by Japanese title
  - [ ] Search by studio
- [ ] Test sort options:
  - [ ] Recent (default)
  - [ ] Title (A-Z)
  - [ ] Rating (high to low)
  - [ ] Year (newest first)
  - [ ] Episodes (most first)
- [ ] Test view toggle:
  - [ ] Grid view
  - [ ] List view
- [ ] Test favorite star button:
  - [ ] Click to add favorite
  - [ ] Click again to remove
  - [ ] Verify favorite count updates
  - [ ] Check persists after refresh
- [ ] Verify season grouping works:
  - [ ] Multi-season series show "X Seasons" badge
  - [ ] Total episode count shows correctly
  - [ ] Season info expands on hover/click
- [ ] Test loading state (skeleton)
- [ ] Test empty state (new user)
- [ ] Verify responsive design

### 4.2 Add to List Flow ✅
- [ ] Go to any anime detail page
- [ ] Click "Add to List" button
- [ ] Select status (Watching/Completed/etc.)
- [ ] Verify anime appears in My List
- [ ] Change status in My List
- [ ] Verify status updates
- [ ] Remove from list
- [ ] Verify removal

---

## 5. Search & Discovery

### 5.1 Search Page ✅
- [ ] Navigate to `/search`
- [ ] Test search input:
  - [ ] Type anime title
  - [ ] Verify results update in real-time
  - [ ] Check debouncing (no excessive API calls)
- [ ] Test filters:
  - [ ] Genre filter
  - [ ] Year filter
  - [ ] Type filter (TV/Movie/OVA/etc.)
  - [ ] Status filter (Airing/Finished)
  - [ ] Rating filter
- [ ] Test multiple filters combined
- [ ] Test "Clear filters" button
- [ ] Verify season grouping in results
- [ ] Test view toggle (grid/list)
- [ ] Verify pagination or infinite scroll
- [ ] Test loading states
- [ ] Test "no results" state
- [ ] Check responsive design

---

## 6. Anime Detail Page

### 6.1 Anime Page ✅
- [ ] Navigate to `/anime/[slug]`
- [ ] Verify all anime info displays:
  - [ ] Cover image
  - [ ] Title (English & Japanese)
  - [ ] Synopsis
  - [ ] Rating
  - [ ] Genres/Tags
  - [ ] Studio
  - [ ] Year/Season
  - [ ] Episode count
  - [ ] Status
  - [ ] Duration
- [ ] Test "Add to List" button (if not in list)
- [ ] Test "Update Status" button (if in list)
- [ ] Test favorite button
- [ ] Verify "Related Anime" section
- [ ] Check "More from [Studio]" section
- [ ] Test trailer player (if available)
- [ ] Verify SEO meta tags (view page source)
- [ ] Test social share buttons
- [ ] Check responsive design

---

## 7. User Profile & Settings

### 7.1 Profile Page ✅
- [ ] Navigate to `/user/profile`
- [ ] Verify user info displays:
  - [ ] Username
  - [ ] Email
  - [ ] Join date
  - [ ] Avatar (if set)
  - [ ] Bio (if set)
- [ ] Check stats display:
  - [ ] Total anime
  - [ ] Episodes watched
  - [ ] Days watched
  - [ ] Mean score
- [ ] Test edit profile button
- [ ] Verify profile is viewable by others at `/users/[username]`

### 7.2 Settings Page ✅
- [ ] Navigate to `/user/settings`
- [ ] Test profile settings:
  - [ ] Update username
  - [ ] Update email
  - [ ] Upload avatar
  - [ ] Update bio
- [ ] Test password change:
  - [ ] Enter current password
  - [ ] Enter new password
  - [ ] Verify password updated
- [ ] Test notification preferences:
  - [ ] Email notifications toggle
  - [ ] Push notifications toggle (if implemented)
- [ ] Test privacy settings:
  - [ ] Make profile private/public
- [ ] Test theme settings:
  - [ ] Dark mode (default)
  - [ ] Light mode (if available)
- [ ] Verify all changes save correctly
- [ ] Test "Delete Account" (carefully!)

---

## 8. Admin Panel (Admin Users Only)

### 8.1 Admin Dashboard ✅
- [ ] Sign in as admin user
- [ ] Navigate to `/admin`
- [ ] Verify admin access granted (non-admin redirect)
- [ ] Check dashboard tab displays:
  - [ ] Total users count
  - [ ] Total anime count
  - [ ] Recent signups
  - [ ] Popular anime
  - [ ] System health metrics

### 8.2 Users Management ✅
- [ ] Click "Users" tab
- [ ] Verify user list displays
- [ ] Test search by username/email
- [ ] Test filters:
  - [ ] Role (User/Admin)
  - [ ] Status (Active/Banned)
  - [ ] Email verified
- [ ] Test pagination
- [ ] Test user actions:
  - [ ] View user details
  - [ ] Change user role
  - [ ] Ban/unban user
  - [ ] Delete user (with confirmation)
- [ ] Verify changes persist

### 8.3 Anime Management ✅
- [ ] Click "Anime" tab
- [ ] Verify anime list displays
- [ ] Test search functionality
- [ ] Test edit anime:
  - [ ] Update title
  - [ ] Update synopsis
  - [ ] Update rating
  - [ ] Update genres/tags
  - [ ] Update cover image URL
- [ ] Test delete anime (with confirmation)
- [ ] Test add new anime (if implemented)
- [ ] Verify changes update in frontend

### 8.4 Settings Tab ✅
- [ ] Click "Settings" tab
- [ ] Test site settings:
  - [ ] Update site name
  - [ ] Update maintenance mode
  - [ ] Update feature flags
- [ ] Verify settings save correctly
- [ ] Test maintenance mode (site shows maintenance page)

---

## 9. Performance Testing

### 9.1 Load Times ✅
- [ ] Home page loads < 2s
- [ ] Dashboard loads < 3s
- [ ] Search results load < 2s
- [ ] Anime detail page loads < 2s
- [ ] Images load progressively (blur-up effect)

### 9.2 Lighthouse Audit ✅
Run Lighthouse in Chrome DevTools on key pages:
- [ ] Home page scores:
  - [ ] Performance: 90+
  - [ ] Accessibility: 90+
  - [ ] Best Practices: 90+
  - [ ] SEO: 95+
- [ ] Dashboard page scores: same targets
- [ ] Mobile scores: 80+ (more lenient)

### 9.3 Network Conditions ✅
Test on different network speeds:
- [ ] Fast 3G
- [ ] Slow 3G
- [ ] Offline (service worker if implemented)

---

## 10. Mobile & Responsive Testing

### 10.1 Mobile Devices ✅
Test on actual devices or emulators:
- [ ] iPhone (iOS Safari)
  - [ ] Test all user flows
  - [ ] Check safe area (notch)
  - [ ] Test gestures
- [ ] Android (Chrome)
  - [ ] Test all user flows
  - [ ] Check navigation
  - [ ] Test touch targets (min 44px)

### 10.2 Tablet ✅
- [ ] iPad (Safari)
  - [ ] Test landscape orientation
  - [ ] Test portrait orientation
  - [ ] Verify layout utilizes screen space
  - [ ] Test split screen (if supported)

### 10.3 Responsive Breakpoints ✅
Test at specific widths:
- [ ] Mobile: 375px, 414px
- [ ] Tablet: 768px, 1024px
- [ ] Desktop: 1280px, 1440px, 1920px
- [ ] Ultra-wide: 2560px+

---

## 11. Browser Compatibility

### 11.1 Desktop Browsers ✅
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Brave (if used by target audience)

### 11.2 Mobile Browsers ✅
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Firefox Mobile
- [ ] Samsung Internet

---

## 12. Security Testing

### 12.1 Authentication Security ✅
- [ ] Try accessing `/dashboard` while logged out → redirects to signin
- [ ] Try accessing `/admin` as regular user → access denied
- [ ] Test XSS in input fields (sanitization)
- [ ] Test SQL injection in search (Prisma protects)
- [ ] Verify HTTPS enforced (production)
- [ ] Check CORS headers (only allowed origins)
- [ ] Test rate limiting on API (100 req/min)

### 12.2 Data Security ✅
- [ ] Passwords hashed (check network tab - never plaintext)
- [ ] Tokens stored securely (httpOnly cookies if used)
- [ ] Sensitive data not in localStorage
- [ ] API keys not exposed in client code

---

## 13. Error Handling

### 13.1 User Errors ✅
- [ ] Invalid login shows helpful message
- [ ] Form validation shows specific errors
- [ ] 404 page displays for invalid routes
- [ ] Network errors show retry option

### 13.2 Server Errors ✅
- [ ] 500 errors show user-friendly message
- [ ] Database errors handled gracefully
- [ ] API timeouts handled
- [ ] Errors logged for debugging

---

## 14. SEO & Social Sharing

### 14.1 Meta Tags ✅
- [ ] View page source of key pages
- [ ] Verify title tags unique and descriptive
- [ ] Verify meta descriptions present
- [ ] Verify OpenGraph tags present:
  - [ ] og:title
  - [ ] og:description
  - [ ] og:image (1200x630)
  - [ ] og:url
- [ ] Verify Twitter Card tags present

### 14.2 Social Sharing ✅
- [ ] Share anime page on Twitter → preview looks good
- [ ] Share on Facebook → preview looks good
- [ ] Share on Discord → embed looks good
- [ ] Share on WhatsApp → preview appears

### 14.3 Search Engines ✅
- [ ] Verify robots.txt at `/robots.txt`
- [ ] Verify sitemap.xml at `/sitemap.xml`
- [ ] Check sitemap includes all pages
- [ ] Verify canonical URLs set correctly

---

## 15. PWA & Offline

### 15.1 PWA Installation ✅
- [ ] Install prompt appears (mobile)
- [ ] Install app to home screen
- [ ] App opens in standalone mode
- [ ] App icon displays correctly
- [ ] Splash screen shows (if configured)

### 15.2 Offline Support ✅
- [ ] Service worker registered (check DevTools)
- [ ] Static assets cached
- [ ] Offline page shows when disconnected
- [ ] Previously viewed pages work offline

---

## 16. Accessibility (a11y)

### 16.1 Keyboard Navigation ✅
- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Focus indicators visible
- [ ] Skip to main content link works

### 16.2 Screen Readers ✅
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with NVDA (Windows)
- [ ] All images have alt text
- [ ] Form labels associated correctly
- [ ] ARIA labels on icon buttons
- [ ] Headings in logical order (h1→h2→h3)

### 16.3 Color & Contrast ✅
- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] Error messages not color-only
- [ ] Focus states clearly visible
- [ ] Test with color blindness simulator

---

## 17. Edge Cases & Stress Testing

### 17.1 Data Edge Cases ✅
- [ ] Very long anime titles (truncation)
- [ ] Missing cover images (fallback)
- [ ] Empty lists (empty states)
- [ ] Lists with 1000+ items (performance)
- [ ] Unicode/emoji in usernames
- [ ] Special characters in search

### 17.2 User Behavior ✅
- [ ] Rapid clicking (button disabled on submit)
- [ ] Multiple browser tabs (sync state)
- [ ] Session timeout (redirect to login)
- [ ] Concurrent updates (last-write-wins)

---

## 🐛 Bug Reporting Template

When you find a bug, report it with:

```markdown
**Bug Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Go to [page]
2. Click on [element]
3. Observe [issue]

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What actually happens]

**Screenshots**: [If applicable]

**Environment**:
- Browser: [Chrome 120]
- Device: [iPhone 14]
- OS: [iOS 17]
- URL: [https://animesenpai.app/...]

**Console Errors**: [If any]

**Additional Context**: [Any other relevant info]
```

---

## ✅ Sign-Off Checklist

Before approving for production:

### Critical Paths Working ✅
- [ ] Users can sign up
- [ ] Users can sign in
- [ ] Users can add anime to list
- [ ] Users can search for anime
- [ ] Users can view anime details
- [ ] Admin can manage users
- [ ] Admin can manage anime

### Performance Acceptable ✅
- [ ] Lighthouse scores meet targets
- [ ] Pages load quickly
- [ ] No major console errors
- [ ] No memory leaks

### Security Verified ✅
- [ ] No vulnerabilities (npm audit)
- [ ] Authentication secure
- [ ] Authorization enforced
- [ ] Data sanitized

### Ready for Users ✅
- [ ] All critical bugs fixed
- [ ] Error handling in place
- [ ] Help/documentation available
- [ ] Support channel ready

---

**Tester Signature**: _________________  
**Date**: _________________  
**Status**: ☐ Pass ☐ Fail ☐ Pass with Notes

**Notes**:
```
[Add any notes, concerns, or observations here]
```

---

**Last Updated**: October 13, 2024  
**Version**: 1.0.0

