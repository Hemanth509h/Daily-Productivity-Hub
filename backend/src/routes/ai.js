import { Router } from "express";
import { askAssistant } from "../lib/ai.js";
import { requireAuth } from "../lib/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

router.post("/query", requireAuth, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const answer = await askAssistant(prompt);
    res.json({ answer });
  } catch (err) {
    logger.error(err, "AI Assistant error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
