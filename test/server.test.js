import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createStaticServer } from "../server.js";
import { loadSales } from "../public/js/data.js";

const server = createStaticServer();
let baseURL;

before(async () => {
  // Port 0 asks the operating system to choose an available port. Tests can
  // run while your normal development server is already using port 3000.
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseURL = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  // Close our server even when a test fails, so Node can exit cleanly.
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  });
});

test("serves the HTML entry page", async () => {
  const response = await fetch(baseURL);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(await response.text(), /type="module" src="\.\/js\/app.js"/);
});

test("serves browser modules and CSS with the correct content types", async () => {
  for (const [path, contentType] of [
    ["/js/app.js", "text/javascript"], ["/js/data.js", "text/javascript"],
    ["/js/table.js", "text/javascript"], ["/styles.css", "text/css"],
  ]) {
    const response = await fetch(baseURL + path);
    assert.equal(response.status, 200);
    assert.ok(response.headers.get("content-type").startsWith(contentType));
    assert.ok((await response.text()).length > 0);
  }
});

test("the real loader reads the fixture through HTTP", async () => {
  // Unlike the unit tests, this exercises fetch against the actual server.
  const records = await loadSales(baseURL + "/data/sales.json");
  assert.equal(records.length, 6);
  assert.equal(records[0].revenue, 96);
});

test("HEAD returns headers without a response body", async () => {
  const response = await fetch(baseURL, { method: "HEAD" });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
});

test("missing files return 404", async () => {
  assert.equal((await fetch(baseURL + "/missing.json")).status, 404);
});

test("project files and encoded directory traversal are not served", async () => {
  assert.equal((await fetch(baseURL + "/package.json")).status, 404);
  // Encode the slash so the HTTP client does not normalize ../ away first.
  assert.equal((await fetch(baseURL + "/..%2fpackage.json")).status, 403);
});

test("malformed URL encoding returns 400", async () => {
  assert.equal((await fetch(baseURL + "/%ZZ")).status, 400);
});

test("unsupported methods return 405", async () => {
  const response = await fetch(baseURL, { method: "POST" });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
});
