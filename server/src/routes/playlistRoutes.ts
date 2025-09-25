// server/src/routes/playlistRoutes.ts
import express, { Request, Response } from "express";
import { query } from "../db";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

/** Helper: verify token from cookie or Authorization header */
function getUserIdFromReq(req: Request): number | null {
  const token =
    req.cookies?.token ||
    (req.headers.authorization &&
      (req.headers.authorization as string).split(" ")[1]);
  if (!token) return null;
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    return Number(payload.user_id);
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

// ---------------- GET playlists ----------------
router.get("/", async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  try {
    const rows: any = await query(
      `SELECT id, user_id, name, description, is_public, created_at
       FROM playlists
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows || []);
  } catch (err) {
    console.error("Fetch playlists error:", err);
    res.status(500).json({ error: "DB error fetching playlists" });
  }
});

// ---------------- POST playlists ----------------
router.post("/", async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  console.log("DEBUG: userId from token:", userId);
  console.log("DEBUG: request body:", req.body);

  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { name, description = null, is_public = false } = req.body;
  if (!name || !name.trim())
    return res.status(400).json({ error: "Playlist name required" });

  try {
    // Insert playlist
    const result: any = await query(
      `INSERT INTO playlists (user_id, name, description, is_public) VALUES (?, ?, ?, ?)`,
      [userId, name.trim(), description, !!is_public]
    );
    console.log("DEBUG: MySQL insert result:", result);

    const insertedId = result.insertId;
    if (!insertedId) {
      console.error("DEBUG: Failed to get inserted playlist ID", result);
      throw new Error("Failed to get inserted playlist ID");
    }

    // Fetch the inserted playlist
    const createdRows: any = await query(
      `SELECT id, user_id, name, description, is_public, created_at FROM playlists WHERE id = ?`,
      [insertedId]
    );

    const created = createdRows[0];
    if (!created) throw new Error("Failed to fetch created playlist");

    res.status(201).json({ success: true, playlist: created });
  } catch (err) {
    console.error("Create playlist error:", err);
    res.status(500).json({ error: "DB error creating playlist" });
  }
});

// ---------------- DELETE playlists ----------------
router.delete("/:id", async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const playlistId = Number(req.params.id);
  if (!playlistId) return res.status(400).json({ error: "Invalid playlist id" });

  try {
    const rows: any = await query(
      `SELECT id, user_id, name FROM playlists WHERE id = ? AND user_id = ?`,
      [playlistId, userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Playlist not found" });

    await query(`DELETE FROM playlists WHERE id = ? AND user_id = ?`, [
      playlistId,
      userId,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete playlist error:", err);
    res.status(500).json({ error: "DB error deleting playlist" });
  }
});

export default router;
