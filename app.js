const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");

process.loadEnvFile(path.join(__dirname, ".env"));

const db = require("./config/db");
const setupSocket = require("./socket");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const client = process.env.CLIENT_URL || "http://localhost:5173";
const publicDir = path.join(__dirname, "public");


//middlewares
app.use(cors({ origin: client, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//routes configuration
app.use(require("./Routes/auth"));
app.use(require("./Routes/createPost"));
app.use(require("./Routes/user"));



app.use(express.static(publicDir));
app.use((req, res, next) =>
  req.method === "GET"
    ? res.sendFile(path.join(publicDir, "index.html"), e => e && next(e))
    : next()
);


//socket configuration
setupSocket(server);


db().then(() => {
  server.listen(PORT, () => console.log(`Server running on ${PORT}`));
}).catch(e => {
  console.error("Unable to start:", e.message);
  process.exit(1);
});
