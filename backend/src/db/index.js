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
  throw new Error('MONGODB_URI is not defined in .env file');
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

export const db = {
  query: {
    users: {
      findFirst: async ({ where }) => {
        // Simple shim for findFirst if needed by existing code
        // Note: Routes should be migrated to native Mongoose calls
        return User.findOne(where);
      }
    }
  }
};

export { User, Task, Habit, HabitLog, Activity, PomodoroSession };
