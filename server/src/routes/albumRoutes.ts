import express from "express";
import { query } from "../db";
const router = express.Router();

// GET /api/albums?sort=recent
router.get("/", async (req, res) => {
  try {
    const sort = req.query.sort === "recent" ? "a.created_at DESC" : "a.id ASC";

    const albums = await query(
      `
      SELECT 
        a.id,
        a.title,
        a.cover_url,
        a.created_at,
        ar.name AS artist_name
      FROM albums a
      JOIN artists ar ON a.artist_id = ar.id
      ORDER BY ${sort}
      LIMIT 50
      `
    );

    res.json(albums);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch albums" });
  }
});

// GET /api/albums/:id
router.get("/:id", async (req, res) => {
  const albumId = Number(req.params.id);
  if (!albumId) return res.status(400).json({ error: "Invalid album ID" });

  try {
    // Album info + artist
    const albumRows = await query(
      `SELECT a.id, a.title, a.cover_url, YEAR(a.release_date) AS year,
              ar.id AS artist_id, ar.name AS artist_name
       FROM albums a
       JOIN artists ar ON a.artist_id = ar.id
       WHERE a.id = ?`,
      [albumId]
    );

    if (!albumRows.length) return res.status(404).json({ error: "Album not found" });
    const album = albumRows[0];

    // Tracks + artists
    const tracks = await query(
      `SELECT 
          s.id,
          s.title,
          s.duration_text AS duration,
          s.audio_url,
          GROUP_CONCAT(ar.name ORDER BY sa.role SEPARATOR ', ') AS artists
       FROM songs s
       LEFT JOIN song_artists sa ON sa.song_id = s.id
       LEFT JOIN artists ar ON ar.id = sa.artist_id
       WHERE s.album_id = ?
       GROUP BY s.id
       ORDER BY s.track_number ASC`,
      [albumId]
    );

    // Format each track's artists as an array
    const formattedTracks = tracks.map((t: any) => ({
      id: t.id,
      title: t.title,
      duration: t.duration,
      audio_url: t.audio_url,
      artists: t.artists ? t.artists.split(", ") : [album.artist_name],
    }));

    res.json({ ...album, tracks: formattedTracks });
  } catch (err) {
    console.error("Album fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
