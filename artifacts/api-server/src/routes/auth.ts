import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { signToken, requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ name, email, password: hashed }).returning();

  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt.toISOString() },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt.toISOString() },
  });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt.toISOString() });
});

router.patch("/auth/profile", requireAuth, async (req, res): Promise<void> => {
  const { name, email, currentPassword, newPassword } = req.body;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const updates: Record<string, unknown> = {};

  if (name && typeof name === "string" && name.trim()) {
    updates.name = name.trim();
  }

  if (email && typeof email === "string" && email.trim() && email !== user.email) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.trim()));
    if (existing.length > 0 && existing[0].id !== user.id) {
      res.status(409).json({ error: "Email already in use by another account" });
      return;
    }
    updates.email = email.trim();
  }

  if (newPassword) {
    if (!currentPassword) {
      res.status(400).json({ error: "Current password is required to set a new password" });
      return;
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "New password must be at least 6 characters" });
      return;
    }
    updates.password = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No changes to save" });
    return;
  }

  updates.updatedAt = new Date();
  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.user!.userId))
    .returning();

  res.json({ id: updated.id, name: updated.name, email: updated.email, createdAt: updated.createdAt.toISOString() });
});

export default router;
