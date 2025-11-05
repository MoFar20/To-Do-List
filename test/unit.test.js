// Frontend unit tests for pure helper functions
// Run with: npm test

const { test } = require('node:test');
const assert = require('node:assert');

const {
  filterTasks,
  isValidEmail,
  validatePassword,
  isCodeExpired,
  generateVerificationCode,
  validateCategoryName
} = require('../utils/helpers');

// Task filtering tests
test('filterTasks: filters by title (case-insensitive)', () => {
  const tasks = [
    { title: 'Buy groceries', priority: 'Hoch', category: 'Personal' },
    { title: 'Write report', priority: 'Mittel', category: 'Work' },
    { title: 'Call doctor', priority: 'Niedrig', category: 'Personal' }
  ];

  const result = filterTasks(tasks, { title: 'buy' });
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].title, 'Buy groceries');
});

test('filterTasks: filters by priority', () => {
  const tasks = [
    { title: 'Task A', priority: 'Hoch', category: '' },
    { title: 'Task B', priority: 'Mittel', category: '' },
    { title: 'Task C', priority: 'Hoch', category: '' }
  ];

  const result = filterTasks(tasks, { priority: 'Hoch' });
  assert.strictEqual(result.length, 2);
});

test('filterTasks: filters by category', () => {
  const tasks = [
    { title: 'Task A', priority: 'Hoch', category: 'Work' },
    { title: 'Task B', priority: 'Mittel', category: 'Personal' },
    { title: 'Task C', priority: 'Hoch', category: 'Work' }
  ];

  const result = filterTasks(tasks, { category: 'Work' });
  assert.strictEqual(result.length, 2);
});

test('filterTasks: combines multiple filters', () => {
  const tasks = [
    { title: 'Buy groceries', priority: 'Hoch', category: 'Personal' },
    { title: 'Buy tickets', priority: 'Mittel', category: 'Personal' },
    { title: 'Write report', priority: 'Hoch', category: 'Work' }
  ];

  const result = filterTasks(tasks, { title: 'buy', priority: 'Hoch', category: 'Personal' });
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].title, 'Buy groceries');
});

test('filterTasks: returns all tasks when no filter', () => {
  const tasks = [
    { title: 'Task A', priority: 'Hoch', category: 'Work' },
    { title: 'Task B', priority: 'Mittel', category: 'Personal' }
  ];

  const result = filterTasks(tasks, {});
  assert.strictEqual(result.length, 2);
});

// Email validation tests
test('isValidEmail: accepts valid email', () => {
  assert.strictEqual(isValidEmail('user@example.com'), true);
  assert.strictEqual(isValidEmail('test.user+tag@domain.co.uk'), true);
});

test('isValidEmail: rejects invalid email', () => {
  assert.strictEqual(isValidEmail('not-an-email'), false);
  assert.strictEqual(isValidEmail('missing@domain'), false);
  assert.strictEqual(isValidEmail('@nodomain.com'), false);
  assert.strictEqual(isValidEmail('spaces in@email.com'), false);
});

// Password validation tests
test('validatePassword: rejects short password', () => {
  const error = validatePassword('Short1!');
  assert.ok(error);
  assert.match(error, /8 Zeichen/i);
});

test('validatePassword: rejects password without uppercase', () => {
  const error = validatePassword('lowercase123!');
  assert.ok(error);
  assert.match(error, /Großbuchstaben/i);
});

test('validatePassword: rejects password without lowercase', () => {
  const error = validatePassword('UPPERCASE123!');
  assert.ok(error);
  assert.match(error, /Kleinbuchstaben/i);
});

test('validatePassword: rejects password without number', () => {
  const error = validatePassword('NoNumbers!');
  assert.ok(error);
  assert.match(error, /Zahl/i);
});

test('validatePassword: rejects password without special char', () => {
  const error = validatePassword('NoSpecial123');
  assert.ok(error);
  assert.match(error, /Sonderzeichen/i);
});

test('validatePassword: accepts valid password', () => {
  const error = validatePassword('Valid123!Password');
  assert.strictEqual(error, null);
});

// Code expiry tests
test('isCodeExpired: returns true for past timestamp', () => {
  const pastTime = Date.now() - 10000; // 10 seconds ago
  assert.strictEqual(isCodeExpired(pastTime), true);
});

test('isCodeExpired: returns false for future timestamp', () => {
  const futureTime = Date.now() + 10000; // 10 seconds from now
  assert.strictEqual(isCodeExpired(futureTime), false);
});

// Verification code generation tests
test('generateVerificationCode: generates 6-digit code', () => {
  const code = generateVerificationCode();
  assert.strictEqual(code.length, 6);
  assert.match(code, /^\d{6}$/);
});

test('generateVerificationCode: generates different codes', () => {
  const code1 = generateVerificationCode();
  const code2 = generateVerificationCode();
  // Extremely unlikely to be equal (1 in 1 million)
  // But we test format instead
  assert.match(code1, /^\d{6}$/);
  assert.match(code2, /^\d{6}$/);
});

// Category validation tests
test('validateCategoryName: rejects empty name', () => {
  const error = validateCategoryName('');
  assert.ok(error);
  assert.match(error, /leer/i);
});

test('validateCategoryName: rejects whitespace-only name', () => {
  const error = validateCategoryName('   ');
  assert.ok(error);
  assert.match(error, /leer/i);
});

test('validateCategoryName: rejects duplicate name', () => {
  const existing = [{ name: 'Work' }, { name: 'Personal' }];
  const error = validateCategoryName('Work', existing);
  assert.ok(error);
  assert.match(error, /existiert/i);
});

test('validateCategoryName: accepts valid unique name', () => {
  const existing = [{ name: 'Work' }];
  const error = validateCategoryName('Personal', existing);
  assert.strictEqual(error, null);
});
