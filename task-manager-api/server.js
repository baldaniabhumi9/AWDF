const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./models/Task');
const User = require('./models/User');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task-manager-api';
const JWT_SECRET = process.env.JWT_SECRET;

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

const validateCredentials = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = {};

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'A valid email address is required';
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    errors.password = 'Password must be between 8 and 128 characters';
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  return next();
};

const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.sub || !mongoose.Types.ObjectId.isValid(decoded.sub)) {
      return res.status(401).json({ error: 'Invalid authentication token', code: 'INVALID_TOKEN' });
    }
    req.user = { id: decoded.sub };
    return next();
  } catch (error) {
    const expired = error.name === 'TokenExpiredError';
    return res.status(401).json({
      error: expired ? 'Authentication token expired' : 'Invalid authentication token',
      code: expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
    });
  }
};

const validateTask = (requireTitle) => (req, res, next) => {
  const body = req.body;
  const errors = {};
  const allowedFields = ['title', 'description', 'completed'];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  const unknownFields = Object.keys(body).filter((field) => !allowedFields.includes(field));
  if (unknownFields.length) errors.fields = `Unsupported fields: ${unknownFields.join(', ')}`;
  if (requireTitle && (typeof body.title !== 'string' || !body.title.trim())) {
    errors.title = 'Task title is required';
  }
  if (body.title !== undefined && (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 120)) {
    errors.title = 'Title must contain 1 to 120 characters';
  }
  if (body.description !== undefined && (typeof body.description !== 'string' || body.description.length > 500)) {
    errors.description = 'Description must be a string of at most 500 characters';
  }
  if (body.completed !== undefined && typeof body.completed !== 'boolean') {
    errors.completed = 'Completed must be a boolean';
  }
  if (!requireTitle && !Object.keys(body).length) errors.fields = 'Provide at least one task field to update';

  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  return next();
};

const authRouter = express.Router();

authRouter.post('/register', validateCredentials, async (req, res) => {
  const email = req.body.email.trim().toLowerCase();

  try {
    const password = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ email, password });
    await Task.updateMany({ owner: { $exists: false } }, { $set: { owner: user._id } });
    return res.status(201).json({
      message: 'Registration successful',
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    return res.status(400).json(formatValidationErrors(error));
  }
});

authRouter.post('/login', validateCredentials, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.trim().toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ error: 'Email or password is incorrect', code: 'INVALID_CREDENTIALS' });
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({
      token,
      expiresIn: 3600,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to log in right now' });
  }
});

authRouter.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('_id email createdAt');
    if (!user) {
      return res.status(401).json({ error: 'Account no longer exists', code: 'ACCOUNT_NOT_FOUND' });
    }
    return res.status(200).json({ id: user.id, email: user.email, createdAt: user.createdAt });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to load account details' });
  }
});

app.use(authRouter);

const tasksRouter = express.Router();
tasksRouter.use(authenticateToken);

tasksRouter.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

tasksRouter.post('/', validateTask(true), async (req, res) => {
  try {
    const task = new Task({ ...req.body, owner: req.user.id });
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json(formatValidationErrors(error));
  }
});

tasksRouter.put('/:id', validateObjectId, validateTask(false), async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });

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
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

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
  const status = err.status || (err instanceof SyntaxError ? 400 : 500);
  res.status(status).json({ error: status === 400 ? 'Malformed JSON request' : 'Something went wrong' });
});

if (require.main === module) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required. Add it to task-manager-api/.env before starting the server.');
  }
  app.listen(PORT, () => {
    console.log(`Task Manager API running on port ${PORT}`);
  });
}

module.exports = app;
