import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'task_completed', 'habit_streak'
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetType: { type: String }, // 'Task', 'Habit', 'PomodoroSession'
  pointsEarned: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

activitySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export const Activity = mongoose.model('Activity', activitySchema);
