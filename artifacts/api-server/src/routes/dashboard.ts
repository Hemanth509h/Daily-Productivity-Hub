import { Router, type IRouter } from "express";
import { eq, and, gte, lte, lt } from "drizzle-orm";
import { db, tasksTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;
  const now = new Date();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const tomorrowStart = new Date(); tomorrowStart.setDate(tomorrowStart.getDate() + 1); tomorrowStart.setHours(0, 0, 0, 0);

  const allTasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId));

  // Auto-update overdue
  for (const task of allTasks) {
    if (!task.completed && task.deadlineDate && new Date() > task.deadlineDate && task.status !== "overdue") {
      await db.update(tasksTable).set({ status: "overdue" }).where(eq(tasksTable.id, task.id));
      task.status = "overdue";
    }
  }

  const totalActive = allTasks.filter((t) => !t.completed).length;
  const inProgress = allTasks.filter((t) => t.status === "pending" && !t.completed).length;
  const completedTotal = allTasks.filter((t) => t.completed).length;
  const overdueCount = allTasks.filter((t) => t.status === "overdue").length;
  const completedToday = allTasks.filter((t) => {
    if (!t.completed || !t.updatedAt) return false;
    return t.updatedAt >= todayStart && t.updatedAt <= todayEnd;
  }).length;

  const total = allTasks.length;
  const completionRate = total > 0 ? Math.round((completedTotal / total) * 100) : 0;

  const todayCount = allTasks.filter((t) => {
    if (!t.deadlineDate) return false;
    return t.deadlineDate >= todayStart && t.deadlineDate <= todayEnd;
  }).length;
  const upcomingCount = allTasks.filter((t) => {
    if (!t.deadlineDate || t.completed) return false;
    return t.deadlineDate >= tomorrowStart;
  }).length;

  res.json({
    totalActive,
    inProgress,
    completedToday,
    completedTotal,
    overdueCount,
    completionRate,
    missedTotal: overdueCount,
    todayCount,
    upcomingCount,
  });
});

router.get("/dashboard/today", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const tasks = await db.select().from(tasksTable).where(
    and(
      eq(tasksTable.userId, userId),
      gte(tasksTable.deadlineDate, todayStart),
      lte(tasksTable.deadlineDate, todayEnd)
    )
  );

  const serialized = tasks.slice(0, 5).map((t) => ({
    id: t.id, userId: t.userId, title: t.title, description: t.description ?? null,
    startDate: t.startDate ? t.startDate.toISOString() : null,
    deadlineDate: t.deadlineDate ? t.deadlineDate.toISOString() : null,
    reminderTime: t.reminderTime ? t.reminderTime.toISOString() : null,
    priority: t.priority, category: t.category, completed: t.completed, status: t.status,
    createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(),
  }));

  res.json(serialized);
});

router.get("/dashboard/urgent", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId));

  const urgent = tasks.filter((t) => {
    if (t.completed) return false;
    if (t.status === "overdue") return true;
    if (t.deadlineDate && t.deadlineDate <= in48h) return true;
    if (t.priority === "high") return true;
    return false;
  }).slice(0, 5);

  const serialized = urgent.map((t) => ({
    id: t.id, userId: t.userId, title: t.title, description: t.description ?? null,
    startDate: t.startDate ? t.startDate.toISOString() : null,
    deadlineDate: t.deadlineDate ? t.deadlineDate.toISOString() : null,
    reminderTime: t.reminderTime ? t.reminderTime.toISOString() : null,
    priority: t.priority, category: t.category, completed: t.completed, status: t.status,
    createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(),
  }));

  res.json(serialized);
});

export default router;
