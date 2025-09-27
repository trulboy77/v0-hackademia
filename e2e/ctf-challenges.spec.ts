import { test, expect } from "@playwright/test"

test.describe("CTF Challenges", () => {
  test.beforeEach(async ({ page }) => {
    // Login as user
    await page.goto("/login")
    await page.fill('[data-testid="email-input"]', "user@example.com")
    await page.fill('[data-testid="password-input"]', "password123")
    await page.click('[data-testid="login-button"]')
    await page.waitForURL("/desktop")
  })

  test("user can view and attempt challenges", async ({ page }) => {
    // Open CTF app
    await page.click('[data-testid="ctf-challenges-icon"]')
    await expect(page.locator('[data-testid="ctf-window"]')).toBeVisible()

    // View challenge list
    await expect(page.locator('[data-testid="challenge-card"]').first()).toBeVisible()

    // Click on a challenge
    await page.click('[data-testid="challenge-card"]')
    await expect(page.locator('[data-testid="challenge-details"]')).toBeVisible()

    // Submit flag
    await page.fill('[data-testid="flag-input"]', "flag{test}")
    await page.click('[data-testid="submit-flag-button"]')

    // Should show result
    await expect(page.locator('[data-testid="submission-result"]')).toBeVisible()
  })
})
