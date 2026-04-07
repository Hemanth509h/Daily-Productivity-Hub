import { Router } from "express";
import { Task } from "../db/index.js";
import { CreateTaskBody, UpdateTaskBody, CreateSubtaskBody, ToggleSubtaskBody } from "../api-zod.js";
import { requireAuth } from "../lib/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

// Helper to calculate status
function getTaskStatus(task) {
  if (task.completed) return "completed";
  if (task.subtasks?.length > 0 && task.subtasks.every(s => s.completed)) return "completed";
  if (task.deadlineDate && new Date() > new Date(task.deadlineDate)) return "overdue";
  return task.status || "pending";
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const allTasks = await Task.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(allTasks);
  } catch (err) {
    logger.error(err, "Get tasks error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    console.log("[DEBUG] POST /tasks - Request body:", req.body);
    console.log("[DEBUG] User ID:", req.user?.userId);
    
    const parsed = CreateTaskBody.safeParse(req.body);
    console.log("[DEBUG] Validation result:", parsed.success ? 'PASS' : 'FAIL', parsed.error?.issues);
    
    if (!parsed.success) {
      console.log("[DEBUG] Validation error:", parsed.error.issues[0].message);
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const taskData = {
      ...parsed.data,
      userId: req.user.userId,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      deadlineDate: parsed.data.deadlineDate ? new Date(parsed.data.deadlineDate) : null,
      reminderTime: parsed.data.reminderTime ? new Date(parsed.data.reminderTime) : null,
      tags: typeof parsed.data.tags === 'string' ? parsed.data.tags.split(',').map(t => t.trim()) : [],
    };

    const newTask = await Task.create(taskData);

    console.log("[DEBUG] Task created successfully:", newTask._id);
    res.status(201).json(newTask);
  } catch (err) {
    console.error("[DEBUG] Create task error:", err);
    logger.error(err, "Create task error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const parsed = UpdateTaskBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const updates = { ...parsed.data };
    if (parsed.data.startDate) updates.startDate = new Date(parsed.data.startDate);
    if (parsed.data.deadlineDate) updates.deadlineDate = new Date(parsed.data.deadlineDate);
    if (parsed.data.reminderTime) updates.reminderTime = new Date(parsed.data.reminderTime);
    if (typeof parsed.data.tags === 'string') updates.tags = parsed.data.tags.split(',').map(t => t.trim());

    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!updated) return res.status(404).json({ error: "Task not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const parsed = UpdateTaskBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const updates = { ...parsed.data };
    if (parsed.data.startDate) updates.startDate = new Date(parsed.data.startDate);
    if (parsed.data.deadlineDate) updates.deadlineDate = new Date(parsed.data.deadlineDate);
    if (parsed.data.reminderTime) updates.reminderTime = new Date(parsed.data.reminderTime);
    if (typeof parsed.data.tags === 'string') updates.tags = parsed.data.tags.split(',').map(t => t.trim());

    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!updated) return res.status(404).json({ error: "Task not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!deleted) return res.status(404).json({ error: "Task not found" });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// SUBTASKS
router.post("/:id/subtasks", requireAuth, async (req, res) => {
  try {
    const parsed = CreateSubtaskBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $push: { subtasks: { title: parsed.data.title } } },
      { returnDocument: 'after' }
    );

    if (!task) return res.status(404).json({ error: "Task not found" });
    const newSubtask = task.subtasks[task.subtasks.length - 1];
    res.status(201).json(newSubtask);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/subtasks/:subtaskId", requireAuth, async (req, res) => {
  try {
    const parsed = ToggleSubtaskBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId, "subtasks._id": req.params.subtaskId },
      { $set: { "subtasks.$.completed": parsed.data.completed } },
      { returnDocument: 'after' }
    );

    if (!task) return res.status(404).json({ error: "Task or subtask not found" });
    const updatedSubtask = task.subtasks.id(req.params.subtaskId);
    res.json(updatedSubtask);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
