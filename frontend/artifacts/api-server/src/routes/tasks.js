import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, tasksTable } from "@workspace/db";
import {
  CreateTaskBody,
  UpdateTaskBody,
  GetTasksQueryParams,
  ToggleTaskCompleteBody
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
const router = Router();
function serializeTask(task) {
  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    description: task.description ?? null,
    startDate: task.startDate ? task.startDate.toISOString() : null,
    deadlineDate: task.deadlineDate ? task.deadlineDate.toISOString() : null,
    reminderTime: task.reminderTime ? task.reminderTime.toISOString() : null,
    priority: task.priority,
    category: task.category,
    completed: task.completed,
    status: task.status,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };
}
function computeStatus(task) {
  if (task.completed) return "completed";
  if (task.deadlineDate && /* @__PURE__ */ new Date() > task.deadlineDate) return "overdue";
  return "pending";
}
router.get("/tasks", requireAuth, async (req, res) => {
  const params = GetTasksQueryParams.safeParse(req.query);
  const userId = req.user.userId;
  const now = /* @__PURE__ */ new Date();
  let tasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId));
  for (const task of tasks) {
    const newStatus = computeStatus(task);
    if (newStatus !== task.status) {
      await db.update(tasksTable).set({ status: newStatus }).where(eq(tasksTable.id, task.id));
      task.status = newStatus;
    }
  }
  if (params.success) {
    const { status, priority, category, timeRange } = params.data;
    if (status) tasks = tasks.filter((t) => t.status === status);
    if (priority) tasks = tasks.filter((t) => t.priority === priority);
    if (category) tasks = tasks.filter((t) => t.category === category);
    if (timeRange === "today") {
      const todayStart = /* @__PURE__ */ new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = /* @__PURE__ */ new Date();
      todayEnd.setHours(23, 59, 59, 999);
      tasks = tasks.filter((t) => {
        if (!t.deadlineDate) return false;
        return t.deadlineDate >= todayStart && t.deadlineDate <= todayEnd;
      });
    } else if (timeRange === "upcoming") {
      const tomorrow = /* @__PURE__ */ new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      tasks = tasks.filter((t) => {
        if (!t.deadlineDate) return true;
        return t.deadlineDate >= tomorrow;
      });
    }
  }
  res.json(tasks.map(serializeTask));
});
router.post("/tasks", requireAuth, async (req, res) => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { title, description, startDate, deadlineDate, reminderTime, priority, category } = parsed.data;
  const [task] = await db.insert(tasksTable).values({
    userId: req.user.userId,
    title,
    description: description ?? null,
    startDate: startDate ? new Date(startDate) : null,
    deadlineDate: deadlineDate ? new Date(deadlineDate) : null,
    reminderTime: reminderTime ? new Date(reminderTime) : null,
    priority,
    category,
    completed: false,
    status: "pending"
  }).returning();
  res.status(201).json(serializeTask(task));
});
router.get("/tasks/:id", requireAuth, async (req, res) => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [task] = await db.select().from(tasksTable).where(
    and(eq(tasksTable.id, id), eq(tasksTable.userId, req.user.userId))
  );
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(serializeTask(task));
});
router.put("/tasks/:id", requireAuth, async (req, res) => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates = {};
  if (parsed.data.title != null) updates.title = parsed.data.title;
  if (parsed.data.description !== void 0) updates.description = parsed.data.description;
  if (parsed.data.priority != null) updates.priority = parsed.data.priority;
  if (parsed.data.category != null) updates.category = parsed.data.category;
  if (parsed.data.completed != null) updates.completed = parsed.data.completed;
  if (parsed.data.startDate !== void 0) updates.startDate = parsed.data.startDate ? new Date(parsed.data.startDate) : null;
  if (parsed.data.deadlineDate !== void 0) updates.deadlineDate = parsed.data.deadlineDate ? new Date(parsed.data.deadlineDate) : null;
  if (parsed.data.reminderTime !== void 0) updates.reminderTime = parsed.data.reminderTime ? new Date(parsed.data.reminderTime) : null;
  const [existing] = await db.select().from(tasksTable).where(
    and(eq(tasksTable.id, id), eq(tasksTable.userId, req.user.userId))
  );
  if (!existing) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const mergedCompleted = parsed.data.completed != null ? parsed.data.completed : existing.completed;
  const mergedDeadline = parsed.data.deadlineDate !== void 0 ? parsed.data.deadlineDate ? new Date(parsed.data.deadlineDate) : null : existing.deadlineDate;
  updates.status = computeStatus({ completed: mergedCompleted, deadlineDate: mergedDeadline });
  const [task] = await db.update(tasksTable).set(updates).where(
    and(eq(tasksTable.id, id), eq(tasksTable.userId, req.user.userId))
  ).returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(serializeTask(task));
});
router.delete("/tasks/:id", requireAuth, async (req, res) => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [task] = await db.delete(tasksTable).where(
    and(eq(tasksTable.id, id), eq(tasksTable.userId, req.user.userId))
  ).returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.sendStatus(204);
});
router.patch("/tasks/:id/complete", requireAuth, async (req, res) => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = ToggleTaskCompleteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(tasksTable).where(
    and(eq(tasksTable.id, id), eq(tasksTable.userId, req.user.userId))
  );
  if (!existing) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const newCompleted = parsed.data.completed;
  const newStatus = computeStatus({ completed: newCompleted, deadlineDate: existing.deadlineDate });
  const [task] = await db.update(tasksTable).set({ completed: newCompleted, status: newStatus }).where(and(eq(tasksTable.id, id), eq(tasksTable.userId, req.user.userId))).returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(serializeTask(task));
});
var stdin_default = router;
export {
  stdin_default as default
};
