import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
});

taskSchema.pre('save', function trimTitle() {
  if (typeof this.title === 'string') {
    this.title = this.title.trim();
  }
});

const Task = mongoose.model('Task', taskSchema);

export default Task;