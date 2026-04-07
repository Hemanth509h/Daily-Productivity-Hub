import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../db/index.js";
import { RegisterBody, LoginBody, UpdateProfileBody } from "../api-zod.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken, requireAuth } from "../lib/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const parsed = RegisterBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const { firstName, lastName, email, password } = parsed.data;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ firstName, lastName, email, password: hashedPassword });

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });

    res.status(201).json({ accessToken, refreshToken, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (err) {
    logger.error(err, "Registration error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });

    res.json({ accessToken, refreshToken, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, points: user.points, level: user.level } });
  } catch (err) {
    logger.error(err, "Login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ error: "User not found" });

    const newAccessToken = signAccessToken({ userId: user.id, email: user.email });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, points: user.points, level: user.level, streak: user.streak });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const parsed = UpdateProfileBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const updates = {};
    if (parsed.data.firstName) updates.firstName = parsed.data.firstName;
    if (parsed.data.lastName) updates.lastName = parsed.data.lastName;
    if (parsed.data.email) updates.email = parsed.data.email;
    if (parsed.data.avatarUrl) updates.avatarUrl = parsed.data.avatarUrl;
    
    if (parsed.data.newPassword) {
      const user = await User.findById(req.user.userId);
      const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
      if (!valid) return res.status(400).json({ error: "Current password incorrect" });
      updates.password = await bcrypt.hash(parsed.data.newPassword, 12);
    }

    const updated = await User.findByIdAndUpdate(req.user.userId, updates, { returnDocument: 'after' });
    res.json({ id: updated.id, firstName: updated.firstName, lastName: updated.lastName, email: updated.email });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/account", requireAuth, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.user.userId);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    logger.error(err, "Account deletion error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
