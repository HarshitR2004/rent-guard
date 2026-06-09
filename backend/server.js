// Load environment variables config first
require("./config/env");

const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Mount API router
app.use("/api", apiRouter);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Rent Guard backend running on http://localhost:${PORT}`);
  console.log(`   Proxied from Vite frontend at /api/*`);
});
