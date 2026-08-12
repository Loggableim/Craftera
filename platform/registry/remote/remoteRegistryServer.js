'use strict';

/**
 * Craftera Remote-Registry-Server (AP-15.1).
 *
 * HTTP-Server, der die Remote-Registry-API bereitstellt. Persistiert
 * Experiences und Registry-Einträge serverseitig unter `<dataDir>`.
 * Der Client (`RemoteExperienceRegistry`) spricht dieses HTTP-Interface.
 *
 * Endpoints:
 *   GET  /api/experiences            → Liste (nur public)
 *   GET  /api/experiences?search=q   → Suche
 *   POST /api/experiences            → Experience anlegen
 *   POST /api/experiences/:id/publish → publizieren
 *   POST /api/experiences/:id/install → installieren
 *   PUT  /api/experiences/:id/visibility → Sichtbarkeit setzen
 *   DELETE /api/experiences/:id      → entfernen
 */

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { ExperienceRepository } = require('../../experiences/experienceRepository.js');
const { createExperience } = require('../../../engine/experience.js');
const { LocalExperienceRegistry } = require('../localExperienceRegistry.js');

class RemoteRegistryServer {
  /**
   * @param {string} dataDir - Server-seitiges Datenverzeichnis.
   */
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.experienceRepo = new ExperienceRepository(dataDir);
    this.registry = new LocalExperienceRegistry(dataDir);
  }

  /** Startet den HTTP-Server. */
  listen(port, host = '127.0.0.1') {
    this.server = http.createServer((req, res) => this._handle(req, res));
    return new Promise((resolve) => {
      this.server.listen(port, host, () => resolve(this.server.address().port));
    });
  }

  /** Beendet den Server. */
  close() {
    if (this.server) this.server.close();
  }

  /** Liest den Request-Body als JSON. */
  _readBody(req) {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (c) => { body += c; });
      req.on('end', () => {
        if (!body) return resolve({});
        try { resolve(JSON.parse(body)); } catch { resolve({}); }
      });
    });
  }

  /** Sendet eine JSON-Antwort. */
  _json(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  async _handle(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const urlPath = url.pathname;

    try {
      // GET /api/experiences — Liste (nur public) oder Suche.
      if (urlPath === '/api/experiences' && req.method === 'GET') {
        const search = url.searchParams.get('search');
        const all = await this.registry.listPublic();
        if (search) {
          const q = search.toLowerCase();
          const filtered = all.filter((e) =>
            String(e.name || '').toLowerCase().includes(q) ||
            (e.tags || []).some((t) => String(t).toLowerCase().includes(q)));
          return this._json(res, 200, filtered);
        }
        return this._json(res, 200, all);
      }

      // POST /api/experiences — anlegen.
      if (urlPath === '/api/experiences' && req.method === 'POST') {
        const body = await this._readBody(req);
        const experience = createExperience(body);
        await this.experienceRepo.save(experience);
        return this._json(res, 201, experience);
      }

      // POST /api/packages — Package hochladen (AP-15.4).
      if (urlPath === '/api/packages' && req.method === 'POST') {
        const body = await this._readBody(req);
        if (!body || !body.packageId || !Array.isArray(body.files)) {
          return this._json(res, 400, { error: 'Ungültiges Package-Archiv' });
        }
        const uploadDir = path.join(this.dataDir, 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, `${body.packageId}.json`);
        const tmpPath = `${filePath}.tmp`;
        await fs.writeFile(tmpPath, JSON.stringify(body, null, 2), 'utf8');
        await fs.rename(tmpPath, filePath);
        return this._json(res, 201, { packageId: body.packageId, uploaded: true });
      }

      // GET /api/packages/:id — Package herunterladen (AP-15.5).
      const pkgMatch = urlPath.match(/^\/api\/packages\/([^/]+)$/);
      if (pkgMatch && req.method === 'GET') {
        const packageId = decodeURIComponent(pkgMatch[1]);
        const filePath = path.join(this.dataDir, 'uploads', `${packageId}.json`);
        try {
          const raw = await fs.readFile(filePath, 'utf8');
          return this._json(res, 200, JSON.parse(raw));
        } catch (err) {
          if (err.code === 'ENOENT') return this._json(res, 404, { error: 'Package nicht gefunden' });
          throw err;
        }
      }

      // Aktionen: publish/install, visibility, delete.
      const actionMatch = urlPath.match(/^\/api\/experiences\/([^/]+)\/(publish|install)$/);
      if (actionMatch && req.method === 'POST') {
        const experienceId = decodeURIComponent(actionMatch[1]);
        const action = actionMatch[2];
        const result = action === 'publish'
          ? await this.registry.publish(experienceId)
          : await this.registry.install(experienceId);
        return this._json(res, 200, result);
      }

      const visMatch = urlPath.match(/^\/api\/experiences\/([^/]+)\/visibility$/);
      if (visMatch && req.method === 'PUT') {
        const experienceId = decodeURIComponent(visMatch[1]);
        const body = await this._readBody(req);
        const result = await this.registry.setVisibility(experienceId, body.visibility);
        return this._json(res, 200, result);
      }

      const delMatch = urlPath.match(/^\/api\/experiences\/([^/]+)$/);
      if (delMatch && req.method === 'DELETE') {
        const experienceId = decodeURIComponent(delMatch[1]);
        const result = await this.registry.remove(experienceId);
        return this._json(res, 200, result);
      }

      return this._json(res, 404, { error: 'Nicht gefunden' });
    } catch (err) {
      return this._json(res, 400, { error: err.message });
    }
  }
}

module.exports = { RemoteRegistryServer };
