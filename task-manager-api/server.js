const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

let nextTaskId = 3;
let tasks = [
  { id: 1, title: 'Review Express middleware', completed: false },
  { id: 2, title: 'Test the task API', completed: true },
];

// Logs every request before it enters the router.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

app.use(express.json());

// POST and PUT requests must explicitly declare a JSON body.
app.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method) && !req.is('application/json')) {
    return res.status(400).json({
      error: 'Content-Type must be application/json for POST and PUT requests',
    });
  }
  next();
});

const validateTaskId = (req, res, next) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ error: 'Task ID must be a positive integer' });
  }

  req.taskId = Number(req.params.id);
  if (!Number.isSafeInteger(req.taskId) || req.taskId < 1) {
    return res.status(400).json({ error: 'Task ID must be a positive integer' });
  }
  next();
};

const findTask = (taskId) => tasks.find((task) => task.id === taskId);

const tasksRouter = express.Router();

tasksRouter.get('/', (req, res) => {
  res.status(200).json(tasks);
});

tasksRouter.post('/', (req, res, next) => {
  const { title, completed = false } = req.body;

  if (typeof title !== 'string' || title.trim() === '') {
    const error = new Error('Task title is required');
    error.status = 400;
    return next(error);
  }

  if (typeof completed !== 'boolean') {
    const error = new Error('Completed must be a boolean');
    error.status = 400;
    return next(error);
  }

  const task = { id: nextTaskId++, title: title.trim(), completed };
  tasks.push(task);
  res.status(201).json(task);
});

tasksRouter.put('/:id', validateTaskId, (req, res, next) => {
  const task = findTask(req.taskId);
  if (!task) {
    const error = new Error('Task not found');
    error.status = 404;
    return next(error);
  }

  const { title, completed } = req.body;
  if (title === undefined && completed === undefined) {
    const error = new Error('At least one task field is required');
    error.status = 400;
    return next(error);
  }
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    const error = new Error('Task title must be a non-empty string');
    error.status = 400;
    return next(error);
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    const error = new Error('Completed must be a boolean');
    error.status = 400;
    return next(error);
  }

  if (title !== undefined) task.title = title.trim();
  if (completed !== undefined) task.completed = completed;
  res.status(200).json(task);
});

tasksRouter.delete('/:id', validateTaskId, (req, res, next) => {
  const taskIndex = tasks.findIndex((task) => task.id === req.taskId);
  if (taskIndex === -1) {
    const error = new Error('Task not found');
    error.status = 404;
    return next(error);
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);
  res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
});

app.use('/tasks', tasksRouter);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Must remain the final middleware in the pipeline.
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Task Manager API running on port ${PORT}`);
  });
}

module.exports = app;
