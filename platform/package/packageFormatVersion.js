'use strict';

/**
 * Craftera Package-Format-Versionierung (AP-9.7).
 *
 * Die `packageFormatVersion` ist getrennt von der GameProject-`formatVersion`
 * (engine/project.js). Sie versioniert ausschließlich das Package-Format
 * (Struktur, Manifest, Integrity), unabhängig vom Game-Inhalt.
 */

// Aktuelle Package-Format-Version. Erhöhen, wenn sich die Package-Struktur
// oder das Manifest-Format inkompatibel ändert.
const PACKAGE_FORMAT_VERSION = 1;

module.exports = { PACKAGE_FORMAT_VERSION };
