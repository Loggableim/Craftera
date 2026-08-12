'use strict';

/**
 * Craftera Package-Upload (AP-15.4).
 *
 * Packt ein Package-Verzeichnis in ein JSON-Archiv (jede Datei base64-kodiert)
 * und lädt es über HTTP hoch. Der Server speichert das Archiv.
 *
 * Client: `uploadPackage(baseUrl, packageDir)` → POST /api/packages
 * Server: speichert das Archiv unter `<dataDir>/uploads/<packageId>.json`.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

/** Liest ein Verzeichnis rekursiv in eine Datei-Liste. */
async function readDirRecursive(dir, relBase = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await readDirRecursive(absPath, relPath));
    } else {
      const content = await fs.readFile(absPath);
      files.push({ path: relPath, content: content.toString('base64') });
    }
  }
  return files;
}

/** Schreibt ein Archiv rekursiv in ein Verzeichnis. */
async function writeArchiveRecursive(archive, destDir) {
  for (const file of archive.files) {
    const absPath = path.join(destDir, file.path);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, Buffer.from(file.content, 'base64'));
  }
}

/**
 * Packt ein Package-Verzeichnis in ein JSON-Archiv.
 * @param {string} packageDir - Package-Verzeichnis.
 * @returns {Promise<object>} { packageId, files }.
 */
async function packPackage(packageDir) {
  const files = await readDirRecursive(packageDir);
  return { packageId: path.basename(packageDir), files };
}

/**
 * Lädt ein Package hoch.
 * @param {string} baseUrl - Basis-URL des Remote-Registry-Servers.
 * @param {string} packageDir - Package-Verzeichnis.
 * @returns {Promise<object>} Server-Antwort.
 */
async function uploadPackage(baseUrl, packageDir) {
  const archive = await packPackage(packageDir);
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(archive),
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!res.ok) {
    throw new Error(data && data.error ? data.error : `Upload fehlgeschlagen (${res.status})`);
  }
  return data;
}

/**
 * Lädt ein Package herunter (AP-15.5).
 * @param {string} baseUrl - Basis-URL des Remote-Registry-Servers.
 * @param {string} packageId - Package-ID.
 * @returns {Promise<object>} { packageId, files }.
 */
async function downloadPackage(baseUrl, packageId) {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/packages/${encodeURIComponent(packageId)}`);
  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!res.ok) {
    throw new Error(data && data.error ? data.error : `Download fehlgeschlagen (${res.status})`);
  }
  return data;
}

module.exports = { packPackage, uploadPackage, downloadPackage, writeArchiveRecursive, readDirRecursive };
