import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.SESSION_SECRET ?? "fallback-secret-change-me";
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
export {
  requireAuth,
  signToken,
  verifyToken
};
