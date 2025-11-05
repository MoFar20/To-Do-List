import { test, expect } from '@playwright/test';

// Helper to generate unique emails per test run
const timestamp = Date.now();
const getUniqueEmail = (prefix = 'test') => `${prefix}+${timestamp}@example.com`;

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/auth.html');
    await page.evaluate(() => localStorage.clear());
  });

  test('should register a new user and redirect to app', async ({ page }) => {
    await page.goto('/auth.html');
    
    // Click Register tab
    await page.click('#tab-register');
    
    // Fill registration form
    const email = getUniqueEmail('register');
    await page.fill('#regName', 'Test User');
    await page.fill('#regEmail', email);
    await page.fill('#regPassword', 'TestPass123!');
    
    // Submit
    await page.click('button[type="submit"]:has-text("Registrieren")');
    
    // Should redirect to index.html
    await expect(page).toHaveURL(/index\.html/);
    
    // Should see user info button
    await expect(page.locator('#userInfoBtn')).toBeVisible();
  });

  test('should login with registered user', async ({ page }) => {
    await page.goto('/auth.html');
    
    // First register
    await page.click('#tab-register');
    const email = getUniqueEmail('login');
    await page.fill('#regName', 'Login User');
    await page.fill('#regEmail', email);
    await page.fill('#regPassword', 'LoginPass123!');
    await page.click('button[type="submit"]:has-text("Registrieren")');
    
    // Wait for redirect
    await expect(page).toHaveURL(/index\.html/);
    
    // Logout
    await page.click('#logoutBtn');
    await page.click('button:has-text("Ja, abmelden")');
    
    // Should be back at auth
    await expect(page).toHaveURL(/auth\.html/);
    
    // Now login
    await page.fill('#loginEmail', email);
    await page.fill('#loginPassword', 'LoginPass123!');
    await page.click('button[type="submit"]:has-text("Anmelden")');
    
    // Should redirect to app
    await expect(page).toHaveURL(/index\.html/);
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/auth.html');
    
    await page.fill('#loginEmail', 'nonexistent@example.com');
    await page.fill('#loginPassword', 'WrongPass123!');
    await page.click('button[type="submit"]:has-text("Anmelden")');
    
    // Should show error
    await expect(page.locator('#loginError')).toContainText('falsch');
  });
});

