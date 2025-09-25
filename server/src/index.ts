import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { upload, uploadsDir } from "./upload";

import { query } from "./db";
import artistRoutes from "./routes/artistRoutes";
import albumRoutes from "./routes/albumRoutes";
import playlistRoutes from "./routes/playlistRoutes";
import userRoutes from "./routes/userRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());

const CLIENT = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", CLIENT);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use("/uploads", express.static(uploadsDir));

const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// -------------------- Routes --------------------
app.use("/api/artists", artistRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/users", userRoutes);

// -------------------- Helpers --------------------
async function findUserByUsernameOrEmail(identifier: string) {
  const rows = await query(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [identifier, identifier]
  );
  return rows[0];
}

// -------------------- Auth Routes --------------------
interface SignupUserPayload {
  username: string;
  email: string;
  password: string;
  display_name?: string;
  subscription_id?: number;
  avatar_url?: string;
}

interface SignupArtistPayload {
  username: string;
  email: string;
  password: string;
  stage_name: string;
  bio?: string;
  country?: string;
  start_year?: number;
  avatar_url?: string;
}

// Signup User
app.post("/api/auth/signup-user", upload.single("avatar"), async (req: Request, res: Response) => {
  const { username, email, password, display_name, subscription_id } = req.body;
  const avatar_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!username || !email || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const existing = await query("SELECT id FROM users WHERE username = ? OR email = ?", [username, email]);
    if (existing.length) return res.status(400).json({ message: "Username or Email already exists" });

    const password_hash = await bcrypt.hash(password, 12);

    await query(
      `INSERT INTO users (username, email, password_hash, display_name, subscription_id, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, password_hash, display_name || null, subscription_id || null, avatar_url]
    );

    const user = await findUserByUsernameOrEmail(username);
    const token = jwt.sign({ user_id: user.id, role: "user" }, JWT_SECRET, { expiresIn: "2h" });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

    const safeUser = { ...user, avatar_url };
    delete safeUser.password_hash;
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// Signup Artist
app.post("/api/auth/signup-artist", upload.single("avatar"), async (req: Request, res: Response) => {
  const { username, email, password, stage_name, bio, country, start_year } = req.body;
  const avatar_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!username || !email || !password || !stage_name)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const existing = await query("SELECT id FROM users WHERE username = ? OR email = ?", [username, email]);
    if (existing.length) return res.status(400).json({ message: "Username or Email already exists" });

    const password_hash = await bcrypt.hash(password, 12);

    await query(
      `INSERT INTO users (username, email, password_hash, display_name)
       VALUES (?, ?, ?, ?)`,
      [username, email, password_hash, stage_name]
    );

    const user = await findUserByUsernameOrEmail(username);

    const result: any = await query(
      `INSERT INTO artists (user_id, name, bio, country, start_year, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, stage_name, bio || null, country || null, start_year || null, avatar_url]
    );

    const artistId = result.insertId;
    const artist = (await query("SELECT * FROM artists WHERE id = ?", [artistId]))[0];

    const token = jwt.sign({ user_id: user.id, role: "artist" }, JWT_SECRET, { expiresIn: "2h" });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

    const safeUser = { ...user };
    delete safeUser.password_hash;
    res.json({ user: safeUser, artist, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// Login
interface LoginPayload {
  usernameOrEmail: string;
  password: string;
  accountType?: "user" | "artist";
}

// Login
app.post("/api/auth/login", async (req: Request<{}, {}, LoginPayload>, res: Response) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) 
    return res.status(400).json({ message: "Missing fields" });

  try {
    const user = await findUserByUsernameOrEmail(usernameOrEmail);
    if (!user) return res.status(400).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid password" });

    // Determine avatar_url: check artist first, fallback to user
    let avatar_url = user.avatar_url || null;
    const artistRow = await query("SELECT avatar_url FROM artists WHERE user_id = ?", [user.id]);
    if (artistRow.length && artistRow[0].avatar_url) avatar_url = artistRow[0].avatar_url;

    // Sign JWT
    const token = jwt.sign({ user_id: user.id, role: user.role || "user" }, JWT_SECRET, { expiresIn: "2h" });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

    const safeUser = { ...user, avatar_url };
    delete safeUser.password_hash;

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});


// Me
app.get("/api/auth/me", async (req: Request, res: Response) => {
  const token =
    req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const user = (await query("SELECT * FROM users WHERE id = ?", [payload.user_id]))[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    let avatar_url = user.avatar_url || null;

    // If artist, get artist avatar
    const artistRow = await query("SELECT avatar_url FROM artists WHERE user_id = ?", [user.id]);
    if (artistRow.length && artistRow[0].avatar_url) avatar_url = artistRow[0].avatar_url;

    const safeUser = { ...user, avatar_url };
    delete safeUser.password_hash;

    res.json({ user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
});



// Logout
app.post("/api/auth/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ ok: true });
});


// -------------------- Start server --------------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
