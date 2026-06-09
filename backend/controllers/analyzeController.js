const { fetchImageBase64 } = require("../utils/image");

/**
 * Compare move-in and move-out images using Gemini Vision API.
 * POST /api/analyze
 */
async function analyzeEvidence(req, res) {
  try {
    const { moveInImages, moveOutImages } = req.body;

    if (!moveInImages || !moveOutImages) {
      return res.status(400).json({ error: "Missing moveInImages or moveOutImages" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured. Falling back to mock comparison result.");
      return res.json({
        damageFound: true,
        damageDescription: "Broken ceiling fan",
        estimatedRepairCost: 150,
        mock: true,
      });
    }

    console.log("Downloading move-in and move-out images...");
    const moveInParts = await Promise.all(
      moveInImages.map((img) => fetchImageBase64(img.url || img)),
    );
    const moveOutParts = await Promise.all(
      moveOutImages.map((img) => fetchImageBase64(img.url || img)),
    );

    const validMoveInParts = moveInParts.filter(Boolean);
    const validMoveOutParts = moveOutParts.filter(Boolean);

    if (validMoveInParts.length === 0 && validMoveOutParts.length === 0) {
      console.warn("Could not download any images. Falling back to mock comparison.");
      return res.json({
        damageFound: true,
        damageDescription: "Broken ceiling fan",
        estimatedRepairCost: 150,
        mock: true,
      });
    }

    const parts = [
      {
        text: `You are a rental property inspector.
Compare the move-in evidence (first set of photos) and the move-out evidence (second set of photos).
Identify if there are any new damages, broken fixtures, or missing items in the move-out evidence that were not present in the move-in evidence.
Ignore lighting changes, camera angle changes, image quality changes, and normal wear and tear.

Return structured JSON specifying:
- damageFound (boolean)
- damageDescription (string describing the damage or "No new damage found")
- estimatedRepairCost (integer representing cost in local currency units, e.g. 150, or 0 if none)

Respond ONLY with the JSON object.`,
      },
    ];

    parts.push({ text: "--- MOVE-IN EVIDENCE ---" });
    validMoveInParts.forEach((p) => {
      parts.push({ inlineData: { mimeType: p.mimeType, data: p.data } });
    });

    parts.push({ text: "--- MOVE-OUT EVIDENCE ---" });
    validMoveOutParts.forEach((p) => {
      parts.push({ inlineData: { mimeType: p.mimeType, data: p.data } });
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                damageFound: { type: "BOOLEAN" },
                damageDescription: { type: "STRING" },
                estimatedRepairCost: { type: "INTEGER" },
              },
              required: ["damageFound", "damageDescription", "estimatedRepairCost"],
            },
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const result = JSON.parse(resultText.trim());

    return res.json(result);
  } catch (error) {
    console.error("Gemini Vision analysis error:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze evidence with Gemini Vision",
    });
  }
}

module.exports = {
  analyzeEvidence,
};
