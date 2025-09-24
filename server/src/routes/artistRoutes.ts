import express, { Request, Response } from "express";
import multer from "multer";
import db, { query } from "../db.js"; // or { db } if you export that way
import { RowDataPacket, OkPacket } from "mysql2";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// -------------------- Get all artists (for discovery) --------------------
router.get("/artists", async (req: Request, res: Response) => {
  try {
    const sort = req.query.sort === "alphabetical" ? "ORDER BY name ASC" : "";
    const artists = await query(`SELECT id, name, avatar_url FROM artists ${sort}`);
    res.json(artists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error fetching artists" });
  }
});

// -------------------- Get single artist (for profile/dashboard) --------------------
router.get("/:id", async (req: Request, res: Response) => {
  const artistId = req.params.id;
  try {
    const [artist] = await query(
      `SELECT id, user_id, name, bio, country, start_year, avatar_url, follower_count, created_at
       FROM artists
       WHERE id = ?`,
      [artistId]
    );

    if (!artist) return res.status(404).json({ message: "Artist not found" });

    // Fetch albums for this artist
    const albums = await query(
      `SELECT id, title, cover_url, created_at
       FROM albums
       WHERE artist_id = ?
       ORDER BY created_at DESC`,
      [artistId]
    );

    res.json({ ...artist, albums });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error fetching artist" });
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


// Get all albums (recent first optional)
router.get("/albums", async (req: Request, res: Response) => {
  try {
    const sort = req.query.sort === "recent" ? "ORDER BY created_at DESC" : "";
    const [rows] = await db.query(`
      SELECT a.id, a.title, ar.name AS artist_name, a.cover_url, a.created_at
      FROM albums a
      JOIN artists ar ON a.artist_id = ar.id
      ${sort}
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error fetching albums" });
  }
});

// -------------------- Get single artist (for profile/dashboard) --------------------
router.get("/:id", async (req: Request, res: Response) => {
  const artistId = req.params.id;
  try {
    // Artist basic info
    const [artistRows] = await db.query<RowDataPacket[]>(
      "SELECT id, name, bio, follower_count AS followers, avatar_url AS avatar FROM artists WHERE id = ?",
      [artistId]
    );
    if (!artistRows.length) return res.status(404).json({ error: "Artist not found" });
    const artist = artistRows[0];

    // Albums
    const [albums] = await db.query<RowDataPacket[]>(
      "SELECT id, title, YEAR(release_date) AS year, cover_url FROM albums WHERE artist_id = ? ORDER BY release_date DESC",
      [artistId]
    );

    // Singles (songs with album_id IS NULL)
    const [singles] = await db.query<RowDataPacket[]>(
      `SELECT id, title, duration_text AS duration, release_date
       FROM songs
       WHERE primary_artist_id = ? AND album_id IS NULL
       ORDER BY release_date DESC`,
      [artistId]
    );

    res.json({ ...artist, albums, singles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
