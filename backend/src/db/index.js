import mongoose from 'mongoose';
import dotenv from "dotenv";
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { Activity } from '../models/Activity.js';
import { PomodoroSession } from '../models/PomodoroSession.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined. Please set it in environment variables.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

export { User, Task, Habit, HabitLog, Activity, PomodoroSession };
