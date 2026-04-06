import mongoose from 'mongoose';

const habitLogSchema = new mongoose.Schema({
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  date: { type: Date, required: true },
  completedValue: { type: Number },
});

export const HabitLog = mongoose.model('HabitLog', habitLogSchema);
