# Task Manager API

RESTful Express backend for Practical 5. It connects to MongoDB using Mongoose and stores tasks in a live database instead of an in-memory array.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB locally or use a MongoDB Atlas connection string.

3. Copy `.env.example` to `.env`, then replace its placeholder JWT secret with a fresh value from `openssl rand -hex 32`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/task-manager-api
PORT=5001
JWT_SECRET=replace-this-with-a-long-random-secret
```

The server requires `JWT_SECRET` to sign and verify tokens. Never commit your real `.env` file; it is ignored by Git.

## Run

```bash
npm start
```

The API listens on `http://localhost:5001`. Port 5000 is occupied by AirTunes on this Mac.
The API enables CORS so the React development server can make requests to it.

## Task schema

The `Task` model includes:

- `title` (String, required)
- `description` (String)
- `completed` (Boolean, default: false)
- `createdAt` (Date, default: Date.now)

## Endpoints

- `POST /register` creates an account and hashes its password with bcrypt
- `POST /login` verifies credentials and returns a JWT that expires after one hour
- `GET /me` returns the authenticated account without its password
- `GET /tasks` returns tasks owned by the authenticated user
- `POST /tasks` creates a task for the authenticated user
- `PUT /tasks/:id` updates one of the authenticated user's tasks
- `DELETE /tasks/:id` deletes one of the authenticated user's tasks

All task endpoints and `/me` require `Authorization: Bearer <token>`. JSON requests must send `Content-Type: application/json`.
Task input is validated before it reaches MongoDB, including a required non-empty title.
On first registration, legacy tasks without an owner are assigned to that first account.

## Validation behavior

Mongoose validation errors are returned as structured JSON instead of raw Mongoose objects. Example:

```json
{
  "error": "Validation failed",
  "details": {
    "title": "Task title is required"
  }
}
```

## Postman testing

In Postman, test authentication first:

1. `POST http://localhost:5001/register` with `{"email":"student@example.com","password":"password123"}`.
2. `POST http://localhost:5001/login` with the same credentials and copy the returned token.
3. For `/me` and task requests, set `Authorization` to `Bearer <token>`.
4. Test `GET`, `POST`, `PUT`, and `DELETE` at `http://localhost:5001/tasks`.

For task creation, send JSON such as `{"title":"Finish Practical 7","description":"Test protected routes"}`.
The React app provides login, registration, and logout; expired tokens are cleared and redirect to login.

## Smoke test

Run `npm test` with a local MongoDB service available. The test uses the separate `task-manager-api-test` database by default; set `TEST_MONGODB_URI` to override it.

## React full-stack integration

The React app in `../student-portfolio` uses the authenticated task endpoints through `src/api.js`.
Start it with `npm run dev` from that folder and open the Vite URL shown in the terminal.
The API base URL defaults to `http://localhost:5001`; set `VITE_API_URL` to override it.
