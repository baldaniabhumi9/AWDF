# Task Manager API

RESTful Express backend for Practical 5. It connects to MongoDB using Mongoose and stores tasks in a live database instead of an in-memory array.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB locally or use a MongoDB Atlas connection string.

3. Create a `.env` file in this folder with:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/task-manager-api
PORT=5001
```

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

- `GET /tasks` returns all tasks
- `POST /tasks` creates a new task
- `PUT /tasks/:id` updates a task
- `DELETE /tasks/:id` deletes a task

All JSON requests must send `Content-Type: application/json`.

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

Use Postman to test each CRUD endpoint against the live database:

- `GET http://localhost:5001/tasks`
- `POST http://localhost:5001/tasks`
- `PUT http://localhost:5001/tasks/:id`
- `DELETE http://localhost:5001/tasks/:id`

For `POST` and `PUT`, send JSON in the request body.

## React full-stack integration

The React app in `../student-portfolio` uses the task endpoints through `src/api.js`.
Start it with `npm run dev` from that folder and open the Vite URL shown in the terminal.
The API base URL defaults to `http://localhost:5001`; set `VITE_API_URL` to override it.
