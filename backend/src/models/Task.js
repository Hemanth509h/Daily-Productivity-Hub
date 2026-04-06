import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean },
  order: { type: Number },
});

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high'] },
  category: { type: String, enum: ['work', 'personal', 'study', 'health', 'finance'] },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'overdue'] },
  completed: { type: Boolean },
  deadlineDate: { type: Date },
  startDate: { type: Date },
  reminderTime: { type: Date },
  recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'] },
  estimatedPomodoros: { type: Number },
  actualPomodoros: { type: Number },
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
