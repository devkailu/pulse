import express, { Request, Response } from "express";
import multer from "multer";
import db from "../db.js"; // or { db } if you export that way

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Get all artists
router.get("/artists", async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT id, name FROM artists");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error fetching artists" });
  }
});

// Release single
router.post("/singles", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    const { title, primary_artist_id, collaborators } = req.body;
    const audioUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const [songRes]: any = await db.query(
      `INSERT INTO songs (title, primary_artist_id, duration_seconds, duration_text, audio_url)
       VALUES (?, ?, 0, '', ?)`,
      [title, primary_artist_id, audioUrl]
    );
    const songId = songRes.insertId;

    if (collaborators) {
      const parsed = JSON.parse(collaborators);
      for (const collab of parsed) {
        await db.query(
          `INSERT INTO song_artists (song_id, artist_id, role) VALUES (?, ?, ?)`,
          [songId, collab.artist_id, collab.role]
        );
      }
    }

    res.json({ success: true, songId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error releasing single" });
  }
});

// Release album
router.post("/albums", upload.single("cover"), async (req: Request, res: Response) => {
  const conn = await db.getConnection();
  try {
    const { title, artist_id, tracks } = req.body;
    const coverUrl = req.file ? `/uploads/${req.file.filename}` : null;

    await conn.beginTransaction();

    const [albumRes]: any = await conn.query(
      `INSERT INTO albums (artist_id, title, cover_url) VALUES (?, ?, ?)`,
      [artist_id, title, coverUrl]
    );
    const albumId = albumRes.insertId;

    const parsedTracks = JSON.parse(tracks);
    for (const [index, t] of parsedTracks.entries()) {
      const [songRes]: any = await conn.query(
        `INSERT INTO songs (title, primary_artist_id, album_id, track_number, duration_seconds, duration_text, audio_url)
         VALUES (?, ?, ?, ?, 0, '', ?)`,
        [t.title, artist_id, albumId, index + 1, t.audio_url]
      );
      const songId = songRes.insertId;

      if (t.collaborators) {
        for (const collab of t.collaborators) {
          await conn.query(
            `INSERT INTO song_artists (song_id, artist_id, role) VALUES (?, ?, ?)`,
            [songId, collab.artist_id, collab.role]
          );
        }
      }
    }

    await conn.commit();
    res.json({ success: true, albumId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "DB error releasing album" });
  } finally {
    conn.release();
  }
});

export default router;
