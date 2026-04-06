import { Router } from "express";
import { Habit, HabitLog } from "../db/index.js";
import { CreateHabitBody, LogHabitBody } from "../api-zod.js";
import { requireAuth } from "../lib/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.userId }).lean();
    
    // Manual join for habit logs (or could use virtuals/populate)
    const list = await Promise.all(habits.map(async (habit) => {
      const logs = await HabitLog.find({ habitId: habit._id }).lean();
      return { ...habit, id: habit._id.toString(), habitLogs: logs.map(l => ({ ...l, id: l._id.toString() })) };
    }));
    
    res.json(list);
  } catch (err) {
    logger.error(err, "Get habits error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = CreateHabitBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const newHabit = await Habit.create({
      ...parsed.data,
      userId: req.user.userId,
    });

    res.status(201).json(newHabit);
  } catch (err) {
    logger.error(err, "Create habit error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/log", requireAuth, async (req, res) => {
  try {
    const parsed = LogHabitBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const habitId = req.params.id;
    const logDate = new Date(parsed.data.date);
    logDate.setHours(0,0,0,0);

    const log = await HabitLog.create({
      habitId,
      date: logDate,
      completedValue: parsed.data.completedValue,
    });

    res.status(201).json(log);
  } catch (err) {
    logger.error(err, "Log habit error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