test.describe('Forgot Password Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth.html');
    await page.evaluate(() => localStorage.clear());
  });

  test('should complete forgot password flow with mock email', async ({ page }) => {
    // Register a user first
    await page.click('#tab-register');
    const email = getUniqueEmail('forgot');
    await page.fill('#regName', 'Forgot User');
    await page.fill('#regEmail', email);
    await page.fill('#regPassword', 'OldPass123!');
    await page.click('button[type="submit"]:has-text("Registrieren")');
    
    await expect(page).toHaveURL(/index\.html/);
    
    // Logout
    await page.click('#logoutBtn');
    await page.click('button:has-text("Ja, abmelden")');
    
    // Go to forgot password
    await page.click('#forgotPasswordBtn');
    
    // Fill email
    await page.fill('#forgotEmail', email);
    await page.click('button[type="submit"]:has-text("Zurücksetzen")');
    
    // Wait for success message
    await expect(page.locator('#forgotSuccess')).toContainText('gesendet');
    
    // Code modal should appear
    await expect(page.locator('#codeModal')).toHaveClass(/show/);
    
    // Get the code from localStorage (simulating email)
    const resetData = await page.evaluate(() => {
      const data = localStorage.getItem('passwordReset');
      return JSON.parse(data);
    });
    
    // Enter code
    await page.fill('#verificationCodeInput', resetData.code);
    await page.click('#codeConfirm');
    
    // Should show reset password form
    await expect(page.locator('#panel-reset')).toBeVisible();
    
    // Enter new password
    await page.fill('#resetPassword', 'NewPass123!');
    await page.fill('#resetPasswordConfirm', 'NewPass123!');
    await page.click('button[type="submit"]:has-text("Passwort speichern")');
    
    // Info modal should appear
    await expect(page.locator('#infoModal')).toHaveClass(/show/);
    await page.click('#infoOk');
    
    // Should be back at login
    await expect(page.locator('#panel-login')).toBeVisible();
    
    // Login with new password
    await page.fill('#loginEmail', email);
    await page.fill('#loginPassword', 'NewPass123!');
    await page.click('button[type="submit"]:has-text("Anmelden")');
    
    await expect(page).toHaveURL(/index\.html/);
  });

  test('should reject invalid verification code', async ({ page }) => {
    // Register
    await page.click('#tab-register');
    const email = getUniqueEmail('invalidcode');
    await page.fill('#regName', 'Invalid Code User');
    await page.fill('#regEmail', email);
    await page.fill('#regPassword', 'Pass123!');
    await page.click('button[type="submit"]:has-text("Registrieren")');
    
    await expect(page).toHaveURL(/index\.html/);
    await page.click('#logoutBtn');
    await page.click('button:has-text("Ja, abmelden")');
    
    // Request reset
    await page.click('#forgotPasswordBtn');
    await page.fill('#forgotEmail', email);
    await page.click('button[type="submit"]:has-text("Zurücksetzen")');
    
    // Enter wrong code
    await page.fill('#verificationCodeInput', '999999');
    await page.click('#codeConfirm');
    
    // Should show error
    await expect(page.locator('#forgotError')).toContainText('Ungültiger');
  });
});

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth.html');
    await page.evaluate(() => localStorage.clear());
    
    // Register and login
    await page.click('#tab-register');
    const email = getUniqueEmail('tasks');
    await page.fill('#regName', 'Task User');
    await page.fill('#regEmail', email);
    await page.fill('#regPassword', 'TaskPass123!');
    await page.click('button[type="submit"]:has-text("Registrieren")');
    
    await expect(page).toHaveURL(/index\.html/);
  });

  test('should create and display a task', async ({ page }) => {
    // Fill task form
    await page.fill('#taskTitle', 'Test Task');
    await page.fill('#taskDesc', 'This is a test task description');
    await page.selectOption('#taskPriority', 'Hoch');
    
    // Submit
    await page.click('button[type="submit"]:has-text("Hinzufügen")');
    
    // Task should appear in list - check title separately
    await expect(page.locator('#taskList li .task-name')).toContainText('Test Task');
    // Description is in a textarea, check it separately
    await expect(page.locator('#taskList li textarea.desc')).toHaveValue('This is a test task description');
    // Priority class is in German: 'priority-hoch' not 'priority-high'
    await expect(page.locator('#taskList li .priority-hoch')).toBeVisible();
  });

  test('should mark task as done', async ({ page }) => {
    // Create task
    await page.fill('#taskTitle', 'Mark Done Task');
    await page.click('button[type="submit"]:has-text("Hinzufügen")');
    
    // Click mark button
    await page.click('#taskList li button:has-text("Markieren")');
    
    // Should show as done
    await expect(page.locator('#taskList li')).toHaveClass(/done/);
    await expect(page.locator('#taskList li button:has-text("Erledigt")')).toBeVisible();
  });

  test('should filter tasks by title', async ({ page }) => {
    // Create multiple tasks
    await page.fill('#taskTitle', 'Buy groceries');
    await page.click('button[type="submit"]:has-text("Hinzufügen")');
    
    await page.fill('#taskTitle', 'Write report');
    await page.click('button[type="submit"]:has-text("Hinzufügen")');
    
    // Filter by title
    await page.fill('#titleFilter', 'buy');
    
    // Should show only matching task
    await expect(page.locator('#taskList li')).toHaveCount(1);
    await expect(page.locator('#taskList li')).toContainText('Buy groceries');
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth.html');
  });

  test('should toggle dark mode', async ({ page }) => {
    // Open accessibility modal
    await page.click('#accessibilityBtn');
    await expect(page.locator('#accessibilityModal')).toHaveClass(/show/);
    
    // Click dark mode
    await page.click('button[data-mode="dark"]');
    
    // Body should have 'dark' class (not 'dark-mode')
    await expect(page.locator('body')).toHaveClass(/\bdark\b/);
    
    // Should persist after reload
    await page.reload();
    await expect(page.locator('body')).toHaveClass(/\bdark\b/);
  });

  test('should toggle high-contrast mode', async ({ page }) => {
    await page.click('#accessibilityBtn');
    await page.click('button[data-mode="high-contrast"]');
    
    await expect(page.locator('body')).toHaveClass(/high-contrast/);
  });
});
