import { createServer } from "node:http";
import { Readable } from "node:stream";
import server from "./dist/server/server.js";

const port = Number(process.env.PORT ?? 3000);

const handler = async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : Readable.toWeb(req),
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

createServer(handler).listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
