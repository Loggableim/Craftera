'use strict';

/**
 * Craftera Server — Einstiegspunkt (AP-1.1).
 *
 * Startet einen minimalen HTTP-Server, der einen Port bindet und ein
 * Start-Log ausgibt. Statisches File-Serving aus `client/` folgt in AP-1.2.
 *
 * Konfiguration über Umgebungsvariablen:
 *   PORT  — Port, auf dem der Server lauscht (Standard: 3000)
 *   HOST  — Bind-Adresse (Standard: 127.0.0.1)
 */

const http = require('node:http');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';

const server = http.createServer((req, res) => {
  // Minimaler Health-Endpoint, damit der Server real verifizierbar ist.
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'craftera', uptime: process.uptime() }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, HOST, () => {
  console.log(`[craftera] Server läuft auf http://${HOST}:${PORT}`);
  console.log(`[craftera] Health-Check: http://${HOST}:${PORT}/health`);
});

// Sauberes Herunterfahren bei SIGINT/SIGTERM.
function shutdown() {
  console.log('[craftera] Server wird beendet …');
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
