// Requires the user to have an "admin" role in their JWT payload.
// Must run AFTER protectServiceRoutes, since it depends on req.user being set.
 export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    // Defensive check — shouldn't happen if applied after protectServiceRoutes,
    // but guards against this middleware ever being used standalone by mistake.
    return res.status(401).json({ message: "Access denied. No authenticated user found." });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }

  next();
};
