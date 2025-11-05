// API tests using Node's built-in test runner and Supertest
// Run with: npm test

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

// Ensure test mode for stream transport
process.env.NODE_ENV = 'test';

const { app } = require('..\\server');

let server;

before(() => {
  server = app.listen(0); // random available port
});

after(() => {
  server && server.close();
});

test('GET /api/health returns ok', async () => {
  const res = await request(server).get('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'ok');
  assert.ok(res.body.timestamp);
});

test('POST /api/send-verification-code validates input', async () => {
  const res = await request(server)
    .post('/api/send-verification-code')
    .send({ email: 'not-an-email', code: '123456' })
    .set('Content-Type', 'application/json');

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

test('POST /api/send-verification-code succeeds with valid input (no real email in test)', async () => {
  const res = await request(server)
    .post('/api/send-verification-code')
    .send({ email: 'user@example.com', code: '123456' })
    .set('Content-Type', 'application/json');

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.messageId);
});

test('POST /api/send-verification-code rejects missing email', async () => {
  const res = await request(server)
    .post('/api/send-verification-code')
    .send({ code: '123456' })
    .set('Content-Type', 'application/json');

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.error, /required/i);
});

test('POST /api/send-verification-code rejects missing code', async () => {
  const res = await request(server)
    .post('/api/send-verification-code')
    .send({ email: 'user@example.com' })
    .set('Content-Type', 'application/json');

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.error, /required/i);
});

test('POST /api/send-verification-code rejects invalid code format (not 6 digits)', async () => {
  const res = await request(server)
    .post('/api/send-verification-code')
    .send({ email: 'user@example.com', code: '12345' })
    .set('Content-Type', 'application/json');

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.error, /verification code/i);
});

test('POST /api/send-verification-code rejects non-numeric code', async () => {
  const res = await request(server)
    .post('/api/send-verification-code')
    .send({ email: 'user@example.com', code: 'ABCDEF' })
    .set('Content-Type', 'application/json');

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

test('CORS headers are present', async () => {
  const res = await request(server).options('/api/send-verification-code');
  assert.ok(res.headers['access-control-allow-origin']);
});
