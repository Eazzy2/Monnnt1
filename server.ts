import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("verse.db");

// Initialize database
try {
  // For development, if you want to force a clean slate, you could uncomment the next line:
  // db.exec("DROP TABLE IF EXISTS submissions");

  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vocation_id TEXT,
      vocation_title TEXT,
      user_contact TEXT,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Ensure user_contact column exists
  const tableInfo = db.prepare("PRAGMA table_info(submissions)").all() as any[];
  const hasContactColumn = tableInfo.some(col => col.name === 'user_contact');
  
  if (!hasContactColumn) {
    db.exec("ALTER TABLE submissions ADD COLUMN user_contact TEXT");
  }
} catch (error) {
  console.error("Database initialization error:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/submissions", (req, res) => {
    const { vocation_id, vocation_title, user_contact, reason } = req.body;
    if (!vocation_id || !vocation_title || !user_contact || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const stmt = db.prepare(
        "INSERT INTO submissions (vocation_id, vocation_title, user_contact, reason) VALUES (?, ?, ?, ?)"
      );
      stmt.run(vocation_id, vocation_title, user_contact, reason);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to save submission" });
    }
  });

  app.get("/api/submissions", (req, res) => {
    try {
      const submissions = db.prepare("SELECT * FROM submissions ORDER BY created_at DESC").all();
      res.json(submissions);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  app.delete("/api/submissions/:id", (req, res) => {
    const { id } = req.params;
    try {
      const stmt = db.prepare("DELETE FROM submissions WHERE id = ?");
      stmt.run(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to delete submission" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
