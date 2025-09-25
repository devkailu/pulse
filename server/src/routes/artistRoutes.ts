// src/routes/artistRoutes.ts
import express, { Request, Response } from "express";
import multer from "multer";
import { upload } from "../upload";
import db, { query } from "../db.js"; // your db helper
import { RowDataPacket } from "mysql2";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = express.Router();

// -------------------- Get all artists --------------------
router.get("/artists", async (req: Request, res: Response) => {
  try {
    const sort = req.query.sort === "alphabetical" ? "ORDER BY name ASC" : "";
    const artists = await query<RowDataPacket[]>(
      `SELECT id, name, avatar_url AS avatar FROM artists ${sort}`
    );
    res.json(artists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error fetching artists" });
  }
});

// -------------------- Get single artist --------------------
router.get("/:id", async (req: Request, res: Response) => {
  const artistId = req.params.id;
  try {
    // Artist info
    const artistRows = await query(
      `SELECT id, name, bio, follower_count AS followers, avatar_url AS avatar
       FROM artists
       WHERE id = ?`,
      [artistId]
    );

    if (!artistRows.length) return res.status(404).json({ error: "Artist not found" });
    const artist = artistRows[0];

    // Albums
    const albums = await query(
      `SELECT id, title, YEAR(release_date) AS year, cover_url
       FROM albums
       WHERE artist_id = ?
       ORDER BY release_date DESC`,
      [artistId]
    );

    // Singles (songs not in albums)
    const singles = await query(
      `SELECT id, title, duration_text AS duration, created_at AS release_date
       FROM songs
       WHERE primary_artist_id = ? AND album_id IS NULL
       ORDER BY created_at DESC`,
      [artistId]
    );

    // Always send arrays (even if empty)
    res.json({
      ...artist,
      albums: albums || [],
      singles: singles || [],
    });
  } catch (err) {
    console.error("Artist fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// -------------------- Release single --------------------
router.post("/singles", authenticate, upload.single("audio"), async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    const audioUrl = req.file ? `/uploads/${req.file.filename}` : "";

    if (!title) return res.status(400).json({ error: "Missing title" });

    const userId = req.user!.user_id;
    const [artistRows]: any = await db.query("SELECT id FROM artists WHERE user_id = ?", [userId]);
    if (!artistRows.length) return res.status(403).json({ error: "User is not an artist" });
    const artistId = artistRows[0].id;

    const [songRes]: any = await db.query(
      `INSERT INTO songs (title, primary_artist_id, duration_seconds, duration_text, audio_url)
       VALUES (?, ?, 0, '', ?)`,
      [title, artistId, audioUrl]
    );

    res.json({ success: true, songId: songRes.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error releasing single" });
  }
});

// -------------------- Release album --------------------
router.post("/albums", authenticate, upload.any(), async (req: AuthRequest, res: Response) => {
  console.log("=== Album submission payload ===");
  console.log("req.body:", req.body);
  console.log("req.files:", req.files);

  const conn = await db.getConnection();
  try {
    const { title, tracks } = req.body;
    if (!title || !tracks) return res.status(400).json({ error: "Title or tracks missing" });

    let parsedTracks;
    try {
      parsedTracks = JSON.parse(tracks);
    } catch (e) {
      console.error("Error parsing tracks JSON:", e);
      return res.status(400).json({ error: "Invalid tracks format" });
    }

    const userId = req.user!.user_id;
    const [artistRows]: any = await conn.query("SELECT id FROM artists WHERE user_id = ?", [userId]);
    if (!artistRows.length) return res.status(403).json({ error: "User is not an artist" });
    const artistId = artistRows[0].id;

    const files = req.files as Express.Multer.File[];
    console.log("Files array:", files);

    const coverFile = files.find(f => f.fieldname === "cover");
    const coverUrl = coverFile ? `/uploads/${coverFile.filename}` : null;

    await conn.beginTransaction();

    const [albumRes]: any = await conn.query(
      `INSERT INTO albums (artist_id, title, cover_url) VALUES (?, ?, ?)`,
      [artistId, title, coverUrl]
    );
    const albumId = albumRes.insertId;

    for (const [index, t] of parsedTracks.entries()) {
      const fileFieldName = `track_${index}`;
      const audioFile = files.find(f => f.fieldname === fileFieldName);
      const audioUrl = audioFile ? `/uploads/${audioFile.filename}` : null;

      await conn.query(
        `INSERT INTO songs (title, primary_artist_id, album_id, track_number, duration_seconds, duration_text, audio_url)
         VALUES (?, ?, ?, ?, 0, '', ?)`,
        [t.title, artistId, albumId, index + 1, audioUrl]
      );
    }

    await conn.commit();
    res.json({ success: true, albumId });
  } catch (err) {
    await conn.rollback();
    console.error("Album release error:", err);
    res.status(500).json({ error: "DB error releasing album" });
  } finally {
    conn.release();
  }
});

// -------------------- Get all albums --------------------
router.get("/albums", async (req: Request, res: Response) => {
  try {
    const sort = req.query.sort === "recent" ? "ORDER BY created_at DESC" : "";
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT a.id, a.title, ar.name AS artist_name, a.cover_url, a.created_at
       FROM albums a
       JOIN artists ar ON a.artist_id = ar.id
       ${sort}`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error fetching albums" });
  }
});

// Check if current user follows this artist
router.get("/:id/following", async (req: Request, res: Response) => {
  const artistId = Number(req.params.id);
  const userId = Number(req.query.user_id); // ensure number

  if (!userId) return res.json({ following: false });

  try {
    const rows = await query(
      `SELECT * FROM follows WHERE user_id = ? AND artist_id = ?`,
      [userId, artistId]
    );
    res.json({ following: rows.length > 0 });
  } catch (err) {
    console.error("Following check error:", err);
    res.status(500).json({ following: false });
  }
});

// Follow artist
router.post("/:id/follow", async (req: Request, res: Response) => {
  const artistId = Number(req.params.id);
  const userId = Number(req.body.user_id); // ensure number

  if (!userId) return res.status(401).json({ error: "Not logged in" });

  try {
    await query(
      `INSERT IGNORE INTO follows (user_id, artist_id) VALUES (?, ?)`,
      [userId, artistId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ error: "Failed to follow artist" });
  }
});

// Unfollow artist
router.delete("/:id/follow", async (req: Request, res: Response) => {
  const artistId = Number(req.params.id);
  const userId = Number(req.body.user_id); // ensure number

  if (!userId) return res.status(401).json({ error: "Not logged in" });

  try {
    await query(
      `DELETE FROM follows WHERE user_id = ? AND artist_id = ?`,
      [userId, artistId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Unfollow error:", err);
    res.status(500).json({ error: "Failed to unfollow artist" });
  }
});


export default router;
