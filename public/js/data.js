// This module handles data, with no knowledge of HTML or table elements.
// A fixture is a small, predictable sample of data used for learning/testing.
export function validateSales(records) {
  if (!Array.isArray(records)) {
    throw new Error("Sales data must be an array of records.");
  }

  // Check the fields the table needs at the boundary where data enters the app.
  // Valid JSON alone does not guarantee that its values have the right types.
  for (const [index, record] of records.entries()) {
    const isText = (value) => typeof value === "string" && value.trim() !== "";
    if (
      record === null || typeof record !== "object" ||
      !isText(record.date) || !isText(record.product) || !isText(record.region) ||
      !Number.isInteger(record.units) || record.units < 0 ||
      !Number.isFinite(record.revenue) || record.revenue < 0
    ) {
      // Human-readable row numbers start at 1; array indexes start at 0.
      throw new Error(`Sales record ${index + 1} has missing or invalid fields.`);
    }
  }
  // An empty array is valid: an empty dataset is different from broken data.
  return records;
}

export async function loadSales(url) {
  // fetch returns a Promise. await pauses this function until it settles;
  // the browser can keep doing other work while the request is in progress.
  const response = await fetch(url);
  // fetch does not throw for HTTP failures such as 404, so check explicitly.
  if (!response.ok) {
    throw new Error(`Could not load sales data (HTTP ${response.status}).`);
  }
  // json() reads and parses the response body. Invalid JSON throws an error.
  const records = await response.json();
  return validateSales(records);
}
