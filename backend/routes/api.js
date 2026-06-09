const express = require("express");
const router = express.Router();

const { analyzeEvidence } = require("../controllers/analyzeController");
const { registerDeposit, recordInspection } = require("../controllers/monadController");

// API Route Bindings
router.post("/analyze", analyzeEvidence);
router.post("/move-in", registerDeposit);
router.post("/record-inspection", recordInspection);

module.exports = router;
