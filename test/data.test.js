// Node supplies both the test runner and assertion helpers; no library needed.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadSales, validateSales } from "../public/js/data.js";

const fixture = JSON.parse(await readFile(
  new URL("../public/data/sales.json", import.meta.url), "utf8",
));

test("the real fixture contains six valid sales records", () => {
  assert.equal(validateSales(fixture).length, 6);
  assert.equal(fixture[0].product, "Notebook");
});

test("zero sales and an empty dataset are valid", () => {
  assert.deepEqual(validateSales([]), []);
  assert.deepEqual(validateSales([fixture[5]]), [fixture[5]]);
});

test("invalid shapes and field values are rejected", () => {
  assert.throws(() => validateSales({ records: [] }), /must be an array/);
  // Each copy changes one field so we know which rule is being exercised.
  for (const invalid of [null, {}, { ...fixture[0], units: -1 },
    { ...fixture[0], units: 1.5 }, { ...fixture[0], revenue: "96" },
    { ...fixture[0], revenue: Infinity }, { ...fixture[0], product: " " }]) {
    assert.throws(() => validateSales([invalid]), /record 1/);
  }
});

test("loadSales fetches and parses JSON", async (t) => {
  // A mock replaces network access for this test only. Node restores it
  // afterward, so other tests can still use the real fetch function.
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    new Response(JSON.stringify(fixture), { status: 200 }));
  assert.deepEqual(await loadSales("/data/sales.json"), fixture);
  assert.equal(fetchMock.mock.calls[0].arguments[0], "/data/sales.json");
});

test("loadSales accepts an empty JSON array", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("[]"));
  assert.deepEqual(await loadSales("/data/sales.json"), []);
});

test("loadSales reports an HTTP failure", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("Not found", { status: 404 }));
  // rejects is the async counterpart of throws: await it to test a Promise.
  await assert.rejects(loadSales("/missing.json"), /HTTP 404/);
});

test("loadSales rejects malformed JSON", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("not JSON"));
  await assert.rejects(loadSales("/data/sales.json"), SyntaxError);
});

test("loadSales rejects JSON with invalid fields", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response('[{"units": 1}]'));
  await assert.rejects(loadSales("/data/sales.json"), /invalid fields/);
});

test("loadSales propagates a network failure", async (t) => {
  t.mock.method(globalThis, "fetch", async () => { throw new TypeError("Network unavailable"); });
  await assert.rejects(loadSales("/data/sales.json"), /Network unavailable/);
});
