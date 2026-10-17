# JavaScript analytics dashboard

A beginner-friendly starting point for **days 1–3, “Initial scope and setup”** in [JAVASCRIPT_README.md](JAVASCRIPT_README.md). It loads one local JSON dataset and displays one table using native browser APIs. Application code, CSS, server code, and tests contain comments explaining the main decisions.

This is the baseline for the later exercises. Filtering, aggregation, multiple widgets, saved layouts, undo/redo, and the design-pattern assignments are still future work. There are no frameworks, charting libraries, build tools, or third-party dependencies.

## Run it

You need **Node.js 22 or newer**, npm (included with Node), and a modern browser.

From the project directory:

```sh
node --version
npm start
```

Open **http://127.0.0.1:3000**. You should see “Loaded 6 sales records.” and a five-column sales table. Revenue is displayed in US dollars. All records are fictional.

No `npm install` or build step is needed. `npm start` simply runs `node server.js`; `npm test` runs `node --test`. If you use pnpm, `pnpm start` and `pnpm test` run the same scripts.

Press **Ctrl+C** in the terminal to stop the server. To use another port in zsh/bash:

```sh
PORT=3001 npm start
```

Open the HTTP address instead of double-clicking `index.html`: browser modules and `fetch` need a suitable server origin. The server only listens on your own machine and only serves files from `public/`.

## Project map

```text
public/
  index.html          Page structure and module entry point
  styles.css          Layout, table styling, and narrow-screen scrolling
  data/sales.json     The single sample dataset
  js/
    app.js            Connects loading, rendering, and status messages
    data.js           Fetches JSON and checks the fields we need
    table.js          Creates a table with native DOM APIs
server.js             Small local HTTP server using Node built-ins
test/
  data.test.js        Data validation and loading tests
  server.test.js      HTTP and loader/server integration tests
package.json          ES module setting and commands
JAVASCRIPT_README.md   Full training plan
```

## Follow the code

Read the files in this order:

1. **`public/index.html`** defines the page, a status message, and an empty table container. Its `<script type="module">` loads `app.js` after HTML parsing.
2. **`public/js/app.js`** imports two functions. `import` makes another module's exported code available without putting everything in global variables. The entry module starts the dashboard once.
3. **`public/js/data.js`** uses `fetch` to request the fixture over HTTP. `await` waits for a Promise inside an `async` function. It checks the HTTP status, parses JSON, then validates its shape. A 404 needs an explicit check because `fetch` does not reject just because a server returned an error status.
4. **`public/js/table.js`** builds `table`, `thead`, `tbody`, and cell elements using `document.createElement`. `append` connects these elements. `textContent` inserts values as text, so HTML-looking dataset values are not interpreted as markup. `Intl.NumberFormat` formats the revenue.
5. Back in **`app.js`**, `replaceChildren` inserts the finished table. A `try`/`catch` displays a useful message when loading or validation fails. An empty dataset renders a “No sales records yet.” row.
6. **`server.js`** runs in Node, separately from the browser. It maps URL paths to files under `public/` and sends the right content type so the browser recognizes HTML, JavaScript, CSS, and JSON.
7. **`test/`** shows how to check results with Node's built-in test runner and assertions. Unit tests replace `fetch` temporarily; integration tests run the real loader against a temporary local server.

The data flow is:

```text
index.html → app.js → fetch sales.json → validate records
                   → create table → insert into the page
                   → show an error message if any step fails
```

Functions and modules are enough for this initial scope. This gives later pattern exercises a small working implementation to compare against before adding abstractions.

## Understand and edit the dataset

`public/data/sales.json` contains an array of objects. Each object represents one sales record:

```json
{
  "date": "2026-10-01",
  "product": "Notebook",
  "region": "West",
  "units": 12,
  "revenue": 96
}
```

- `date`, `product`, and `region` must be nonempty strings. Dates are displayed as supplied; this starter does not validate calendar dates.
- `units` must be a nonnegative integer.
- `revenue` must be a finite, nonnegative number in US dollars, not a formatted string.
- `[]` is a valid empty dataset. Every record must pass validation before any rows render.

JSON requires double-quoted property names and strings, and does not allow comments or trailing commas. Explanations belong here or in JavaScript files.

Edit a product or revenue value, save, and reload the page to see the change. There is no automatic reload. If you deliberately change the fixture, update any tests that assert its exact sample values.

## Check the project

```sh
npm test
```

The automated tests cover valid and empty data, zero values, invalid fields, malformed JSON, HTTP/network failures, entry-page and asset serving, real HTTP fixture loading, missing files, unsupported methods, malformed URLs, and attempts to read outside the public directory. Tests choose their own available port and close their server afterward.

Node does not provide a browser DOM. These tests verify data and HTTP behavior; they do **not** execute the table renderer in a browser. Use these manual checks for the page:

1. Start the server and open the page. Confirm six rows, five column headings, and `$96.00` in the first revenue cell.
2. Narrow the window. Confirm the table can scroll horizontally without widening the entire page.
3. Temporarily replace the fixture contents with `[]`, save, and reload. Confirm “Loaded 0 sales records.” and “No sales records yet.”
4. Temporarily make the JSON invalid, save, and reload. Confirm an error replaces the loading message. Restore the original fixture afterward and run `npm test` again.
5. Open browser developer tools. The Network panel should show local requests for the modules, stylesheet, and JSON; the Console should be clear on a successful load.

If the page cannot connect, check that the server is running. If port 3000 is already in use, choose another port as shown above. If loading fails, check the status message, browser console, and JSON syntax.

## Written resources

Read these alongside the files they explain. These are articles and documentation, not video assignments.

| Topic | Reading | Connect it to this project |
| --- | --- | --- |
| HTML tables | [MDN: HTML table basics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_table_basics) | Understand rows, header cells, and captions in `table.js`. |
| CSS | [MDN: CSS styling basics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics) | Follow selectors, the box model, and styling in `styles.css`. |
| ES modules | [MDN: JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) | Understand `import`, `export`, and module scripts. |
| DOM | [MDN: Introduction to the DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction) | Learn how JavaScript creates and changes page elements. |
| JSON | [MDN: Working with JSON](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON) | Understand the fixture format and parsing. |
| Asynchronous code | [MDN: Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) | Understand why loading completes after startup begins. |
| Fetch | [MDN: Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) | Follow HTTP status checks and `response.json()`. |
| Tests | [Node.js: Test runner](https://nodejs.org/api/test.html) | Read about `node --test`, hooks, and mocks. |
| Assertions | [Node.js: Assert](https://nodejs.org/api/assert.html) | Understand how tests compare actual and expected results. |
| Local server | [Node.js: HTTP](https://nodejs.org/api/http.html) | Look up `createServer`, requests, and responses used by `server.js`. |

For the later pattern blocks, keep the training plan's required references handy: Gamma, Helm, Johnson, and Vlissides, *Design Patterns: Elements of Reusable Object-Oriented Software* (a book); [Refactoring.Guru's pattern catalog](https://refactoring.guru/design-patterns); and [Pattern Garden](https://designpatterns.guru/). Supplemental topics use [Fowler's enterprise pattern catalog](https://martinfowler.com/eaaCatalog/) and official platform documentation as directed in the plan.

For active practice, trace one row from JSON to its table cells, explain why an HTTP 404 needs a check, and try the empty-data and failure checks above. Before adding a pattern in the next block, describe the concrete problem this baseline has and compare the pattern with a simpler change.
