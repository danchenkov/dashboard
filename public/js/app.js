import { loadSales } from "./data.js";
import { createSalesTable } from "./table.js";

// This entry module connects the data loader to the table renderer.
// The IDs match the placeholders in index.html.
const status = document.querySelector("#status");
const container = document.querySelector("#table-container");

async function startDashboard() {
  try {
    // Resolve relative to this module, rather than the page's current URL.
    const url = new URL("../data/sales.json", import.meta.url);
    const records = await loadSales(url);
    container.replaceChildren(createSalesTable(records));
    status.textContent = `Loaded ${records.length} sales record${records.length === 1 ? "" : "s"}.`;
  } catch (error) {
    // Show a useful failure message instead of leaving "Loading…" forever.
    status.textContent = `Unable to display sales. ${error.message}`;
    status.classList.add("error");
    console.error("Dashboard startup failed:", error);
  }
}

// Calling an async function starts it; its awaited work completes later.
startDashboard();
