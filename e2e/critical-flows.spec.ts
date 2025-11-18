import { test, expect } from '@playwright/test'

test.describe('Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/')
  })

  test.describe('Authentication Flow', () => {
    test('should allow user to sign up', async ({ page }) => {
      // Navigate to sign up page
      await page.click('text=Sign Up')
      
      // Fill in sign up form
      await page.fill('input[name="email"]', `test${Date.now()}@example.com`)
      await page.fill('input[name="username"]', `testuser${Date.now()}`)
      await page.fill('input[name="password"]', 'TestPassword123!')
      await page.fill('input[name="confirmPassword"]', 'TestPassword123!')
      
      // Accept GDPR consent
      await page.check('input[name="gdprConsent"]')
      await page.check('input[name="dataProcessingConsent"]')
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Should redirect to home or dashboard
      await expect(page).toHaveURL(/\/$|\/dashboard/)
    })

    test('should allow user to sign in', async ({ page }) => {
      // Navigate to sign in page
      await page.click('text=Sign In')
      
      // Fill in sign in form
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="password"]', 'TestPassword123!')
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Should redirect to dashboard or home
      await expect(page).toHaveURL(/\/$|\/dashboard/)
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.click('text=Sign In')
      await page.fill('input[name="email"]', 'invalid@example.com')
      await page.fill('input[name="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      
      // Should show error message
      await expect(page.locator('text=/invalid|error|incorrect/i')).toBeVisible()
    })
  })

  test.describe('Anime Discovery Flow', () => {
    test('should browse anime list', async ({ page }) => {
      // Navigate to anime list
      await page.click('text=Anime')
      await page.click('text=Browse')
      
      // Should see anime list
      await expect(page.locator('[data-testid="anime-list"]')).toBeVisible()
    })

    test('should search for anime', async ({ page }) => {
      // Use search functionality
      const searchInput = page.locator('input[placeholder*="Search"]')
      await searchInput.fill('Attack on Titan')
      await searchInput.press('Enter')
      
      // Should see search results
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
      await expect(page.locator('text=Attack on Titan')).toBeVisible()
    })

    test('should view anime details', async ({ page }) => {
      // Navigate to anime list
      await page.click('text=Anime')
      
      // Click on first anime
      const firstAnime = page.locator('[data-testid="anime-card"]').first()
      await firstAnime.click()
      
      // Should see anime details page
      await expect(page).toHaveURL(/\/anime\/[^\/]+/)
      await expect(page.locator('[data-testid="anime-details"]')).toBeVisible()
    })
  })

  test.describe('Anime Rating Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in first
      await page.click('text=Sign In')
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="password"]', 'TestPassword123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/$|\/dashboard/)
    })

    test('should add anime to watch list', async ({ page }) => {
      // Navigate to anime details
      await page.goto('/anime/attack-on-titan')
      
      // Add to watch list
      await page.click('button:has-text("Add to List")')
      await page.click('text=Plan to Watch')
      
      // Should show success message or update UI
      await expect(page.locator('text=/added|saved/i')).toBeVisible()
    })

    test('should rate anime', async ({ page }) => {
      await page.goto('/anime/attack-on-titan')
      
      // Click rating button
      await page.click('button:has-text("Rate")')
      
      // Select rating (e.g., 8 stars)
      await page.click('[data-rating="8"]')
      
      // Submit rating
      await page.click('button:has-text("Submit")')
      
      // Should show rating confirmation
      await expect(page.locator('text=/rated|saved/i')).toBeVisible()
    })
  })

  test.describe('Recommendations Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in first
      await page.click('text=Sign In')
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="password"]', 'TestPassword123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/$|\/dashboard/)
    })

    test('should view recommendations', async ({ page }) => {
      // Navigate to recommendations
      await page.click('text=Recommendations')
      
      // Should see recommendations section
      await expect(page.locator('[data-testid="recommendations"]')).toBeVisible()
    })

    test('should interact with recommendation feedback', async ({ page }) => {
      await page.goto('/recommendations')
      
      // Dismiss a recommendation
      const firstRecommendation = page.locator('[data-testid="recommendation-card"]').first()
      await firstRecommendation.hover()
      await firstRecommendation.locator('button:has-text("Dismiss")').click()
      
      // Should remove from view
      await expect(firstRecommendation).not.toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Check mobile menu
      await page.click('button[aria-label="Menu"]')
      await expect(page.locator('nav[aria-label="Mobile menu"]')).toBeVisible()
    })

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      
      // Should see responsive layout
      await expect(page.locator('main')).toBeVisible()
    })
  })
})

