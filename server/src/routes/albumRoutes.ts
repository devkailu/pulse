import express from "express";
import { query } from "../db"; // <--- import query
const router = express.Router();

// GET /api/albums?sort=recent
router.get("/", async (req, res) => {
  try {
    const sort = req.query.sort === "recent" ? "created_at DESC" : "id ASC";

    // Use parameterized queries or safe string for sorting
    const albums = await query(`SELECT * FROM albums ORDER BY ${sort} LIMIT 50`);
    res.json(albums);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch albums" });
  }
});

export default router;
