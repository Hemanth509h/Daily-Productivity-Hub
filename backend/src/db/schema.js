import { pgTable, text, serial, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);
export const categoryEnum = pgEnum("category", ["work", "personal", "study", "health", "finance"]);
export const statusEnum = pgEnum("status", ["pending", "in_progress", "completed", "overdue"]);
export const recurrenceEnum = pgEnum("recurrence", ["none", "daily", "weekly", "monthly"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  points: integer("points").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  priority: priorityEnum("priority").notNull().default("medium"),
  category: categoryEnum("category").notNull().default("personal"),
  status: statusEnum("status").notNull().default("pending"),
  completed: boolean("completed").notNull().default(false),
  startDate: timestamp("start_date", { withTimezone: true }),
  deadlineDate: timestamp("deadline_date", { withTimezone: true }),
  reminderTime: timestamp("reminder_time", { withTimezone: true }),
  recurrence: recurrenceEnum("recurrence").notNull().default("none"),
  estimatedPomodoros: integer("estimated_pomodoros").default(1),
  actualPomodoros: integer("actual_pomodoros").default(0),
  tags: text("tags"), // JSON string or comma-separated
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subtasks = pgTable("subtasks", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  order: integer("order").notNull().default(0),
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  frequency: text("frequency").notNull(), // 'daily', 'weekly'
  target: integer("target").notNull().default(1), // e.g., 1 time per day
  icon: text("icon"),
  color: text("color"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  date: timestamp("date", { withTimezone: true }).notNull(),
  completedValue: integer("completed_value").notNull().default(1),
});

export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "set null" }),
  duration: integer("duration").notNull(), // minutes
  type: text("type").notNull(), // 'work', 'short_break', 'long_break'
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // e.g., 'task_completed', 'habit_streak', 'level_up'
  targetId: integer("target_id"),
  targetType: text("target_type"), // 'task', 'habit', 'pomodoro'
  pointsEarned: integer("points_earned").default(0),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // 'admin', 'member'
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});
