'use strict';

/**
 * Craftera ExperienceVersion-Modell (AP-2.3).
 *
 * `createVersion` erzeugt eine ExperienceVersion mit stabiler
 * `versionId` (AP-2.1), `versionNumber`, `status` und `packageHash`.
 */

const { createId } = require('./ids.js');

// Gültige Status-Werte einer Version (Master Prompt §15).
const VERSION_STATUS = [
  'DRAFT',
  'VALIDATING',
  'READY',
  'PUBLISHED',
  'DEPRECATED',
  'REJECTED',
  'BROKEN',
];

/**
 * Erzeugt eine neue ExperienceVersion.
 * @param {object} input - { experienceId, versionNumber?, packageHash? }
 * @returns {object} ExperienceVersion-Objekt.
 */
function createVersion(input = {}) {
  const experienceId = String(input.experienceId || '');
  if (!experienceId) {
    throw new Error('createVersion: "experienceId" ist erforderlich');
  }

  const versionNumber = input.versionNumber !== undefined
    ? Number(input.versionNumber)
    : 1;

  return {
    versionId: createId('ver'),
    experienceId,
    versionNumber,
    status: 'DRAFT',
    packageHash: String(input.packageHash || ''),
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createVersion, VERSION_STATUS };
