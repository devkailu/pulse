// server/src/routes/userRoutes.ts
import express, { Request, Response } from "express";
import { query } from "../db.js";

const router = express.Router();

/**
 * GET /api/users/:user_id/following
 * Returns the list of artists followed by the given user
 */
router.get("/:user_id/following", async (req: Request, res: Response) => {
  const userId = Number(req.params.user_id);
  if (!userId) return res.status(400).json({ error: "Invalid user ID" });

  try {
    const rows = await query(
      `SELECT a.id, a.name, a.avatar_url AS avatar
       FROM artists a
       JOIN follows f ON f.artist_id = a.id
       WHERE f.user_id = ?
       ORDER BY a.name ASC`,
      [userId]
    );

    res.json(rows || []);
  } catch (err) {
    console.error("Failed to fetch following artists:", err);
    res.status(500).json({ error: "Server error fetching following artists" });
  }
});

export default router;
