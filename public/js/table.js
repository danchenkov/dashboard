// This module uses native DOM APIs: the browser's tools for building HTML.
export function createSalesTable(records) {
  const table = document.createElement("table");
  const caption = document.createElement("caption");
  caption.textContent = "Sample sales · revenue in US dollars (USD)";
  table.append(caption);

  const head = document.createElement("thead");
  const headerRow = document.createElement("tr");
  for (const label of ["Date", "Product", "Region", "Units", "Revenue (USD)"]) {
    const heading = document.createElement("th");
    heading.scope = "col"; // Associates the heading with cells in its column.
    heading.textContent = label;
    headerRow.append(heading);
  }
  head.append(headerRow);
  table.append(head);

  const body = document.createElement("tbody");
  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  for (const record of records) {
    const row = document.createElement("tr");
    const values = [record.date, record.product, record.region, record.units,
      currency.format(record.revenue)];
    for (const value of values) {
      const cell = document.createElement("td");
      // textContent treats values as text, even if they contain HTML-looking
      // characters. Never insert dataset values using innerHTML.
      cell.textContent = String(value);
      row.append(cell);
    }
    body.append(row);
  }

  if (records.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5; // One message occupies the width of all five columns.
    cell.textContent = "No sales records yet.";
    row.append(cell);
    body.append(row);
  }
  table.append(body);
  // Return the finished element; the caller decides where to put it.
  return table;
}
