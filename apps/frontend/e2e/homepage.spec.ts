import { expect, test } from '@playwright/test'

test('homepage has title and heading', async ({ page }) => {
  await page.goto('/')

  // Expect the page to have the correct title
  await expect(page).toHaveTitle(/Norbert's Spark/)

  // Expect to see the main heading
  await expect(page.locator('h1')).toContainText("Norbert's Spark")
})

test('homepage redirects to signin page', async ({ page }) => {
  await page.goto('/')

  // Wait for navigation to complete
  await page.waitForURL('**/signin')

  // Verify we're on the signin page
  await expect(page).toHaveURL(/.*\/signin/)
})
