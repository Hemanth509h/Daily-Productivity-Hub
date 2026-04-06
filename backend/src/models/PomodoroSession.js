import mongoose from 'mongoose';

const pomodoroSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  duration: { type: Number, required: true }, // minutes
  type: { type: String, required: true }, // 'work', 'short_break', 'long_break'
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
});

export const PomodoroSession = mongoose.model('PomodoroSession', pomodoroSessionSchema);
