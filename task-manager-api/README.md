# Task Manager API

RESTful Express backend for Practical 4. It uses an in-memory task array, so restarting the server resets the data.

## Run

```bash
npm install
npm start
```

The API listens on `http://localhost:5000`.

## Endpoints

- `GET /tasks` returns all tasks with `200`.
- `POST /tasks` creates a task with `201`.
- `PUT /tasks/:id` updates a task with `200`.
- `DELETE /tasks/:id` deletes a task with `200`.

POST and PUT requests require the `Content-Type: application/json` header. Invalid IDs, missing tasks, and undefined routes return structured JSON errors.

## Smoke test

With the server stopped, run `npm install`. Then run `npm test`; the test starts the app on an ephemeral port and exercises the middleware and CRUD endpoints.
