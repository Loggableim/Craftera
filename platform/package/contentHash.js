'use strict';

/**
 * Craftera Content-Hashing (AP-9.4).
 *
 * Berechnet reproduzierbare SHA-256-Hashes für Dateien und Strings.
 * Gleicher Input → gleicher Hash.
 */

const crypto = require('node:crypto');
const fs = require('node:fs/promises');

/**
 * Berechnet den SHA-256-Hash eines Strings.
 * @param {string} content - Zu hashender Inhalt.
 * @returns {string} Hex-Hash.
 */
function hashString(content) {
  return crypto.createHash('sha256').update(String(content), 'utf8').digest('hex');
}

/**
 * Berechnet den SHA-256-Hash einer Datei.
 * @param {string} filePath - Pfad zur Datei.
 * @returns {Promise<string>} Hex-Hash.
 */
async function hashFile(filePath) {
  const content = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

module.exports = { hashString, hashFile };
