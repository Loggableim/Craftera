'use strict';

/**
 * Craftera Server — Einstiegspunkt (AP-1.1, AP-1.2).
 *
 * Liefert statische Dateien aus `client/` aus und stellt die lokale
 * Registry-API bereit (ab Phase 2).
 *
 * Konfiguration über Umgebungsvariablen:
 *   PORT  — Port, auf dem der Server lauscht (Standard: 3000)
 *   HOST  — Bind-Adresse (Standard: 127.0.0.1)
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const { getDataDir } = require('./dataDir.js');
const { ExperienceRepository } = require('../../platform/experiences/experienceRepository.js');
const { createExperience } = require('../../engine/experience.js');
const { saveProject, loadProject } = require('../../engine/serialization.js');
const { createProject } = require('../../engine/project.js');
const { LocalExperienceRegistry } = require('../../platform/registry/localExperienceRegistry.js');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';

// Wurzelverzeichnis der statischen Client-Dateien.
const CLIENT_DIR = path.resolve(__dirname, '..', '..', 'client');
// Wurzelverzeichnis des Studios.
const STUDIO_DIR = path.resolve(__dirname, '..', '..', 'studio');

// Statische Wurzelverzeichnisse: /studio/* → studio/, sonst → client/.
const STATIC_ROOTS = [
  { prefix: '/studio/', dir: STUDIO_DIR },
  { prefix: '/', dir: CLIENT_DIR },
];

// Experience-Repository auf dem Datenverzeichnis.
const experienceRepo = new ExperienceRepository(getDataDir());
// Lokale Experience-Registry (AP-10.9).
const registry = new LocalExperienceRegistry(getDataDir());

// MIME-Types für die ausgelieferten Dateitypen.
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

/**
 * Liefert eine statische Datei aus dem passenden Wurzelverzeichnis aus.
 * Schützt vor Path-Traversal: aufgelöster Pfad muss innerhalb des Roots liegen.
 */
function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Passendes Wurzelverzeichnis anhand des Präfixes wählen.
  const root = STATIC_ROOTS.find((r) => urlPath.startsWith(r.prefix)) || STATIC_ROOTS[1];
  let relPath = urlPath.slice(root.prefix.length - 1); // führenden '/' behalten

  // Verzeichnis-Anfragen auf index.html mappen.
  if (relPath === '/' || relPath.endsWith('/')) {
    relPath = path.join(relPath, 'index.html');
  }

  const filePath = path.resolve(root.dir, '.' + relPath);

  // Path-Traversal-Schutz: Datei muss innerhalb des Roots liegen.
  if (filePath !== root.dir && !filePath.startsWith(root.dir + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Minimaler Health-Endpoint, damit der Server real verifizierbar ist.
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'craftera', uptime: process.uptime() }));
    return;
  }

  // Test-Endpoint für den API-Client-Helper (AP-1.11).
  // Echo-Endpoint: akzeptiert GET/POST/PUT und gibt die Anfrage zurück.
  if (req.url === '/api/test' && (req.method === 'GET' || req.method === 'POST' || req.method === 'PUT')) {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      let payload = null;
      if (body) {
        try { payload = JSON.parse(body); } catch { payload = body; }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ method: req.method, received: payload }));
    });
    return;
  }

  // REST-API: Experiences (AP-2.7).
  if (req.url === '/api/experiences') {
    if (req.method === 'GET') {
      experienceRepo.list().then((experiences) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(experiences));
      }).catch((err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        let input;
        try {
          input = JSON.parse(body || '{}');
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Ungültiges JSON' }));
          return;
        }
        try {
          const experience = createExperience(input);
          experienceRepo.save(experience).then(() => {
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(experience));
          }).catch((err) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          });
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  // REST-API: Projekt einer Experience (AP-4.8).
  const projectMatch = req.url.match(/^\/api\/experiences\/([^/]+)\/project$/);
  if (projectMatch) {
    const experienceId = decodeURIComponent(projectMatch[1]);
    const projectDir = path.join(getDataDir(), 'projects', experienceId);

    if (req.method === 'GET') {
      loadProject(projectDir).then((project) => {
        if (!project) {
          // Kein Projekt vorhanden → leeres Projekt erzeugen.
          const fresh = createProject({ experienceId });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(fresh));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(project));
      }).catch((err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });
      return;
    }

    if (req.method === 'PUT') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        let project;
        try {
          project = JSON.parse(body || '{}');
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Ungültiges JSON' }));
          return;
        }
        project.experienceId = experienceId;
        saveProject(projectDir, project).then(() => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(project));
        }).catch((err) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        });
      });
      return;
    }

    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  // REST-API: publish/install/play (AP-10.9).
  const actionMatch = req.url.match(/^\/api\/experiences\/([^/]+)\/(publish|install|play)$/);
  if (actionMatch && req.method === 'POST') {
    const experienceId = decodeURIComponent(actionMatch[1]);
    const action = actionMatch[2];

    const handler = {
      publish: () => registry.publish(experienceId),
      install: () => registry.install(experienceId),
      play: () => {
        // Runtime (Godot) ist nicht installiert (AP-10.8 übersprungen).
        return Promise.reject(new Error('Runtime nicht verfügbar (Godot nicht installiert)'));
      },
    }[action];

    handler().then((result) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    }).catch((err) => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // Statische Dateien aus `client/` ausliefern.
  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain' });
  res.end('Method Not Allowed');
});

server.listen(PORT, HOST, () => {
  console.log(`[craftera] Server läuft auf http://${HOST}:${PORT}`);
  console.log(`[craftera] Health-Check: http://${HOST}:${PORT}/health`);
  console.log(`[craftera] Statische Dateien aus: ${CLIENT_DIR}`);
});

// Sauberes Herunterfahren bei SIGINT/SIGTERM.
function shutdown() {
  console.log('[craftera] Server wird beendet …');
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
