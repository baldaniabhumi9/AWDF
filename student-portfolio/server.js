import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import Task from './models/Task.js';

const app = express();

app.use(express.json());

function validateTaskId(req, res, next) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_TASK_ID',
        message: 'Task ID must be a valid MongoDB ObjectId',
      },
    });
  }

  return next();
}

function validateTaskBody(req, res, next) {
  if (req.body === null || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_REQUEST_BODY',
        message: 'Request body must be a JSON object',
      },
    });
  }

  return next();
}

app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
});

app.get('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found' },
      });
    }

    return res.json(task);
  } catch (error) {
    return next(error);
  }
});

app.post('/tasks', validateTaskBody, async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;
    const task = await Task.create({ title, description, completed, priority });
    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
});

async function updateTask(req, res, next) {
  try {
    const updates = Object.fromEntries(
      ['title', 'description', 'completed', 'priority']
        .filter((field) => Object.hasOwn(req.body, field))
        .map((field) => [field, req.body[field]]),
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: {
          code: 'NO_TASK_FIELDS',
          message: 'Provide at least one task field to update',
        },
      });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found' },
      });
    }

    return res.json(task);
  } catch (error) {
    return next(error);
  }
}

app.put('/tasks/:id', validateTaskId, validateTaskBody, updateTask);
app.patch('/tasks/:id', validateTaskId, validateTaskBody, updateTask);

app.delete('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found' },
      });
    }

    return res.json({ message: 'Task deleted', task });
  } catch (error) {
    return next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found' },
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === 'ValidationError') {
    const details = Object.fromEntries(
      Object.entries(error.errors).map(([field, fieldError]) => [field, fieldError.message]),
    );

    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Task validation failed',
        details,
      },
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      error: { code: 'INVALID_VALUE', message: error.message },
    });
  }

  const status = error.status === 400 ? 400 : 500;
  return res.status(status).json({
    error: {
      code: status === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
      message: status === 400 ? error.message : 'An unexpected error occurred',
    },
  });
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required. Set it in your .env file.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Task API listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start Task API:', error.message);
  process.exitCode = 1;
});