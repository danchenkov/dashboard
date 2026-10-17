// Node runs this file; the browser runs the modules under public/js/.
// All imports below are built into Node, so no npm install is necessary.
import { createServer } from "node:http";
import { readFile, realpath } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Resolve from this file so starting Node in another directory still works.
const publicDirectory = fileURLToPath(new URL("./public/", import.meta.url));
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

// Exporting server creation lets tests start/stop their own server.
export function createStaticServer() {
  return createServer(async (request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end("Method not allowed");
      return;
    }

    try {
      // Remove the query string and decode URL characters, such as %20.
      const pathname = decodeURIComponent(request.url.split("?")[0]);
      const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
      const root = await realpath(publicDirectory);
      const candidate = resolve(root, relativePath);
      // Never serve project files outside public/, even for a ../ request.
      if (!candidate.startsWith(root + sep)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      // realpath also prevents a symbolic link from escaping public/.
      const filePath = await realpath(candidate);
      if (!filePath.startsWith(root + sep)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      const contents = await readFile(filePath);
      response.writeHead(200, {
        "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
        "Cache-Control": "no-store", // Show fixture/code edits on the next reload.
      });
      response.end(request.method === "HEAD" ? undefined : contents);
    } catch (error) {
      const status = error instanceof URIError ? 400
        : ["ENOENT", "ENOTDIR", "EISDIR"].includes(error.code) ? 404 : 500;
      response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(status === 404 ? "Not found" : status === 400 ? "Bad request" : "Server error");
    }
  });
}

// Importing this module in tests should not start a long-running server.
// This condition is true only when invoked directly: node server.js.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error("PORT must be an integer between 0 and 65535.");
  }
  const server = createStaticServer();
  server.on("error", (error) => {
    console.error(`Could not start the local server: ${error.message}`);
    process.exitCode = 1;
  });
  // Bind to loopback: this learning server is for use on your own machine.
  server.listen(port, "127.0.0.1", () => {
    console.log(`Dashboard: http://127.0.0.1:${server.address().port}`);
    console.log("Press Ctrl+C to stop.");
  });
}
