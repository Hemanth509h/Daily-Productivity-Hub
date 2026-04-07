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

    // Try to get tasks due today (or with no deadline)
    const todayTasks = await Task.find({
      userId: req.user.userId,
      $or: [
        { deadlineDate: { $gte: todayStart, $lte: todayEnd } },
        { deadlineDate: null }
      ],
      completed: false
    }).sort({ createdAt: -1 });

    // If no tasks for today, return the next 5 upcoming tasks
    if (todayTasks.length === 0) {
      const upcomingTasks = await Task.find({
        userId: req.user.userId,
        deadlineDate: { $gt: todayEnd },
        completed: false
      }).sort({ deadlineDate: 1 }).limit(5);

      return res.json({ tasks: upcomingTasks, isFallback: true });
    }

    res.json({ tasks: todayTasks, isFallback: false });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/urgent", requireAuth, async (req, res) => {
  try {
    const now = new Date();
    const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    const allPending = await Task.find({ userId: req.user.userId, completed: false });

    // Include all overdue tasks
    const overdue = allPending.filter(t => 
      t.status === "overdue" || (t.deadlineDate && new Date(t.deadlineDate) < now)
    );

    // High priority tasks (not overdue)
    const highPriority = allPending.filter(t => 
      t.priority === "high" && !overdue.includes(t)
    );

    // Near deadline (within 72h, not overdue or high priority)
    const nearDeadline = allPending.filter(t => 
      t.deadlineDate && 
      new Date(t.deadlineDate) >= now && 
      new Date(t.deadlineDate) <= in72h && 
      !overdue.includes(t) && 
      !highPriority.includes(t)
    );

    let urgentList = [...overdue, ...highPriority, ...nearDeadline];

    // Fallback: include medium priority if high/overdue tasks are scarce
    if (urgentList.length < 5) {
      const mediumPriority = allPending.filter(t => 
        t.priority === "medium" && !urgentList.includes(t)
      );
      const needed = 5 - urgentList.length;
      urgentList = [...urgentList, ...mediumPriority.slice(0, needed)];
    }

    // Sort: Overdue first, then by nearest deadline, then by priority
    urgentList.sort((a, b) => {
      const isOverdue = (t) => t.status === "overdue" || (t.deadlineDate && new Date(t.deadlineDate) < now);
      const aOverdue = isOverdue(a);
      const bOverdue = isOverdue(b);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      const da = a.deadlineDate ? new Date(a.deadlineDate) : new Date(8640000000000000);
      const db = b.deadlineDate ? new Date(b.deadlineDate) : new Date(8640000000000000);
      return da - db;
    });

    res.json(urgentList);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
