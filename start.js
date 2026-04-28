import { createServer } from "node:http";
import { Readable } from "node:stream";
import { promises as fs } from "node:fs";
import path from "node:path";
import server from "./dist/server/server.js";

const port = Number(process.env.PORT ?? 3000);
const clientDist = path.resolve(process.cwd(), "dist/client");

const mimeTypes = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
};

async function serveStaticAsset(urlPath, res) {
  if (urlPath === "/" || urlPath === "/index.html") return false;

  const decodedPath = decodeURIComponent(urlPath);
  const filePath = path.resolve(clientDist, decodedPath.slice(1));
  if (!filePath.startsWith(clientDist)) return false;

  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) return false;
  } catch {
    return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";
  const body = await fs.readFile(filePath);

  res.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": body.length,
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  res.end(body);
  return true;
}

const handler = async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (await serveStaticAsset(url.pathname, res)) {
      return;
    }

    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : Readable.toWeb(req),
      duplex: "half",
    });

    const response = await server.fetch(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));

    if (response.body) {
      Readable.fromWeb(response.body).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
};

export default handler;

import { fileURLToPath } from 'node:url';

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  createServer(handler).listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
