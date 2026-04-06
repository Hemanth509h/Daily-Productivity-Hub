import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String, enum: ['work', 'personal', 'study', 'health', 'finance'], default: 'personal' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'overdue'], default: 'pending' },
  completed: { type: Boolean, default: false },
  deadlineDate: { type: Date },
  startDate: { type: Date },
  reminderTime: { type: Date },
  recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
  estimatedPomodoros: { type: Number, default: 1 },
  actualPomodoros: { type: Number, default: 0 },
  tags: { type: [String] },
  subtasks: [subtaskSchema],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Map _id to id for frontend compatibility
taskSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export const Task = mongoose.model('Task', taskSchema);
