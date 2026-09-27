const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Task = require('./models/Task');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task-manager-api';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`Connected to MongoDB: ${MONGODB_URI}`);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });

// Logs every request before it enters the router.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

app.use(express.json());
app.use(cors());

// POST and PUT requests must explicitly declare a JSON body.
app.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method) && !req.is('application/json')) {
    return res.status(400).json({
      error: 'Content-Type must be application/json for POST and PUT requests',
    });
  }
  next();
});

const formatValidationErrors = (err) => {
  if (err.name === 'ValidationError') {
    const details = {};
    Object.keys(err.errors).forEach((key) => {
      details[key] = err.errors[key].message;
    });
    return {
      error: 'Validation failed',
      details,
    };
  }

  if (err.name === 'CastError') {
    return {
      error: 'Invalid task ID format',
    };
  }

  return {
    error: 'Something went wrong',
  };
};

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  next();
};

const tasksRouter = express.Router();

tasksRouter.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

tasksRouter.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json(formatValidationErrors(error));
  }
});

tasksRouter.put('/:id', validateObjectId, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, description, completed } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    const updatedTask = await task.save();
    return res.status(200).json(updatedTask);
  } catch (error) {
    return res.status(400).json(formatValidationErrors(error));
  }
});

tasksRouter.delete('/:id', validateObjectId, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json({
      message: 'Task deleted successfully',
      task,
    });
  } catch (error) {
    return res.status(400).json(formatValidationErrors(error));
  }
});

app.use('/tasks', tasksRouter);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.status ? err.message : 'Something went wrong',
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Task Manager API running on port ${PORT}`);
  });
}

module.exports = app;
