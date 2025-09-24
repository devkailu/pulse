import express from "express";
import { query } from "../db"; // <--- import query
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


export default router;
