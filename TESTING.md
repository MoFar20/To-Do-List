# Testing Guide

This document explains the testing strategy and how to run tests for the To-Do Liste project

## Overview

We use a **test pyramid** approach:
- **E2E tests (Playwright):** Cover critical user flows end-to-end
- **Integration tests (API):** Test backend endpoints with real HTTP calls
- **Unit tests:** Test pure logic functions in isolation

**Total: 40 tests** (9 API, 22 unit, 9 E2E)

---

## Test Structure

```
test/
├─ api.test.js         # Backend API integration tests
└─ unit.test.js        # Frontend unit tests (pure functions)

e2e/
└─ app.spec.js         # Playwright E2E tests

utils/
└─ helpers.js          # Pure functions extracted for unit testing
```

---

## Running Tests

### All tests
```pwsh
npm run test:all
```

### Backend + Unit tests
```pwsh
npm test
```

### E2E tests
```pwsh
npm run test:e2e
```

### E2E with interactive UI
```pwsh
npm run test:e2e:ui
```

---

## Test Coverage

### Backend (API) - 9 tests
- Health endpoint
- Email validation (format, required fields)
- Code validation (6 digits, numeric)
- CORS headers
- Error handling for missing/invalid params

### Frontend (Unit) - 22 tests
- Task filtering (by title, priority, category, combined)
- Email validation
- Password policy (length, uppercase, lowercase, digit, special char)
- Code expiry logic
- Verification code generation
- Category validation (empty, duplicate)

### E2E (Playwright) - 9 tests
- **Auth flows:**
  - Register → redirect to app
  - Login with registered user
  - Invalid login shows error
- **Password reset:**
  - Full flow: request code → enter code → reset password → login
  - Invalid code rejection
- **Task management:**
  - Create task and display
  - Mark task as done
  - Filter tasks by title
- **Accessibility:**
  - Toggle dark mode (persists after reload)
  - Toggle high-contrast mode

---

## CI/CD

GitHub Actions runs all tests on every push and PR:

**Workflow:** `.github/workflows/test.yml`

**Jobs:**
1. **Backend & Unit Tests** (Node 20, Ubuntu)
   - Install dependencies
   - Run `npm test`

2. **E2E Tests** (Playwright, Chromium)
   - Install Playwright browsers
   - Start backend server
   - Run E2E tests
   - Upload test report artifacts

**Status badge:** ![Tests](https://img.shields.io/badge/tests-passing-brightgreen)

---

## Writing New Tests

### Backend API test
Add to `test/api.test.js`:
```js
test('POST /api/endpoint should do X', async () => {
  const res = await request(server)
    .post('/api/endpoint')
    .send({ data: 'value' });
  
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.success);
});
```

### Unit test
Extract pure logic to `utils/helpers.js`, then test in `test/unit.test.js`:
```js
test('myFunction: should return X when Y', () => {
  const result = myFunction('input');
  assert.strictEqual(result, 'expected');
});
```

### E2E test
Add to `e2e/app.spec.js`:
```js
test('should complete user flow X', async ({ page }) => {
  await page.goto('/auth.html');
  await page.fill('#input', 'value');
  await page.click('button:has-text("Submit")');
  await expect(page).toHaveURL(/success/);
});
```

---

## Best Practices

1. **Keep tests fast:** Use test mode for backend (no real emails), clear localStorage before E2E
2. **Test behavior, not implementation:** Focus on user-facing outcomes
3. **Use unique data:** Generate unique emails with timestamps in E2E tests
4. **Mock external dependencies:** Backend uses stream transport in test mode
5. **Run tests before committing:** `npm run test:all`

---

## Troubleshooting

**Tests fail locally:**
- Ensure backend is not running (tests start their own server)
- Clear localStorage: `localStorage.clear()` in browser console
- Check port 3000 and 5500 are available

**E2E tests fail:**
- Install Playwright browsers: `npx playwright install chromium`
- Ensure Live Server is running on port 5500
- Try with UI: `npm run test:e2e:ui`

**CI tests fail:**
- Check GitHub Actions logs for specific error
- Verify `.env.example` has correct structure
- Ensure all dependencies are in `package.json`

---

## Test Maintenance

- **Update tests when behavior changes** (not just to make them pass)
- **Remove obsolete tests** when features are removed
- **Keep E2E tests minimal** (1-3 per critical flow)
- **Expand unit tests** when adding new pure functions
- **Monitor CI run time** and optimize slow tests

---

## Resources

- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Playwright Docs](https://playwright.dev)
- [Supertest Docs](https://github.com/visionmedia/supertest)
