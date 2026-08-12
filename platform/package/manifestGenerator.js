'use strict';

/**
 * Craftera Manifest-Generator (AP-9.3).
 *
 * Erzeugt das Package-Manifest mit `formatVersion`, `experienceId`,
 * `versionId`, `runtimeVersion`, `entryScene`, `permissions`, `contentHash`.
 */

const { PACKAGE_FORMAT_VERSION } = require('./packageFormatVersion.js');

/**
 * Erzeugt ein Manifest.
 * @param {object} input - { experienceId, versionId, runtimeVersion, entryScene, permissions, contentHash, formatVersion? }
 * @returns {object} Manifest-Objekt.
 */
function generateManifest(input = {}) {
  if (!input.experienceId) throw new Error('generateManifest: "experienceId" ist erforderlich');

  return {
    packageFormatVersion: PACKAGE_FORMAT_VERSION,
    formatVersion: input.formatVersion || 1,
    experienceId: input.experienceId,
    versionId: input.versionId || '',
    runtimeVersion: input.runtimeVersion || '',
    entryScene: input.entryScene || '',
    permissions: Array.isArray(input.permissions) ? input.permissions : [],
    contentHash: input.contentHash || '',
  };
}

module.exports = { generateManifest };
