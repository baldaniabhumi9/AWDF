const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('./server');

const request = (server, method, path, body, headers = {}) => new Promise((resolve, reject) => {
  const requestBody = body === undefined ? '' : JSON.stringify(body);
  const requestHeaders = { ...headers };
  if (requestBody) {
    requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
    requestHeaders['Content-Length'] = Buffer.byteLength(requestBody);
  }

  const request = http.request({
    port: server.address().port,
    method,
    path,
    headers: requestHeaders,
  }, (response) => {
    let responseBody = '';
    response.on('data', (chunk) => { responseBody += chunk; });
    response.on('end', () => resolve({ status: response.statusCode, body: JSON.parse(responseBody) }));
  });
  request.on('error', reject);
  if (requestBody) request.write(requestBody);
  request.end();
});

(async () => {
  const server = app.listen(0);
  try {
    let response = await request(server, 'GET', '/tasks');
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));

    response = await request(server, 'POST', '/tasks', { title: 'Write smoke test' });
    assert.equal(response.status, 201);
    const taskId = response.body.id;

    response = await request(server, 'PUT', `/tasks/${taskId}`, { completed: true });
    assert.equal(response.status, 200);
    assert.equal(response.body.completed, true);

    response = await request(server, 'DELETE', `/tasks/${taskId}`);
    assert.equal(response.status, 200);

    response = await request(server, 'POST', '/tasks', { title: 'Missing header' }, { 'Content-Type': 'text/plain' });
    assert.equal(response.status, 400);

    response = await request(server, 'GET', '/tasks/not-an-id');
    assert.equal(response.status, 404);

    response = await request(server, 'GET', '/unknown');
    assert.equal(response.status, 404);
    assert.equal(response.body.error, 'Route not found');

    console.log('Smoke test passed: logging, JSON guard, CRUD, ID validation, and 404 handling.');
  } finally {
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
