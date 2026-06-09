/**
 * Helper to fetch a web image URL or parse a data URI, returning raw Base64 data and mimeType.
 * @param {string} url - The URL or base64 data URI of the image.
 * @returns {Promise<{mimeType: string, data: string}|null>}
 */
async function fetchImageBase64(url) {
  if (url.startsWith("data:")) {
    const matches = url.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-\.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return { mimeType: matches[1], data: matches[2] };
    }
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      mimeType: response.headers.get("content-type") || "image/jpeg",
      data: buffer.toString("base64"),
    };
  } catch (error) {
    console.error(`Error fetching image ${url}:`, error);
    return null;
  }
}

module.exports = {
  fetchImageBase64,
};
