export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
  }

  try {
    const { parts } = req.body;

    if (!parts || !Array.isArray(parts)) {
      return res.status(400).json({ error: "Missing 'parts' array in request body." });
    }

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
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Gemini API error: ${errorText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Gemini proxy error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
