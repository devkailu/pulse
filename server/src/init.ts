// server/src/init.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import express from "express";
dotenv.config();

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const sqlPath = path.join(__dirname, "migrations", "001_init.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    // If you set DB_NAME in .env, migrations will run in that DB.
    // If you prefer to let the SQL file do a "CREATE DATABASE" / "USE" step,
    // set DB_NAME in your environment or leave undefined.
    database: process.env.DB_NAME || undefined,
    multipleStatements: true,
  });

  try {
    console.log("Loaded SQL length:", sql.length);
    console.log("First 200 chars:\n", sql.slice(0, 200));
    await conn.query(sql);
    console.log("Migrations applied ✅");
  } catch (err: any) {
    console.error("Migration error (RAW JSON):");
    try {
      console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    } catch {
      console.error(err);
    }

    console.error("Inspect full object:");
    console.dir(err, { depth: null, showHidden: true });

    console.error("Keys:", Object.keys(err));
    console.error("Constructor:", err?.constructor?.name);
    console.error("Prototype:", Object.getPrototypeOf(err));

    process.exit(1);
  } finally {
    await conn.end();
  }
}

runMigrations().catch((e) => {
  console.error("runMigrations() failed:", e);
  process.exit(1);
});
