export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return res.status(500).json({ error: "PINATA_JWT is not configured on the server." });
  }

  try {
    const { pinataContent, pinataMetadata } = req.body;

    if (!pinataContent) {
      return res.status(400).json({ error: "Missing 'pinataContent' in request body." });
    }

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ pinataContent, pinataMetadata }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Pinata upload failed: ${errorText}` });
    }

    const data = await response.json();
    return res.status(200).json({ cid: data.IpfsHash });
  } catch (error) {
    console.error("Pinata proxy error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
