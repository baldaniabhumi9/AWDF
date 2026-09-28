process.env.JWT_SECRET = 'smoke-test-only-secret-with-sufficient-length';
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI
  || 'mongodb://127.0.0.1:27017/task-manager-api-test';

const assert = require('node:assert/strict');
const http = require('node:http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
const app = require('./server');

const request = (server, method, path, body, headers = {}) => new Promise((resolve, reject) => {
  const requestBody = body === undefined ? '' : JSON.stringify(body);
  const requestHeaders = { ...headers };
  if (body !== undefined) {
    requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
    requestHeaders['Content-Length'] = Buffer.byteLength(requestBody);
  }

  const clientRequest = http.request({
    port: server.address().port,
    method,
    path,
    headers: requestHeaders,
  }, (response) => {
    let responseBody = '';
    response.on('data', (chunk) => { responseBody += chunk; });
    response.on('end', () => resolve({
      status: response.statusCode,
      body: responseBody ? JSON.parse(responseBody) : null,
    }));
  });
  clientRequest.on('error', reject);
  if (requestBody) clientRequest.write(requestBody);
  clientRequest.end();
});

(async () => {
  const server = app.listen(0);
  const listening = new Promise((resolve) => server.once('listening', resolve));
  const userIds = [];
  const taskIds = [];
  let firstToken;
  let secondToken;

  try {
    await mongoose.connection.asPromise();
    await listening;

    let response = await request(server, 'GET', '/tasks');
    assert.equal(response.status, 401);
    assert.equal(response.body.code, 'AUTH_REQUIRED');

    response = await request(server, 'POST', '/register', {
      email: `first-${Date.now()}@example.com`,
      password: 'correct-horse-123',
    });
    assert.equal(response.status, 201);
    const firstUser = response.body.user;
    userIds.push(firstUser.id);

    response = await request(server, 'POST', '/register', {
      email: firstUser.email,
      password: 'correct-horse-123',
    });
    assert.equal(response.status, 409);

    response = await request(server, 'POST', '/login', {
      email: firstUser.email,
      password: 'incorrect-password',
    });
    assert.equal(response.status, 401);

    response = await request(server, 'POST', '/login', {
      email: firstUser.email,
      password: 'correct-horse-123',
    });
    assert.equal(response.status, 200);
    firstToken = response.body.token;
    assert.equal(response.body.expiresIn, 3600);
    const firstAuth = { Authorization: `Bearer ${firstToken}` };

    response = await request(server, 'GET', '/me', undefined, firstAuth);
    assert.equal(response.status, 200);
    assert.equal(response.body.email, firstUser.email);
    assert.equal(Object.hasOwn(response.body, 'password'), false);

    response = await request(server, 'POST', '/tasks', {}, firstAuth);
    assert.equal(response.status, 400);

    response = await request(server, 'POST', '/tasks', { title: 'Smoke-test task' }, firstAuth);
    assert.equal(response.status, 201);
    const taskId = response.body._id;
    taskIds.push(taskId);

    response = await request(server, 'GET', '/tasks', undefined, firstAuth);
    assert.equal(response.status, 200);
    assert.ok(response.body.some((task) => task._id === taskId));

    response = await request(server, 'PUT', `/tasks/${taskId}`, { completed: true }, firstAuth);
    assert.equal(response.status, 200);
    assert.equal(response.body.completed, true);

    response = await request(server, 'POST', '/register', {
      email: `second-${Date.now()}@example.com`,
      password: 'another-password-456',
    });
    assert.equal(response.status, 201);
    userIds.push(response.body.user.id);
    response = await request(server, 'POST', '/login', {
      email: response.body.user.email,
      password: 'another-password-456',
    });
    assert.equal(response.status, 200);
    secondToken = response.body.token;
    const secondAuth = { Authorization: `Bearer ${secondToken}` };

    response = await request(server, 'GET', '/tasks', undefined, secondAuth);
    assert.equal(response.status, 200);
    assert.equal(response.body.some((task) => task._id === taskId), false);

    response = await request(server, 'PUT', `/tasks/${taskId}`, { completed: false }, secondAuth);
    assert.equal(response.status, 404);

    response = await request(server, 'GET', '/me', undefined, {
      Authorization: `Bearer ${jwt.sign({ sub: userIds[0] }, process.env.JWT_SECRET, { expiresIn: -1 })}`,
    });
    assert.equal(response.status, 401);
    assert.equal(response.body.code, 'TOKEN_EXPIRED');

    response = await request(server, 'DELETE', `/tasks/${taskId}`, undefined, firstAuth);
    assert.equal(response.status, 200);

    console.log('Smoke test passed: auth, expiry, validation, user-scoped CRUD, and `/me`.');
  } finally {
    if (taskIds.length) await Task.deleteMany({ _id: { $in: taskIds } });
    if (userIds.length) await User.deleteMany({ _id: { $in: userIds } });
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});