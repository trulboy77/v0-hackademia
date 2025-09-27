import { test, expect } from "@playwright/test"

test.describe("Authentication Flow", () => {
  test("user can sign up and login", async ({ page }) => {
    // Navigate to signup
    await page.goto("/signup")

    // Fill signup form
    await page.fill('[data-testid="email-input"]', "test@example.com")
    await page.fill('[data-testid="password-input"]', "password123")
    await page.click('[data-testid="signup-button"]')

    // Should redirect to login or dashboard
    await expect(page).toHaveURL(/\/(login|desktop)/)

    // If redirected to login, complete login flow
    if (page.url().includes("/login")) {
      await page.fill('[data-testid="email-input"]', "test@example.com")
      await page.fill('[data-testid="password-input"]', "password123")
      await page.click('[data-testid="login-button"]')
    }

    // Should be on desktop
    await expect(page).toHaveURL("/desktop")
    await expect(page.locator('[data-testid="desktop-interface"]')).toBeVisible()
  })

  test("displays error for invalid credentials", async ({ page }) => {
    await page.goto("/login")

    await page.fill('[data-testid="email-input"]', "invalid@example.com")
    await page.fill('[data-testid="password-input"]', "wrongpassword")
    await page.click('[data-testid="login-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })
})
