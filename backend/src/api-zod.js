import * as z from "zod";

export const RegisterBody = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const LoginBody = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const UpdateProfileBody = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
  avatarUrl: z.string().url().optional(),
});

export const CreateTaskBody = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  category: z.enum(["work", "personal", "study", "health", "finance"]).optional(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly"]).optional(),
  estimatedPomodoros: z.number().int().min(1).optional(),
  startDate: z.string().datetime().nullish(),
  deadlineDate: z.string().datetime().nullish(),
  reminderTime: z.string().datetime().nullish(),
  tags: z.string().optional(),
});

export const UpdateTaskBody = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  category: z.enum(["work", "personal", "study", "health", "finance"]).optional(),
  status: z.enum(["pending", "in_progress", "completed", "overdue"]).optional(),
  completed: z.boolean().optional(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly"]).optional(),
  actualPomodoros: z.number().int().min(0).optional(),
  startDate: z.string().datetime().nullish(),
  deadlineDate: z.string().datetime().nullish(),
  reminderTime: z.string().datetime().nullish(),
  tags: z.string().optional(),
});

export const CreateSubtaskBody = z.object({
  title: z.string().min(1),
});

export const ToggleSubtaskBody = z.object({
  completed: z.boolean(),
});

export const ToggleTaskCompleteBody = z.object({
  completed: z.boolean(),
});

export const PomodoroSessionBody = z.object({
  taskId: z.string().optional(),
  duration: z.number().int().min(1),
  type: z.enum(["work", "short_break", "long_break"]),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export const CreateHabitBody = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  frequency: z.string(), // 'daily', 'weekly'
  target: z.number().int().min(1).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const LogHabitBody = z.object({
  date: z.string().datetime(),
  completedValue: z.number().int().min(1).optional(),
});
