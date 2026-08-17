const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

// Load local .env if available
try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch (e) {
  // In production (Vercel, Render, Railway), env vars are injected natively
}

const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const allowedOrigins = Array.from(new Set([
  clientUrl,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000"
]));

// Resolve static directory dynamically
const primaryPublic = path.join(__dirname, "public");
const fallbackPublic = path.join(__dirname, "../Frontend/dist");
const publicDir = fs.existsSync(primaryPublic) ? primaryPublic : fallbackPublic;

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// URL Normalization for Vercel Serverless Rewrites
app.use((req, res, next) => {
  if (req.url.startsWith("/api")) {
    req.url = req.url.replace(/^\/api(\/index\.js)?/, "") || "/";
  }
  next();
});

// Ensure DB is connected for Vercel serverless requests
app.use(async (req, res, next) => {
  try {
    await db();
    next();
  } catch (err) {
    console.error("DB connection error:", err.message);
    res.status(500).json({ success: false, message: "Database connection failure: " + err.message });
  }
});

// Health Check API
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Backend API is running healthy" });
});

// API Routes
app.use(require("./Routes/auth"));
app.use(require("./Routes/createPost"));
app.use(require("./Routes/user"));

// Static files & Single Page Application (SPA) fallback
app.use(express.static(publicDir));
app.use((req, res, next) =>
  req.method === "GET"
    ? res.sendFile(path.join(publicDir, "index.html"), e => e && next(e))
    : next()
);

// Only listen on port if not running in Vercel serverless runtime
if (!process.env.VERCEL) {
  db().then(() => {
    app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
  }).catch(e => {
    console.error("Unable to start backend server:", e.message);
    process.exit(1);
  });
}

module.exports = app;
