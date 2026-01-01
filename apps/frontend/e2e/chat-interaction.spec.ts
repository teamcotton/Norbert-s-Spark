import { expect, test } from '@playwright/test'

test.describe('Chat Interaction', () => {
  test('should navigate to chat page and verify form is disabled for new chat', async ({
    context,
    page,
  }) => {
    // Clear cookies and storage for clean state
    await context.clearCookies()

    // Navigate to sign in page
    await page.goto('/signin')

    // Sign in as admin user
    const emailField = page.getByLabel(/email address/i)
    const passwordField = page.getByLabel(/^password/i)
    const submitButton = page.getByRole('button', { name: /^sign in$/i })

    await emailField.fill('james.smith@gmail.com')
    await passwordField.fill('Admin123!')
    await submitButton.click()

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })

    // Click on chat navigation element
    const chatButton = page.getByTestId('chat')
    await expect(chatButton).toBeVisible()
    await chatButton.click()

    // Verify navigation to /ai page
    await expect(page).toHaveURL('/ai', { timeout: 10000 })

    // Verify form elements are disabled - use simple selectors
    const textInput = page.getByPlaceholder('Type your message...')
    await expect(textInput).toBeVisible()
    await expect(textInput).toBeDisabled()

    // Verify submit button is disabled (IconButton with type="submit")
    const submitBtn = page.locator('button[type="submit"]')
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeDisabled()

    // Verify file upload button is disabled
    const fileUploadButton = page.getByTestId('file-upload-button')
    await expect(fileUploadButton).toBeDisabled()
  })
})
