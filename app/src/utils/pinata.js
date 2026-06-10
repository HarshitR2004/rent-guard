/**
 * Uploads an array of base64 data-URL images as a JSON bundle via the serverless proxy.
 * Returns the CID string.
 */
export async function uploadImagesToPinata(images, label = "evidence") {
  // Extract raw base64 data from each image
  const imagePayloads = images.map((img, index) => {
    const url = img?.url || img;
    return { index, data: url };
  });

  const response = await fetch("/api/pinata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pinataContent: {
        type: label,
        timestamp: new Date().toISOString(),
        images: imagePayloads,
      },
      pinataMetadata: {
        name: `${label}-${Date.now()}`,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed (${response.status})`);
  }

  const result = await response.json();
  return result.cid;
}

/**
 * Uploads an AI inspection report JSON object via the serverless proxy.
 * Returns the CID string.
 */
export async function uploadReportToPinata(reportObj) {
  const response = await fetch("/api/pinata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pinataContent: reportObj,
      pinataMetadata: {
        name: `inspection-report-${Date.now()}`,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed (${response.status})`);
  }

  const result = await response.json();
  return result.cid;
}
