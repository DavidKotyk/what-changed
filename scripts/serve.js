import http from 'node:http';
import { readFile } from 'node:fs/promises';
const assets = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/src/app.js': ['src/app.js', 'text/javascript'], '/src/engine.js': ['src/engine.js', 'text/javascript'], '/src/demo.js': ['src/demo.js', 'text/javascript'], '/src/style.css': ['src/style.css', 'text/css'], '/devpost/app-map.html': ['devpost/app-map.html', 'text/html'] };
const port = Number(process.env.PORT || 4173);
const server = http.createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const asset = assets[path];
  if (!asset || req.method !== 'GET') { res.writeHead(404); res.end('Not found'); return; }
  try {
    const body = await readFile(new URL('../' + asset[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': asset[1] + '; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'" });
    res.end(body);
  } catch { res.writeHead(500); res.end('Asset unavailable'); }
});
server.listen(port, '127.0.0.1', () => console.log(`What Changed? running at http://127.0.0.1:${port}`));
