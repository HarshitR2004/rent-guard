const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Load .env.local or .env from various possible locations for robustness
const rootEnvPath = path.resolve(__dirname, "../../.env.local");
const frontendEnvPath = path.resolve(__dirname, "../../frontend/.env.local");
const backendEnvPath = path.resolve(__dirname, "../.env");
const backendEnvLocalPath = path.resolve(__dirname, "../.env.local");

if (fs.existsSync(backendEnvLocalPath)) {
  dotenv.config({ path: backendEnvLocalPath });
} else if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else if (fs.existsSync(frontendEnvPath)) {
  dotenv.config({ path: frontendEnvPath });
} else {
  dotenv.config();
}
