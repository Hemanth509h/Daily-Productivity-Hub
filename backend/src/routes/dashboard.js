import { Router } from "express";
import { Task, User, Activity } from "../db/index.js";
import { requireAuth } from "../lib/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

router.get("/summary", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const allTasks = await Task.find({ userId });
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const totalActive = allTasks.filter(t => !t.completed).length;
    const inProgress = allTasks.filter(t => t.status === "in_progress").length;
    const completedTotal = allTasks.filter(t => t.completed).length;
    const overdueCount = allTasks.filter(t => {
      if (t.completed) return false;
      if (t.deadlineDate && new Date(t.deadlineDate) < now) return true;
      return t.status === "overdue";
    }).length;

    const completedToday = allTasks.filter(t => {
      if (!t.completed || !t.updatedAt) return false;
      const updatedDate = new Date(t.updatedAt);
      return updatedDate >= todayStart && updatedDate <= todayEnd;
    }).length;

    const total = allTasks.length;
    const completionRate = total > 0 ? Math.round((completedTotal / total) * 100) : 0;

    // Calculate performance score (productivity points based logic)
    const recentActivities = await Activity.find({
      userId,
      createdAt: { $gte: todayStart }
    });
    const dailyPoints = recentActivities.reduce((sum, act) => sum + (act.pointsEarned || 0), 0);

    res.json({
      totalActive,
      inProgress,
      completedToday,
      completedTotal,
      overdueCount,
      completionRate,
      points: user.points,
      level: user.level,
      streak: user.streak,
      dailyPoints,
    });
  } catch (err) {
    logger.error(err, "Get summary error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/today", requireAuth, async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayTasks = await Task.find({
      userId: req.user.userId,
      $or: [
        { deadlineDate: { $gte: todayStart, $lte: todayEnd } },
        { deadlineDate: null }
      ],
      completed: false
    });

    res.json(todayTasks);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/urgent", requireAuth, async (req, res) => {
  try {
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const urgentTasks = await Task.find({ userId: req.user.userId, completed: false });

    const filtered = urgentTasks.filter(t => {
      if (t.priority === "high") return true;
      if (t.deadlineDate && new Date(t.deadlineDate) <= in48h) return true;
      return false;
    }).slice(0, 5);

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
