'use strict';

/**
 * Craftera GDD-Modell (AP-12.1).
 *
 * Ein Game Design Document (GDD) beschreibt das Spiel auf konzeptioneller
 * Ebene. Es wird als `GDD.json` gespeichert und als `GDD.md` (Markdown)
 * exportiert. Die Struktur ist bewusst offen gehalten, damit der Game
 * Director (AP-12.2) sie sinnvoll befüllen kann.
 *
 * Felder:
 *   gddId        – eindeutige ID
 *   experienceId – zugehörige Experience (optional)
 *   title        – Spieltitel
 *   genre        – Genre
 *   summary      – Kurzbeschreibung
 *   coreLoop     – Kern-Gameplay-Loop
 *   features     – Liste von Features
 *   controls     – Steuerungsbeschreibung
 *   createdAt    – Zeitstempel
 */

const { createId } = require('./ids.js');

// Dateiname des serialisierten GDD.
const GDD_FILENAME = 'GDD.json';
// Dateiname des Markdown-Exports.
const GDD_MD_FILENAME = 'GDD.md';

/**
 * Erzeugt ein neues GDD.
 * @param {object} input - { experienceId?, title?, genre?, summary?, coreLoop?, features?, controls? }
 * @returns {object} GDD-Objekt.
 */
function createGDD(input = {}) {
  return {
    gddId: createId('gdd'),
    experienceId: String(input.experienceId || ''),
    title: String(input.title || ''),
    genre: String(input.genre || ''),
    summary: String(input.summary || ''),
    coreLoop: String(input.coreLoop || ''),
    features: Array.isArray(input.features) ? input.features.map(String) : [],
    controls: String(input.controls || ''),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Serialisiert ein GDD zu einem JSON-String.
 * @param {object} gdd - GDD-Objekt.
 * @returns {string} JSON-String.
 */
function serializeGDD(gdd) {
  return JSON.stringify(gdd, null, 2);
}

/**
 * Exportiert ein GDD als Markdown-String (GDD.md).
 * @param {object} gdd - GDD-Objekt.
 * @returns {string} Markdown-String.
 */
function gddToMarkdown(gdd) {
  const lines = [];
  lines.push(`# ${gdd.title || 'Unbenanntes GDD'}`);
  if (gdd.genre) lines.push(`\n**Genre:** ${gdd.genre}`);
  if (gdd.summary) lines.push(`\n## Zusammenfassung\n\n${gdd.summary}`);
  if (gdd.coreLoop) lines.push(`\n## Core Loop\n\n${gdd.coreLoop}`);
  if (Array.isArray(gdd.features) && gdd.features.length) {
    lines.push(`\n## Features\n`);
    for (const f of gdd.features) lines.push(`- ${f}`);
  }
  if (gdd.controls) lines.push(`\n## Steuerung\n\n${gdd.controls}`);
  lines.push(`\n---\n*GDD-ID: ${gdd.gddId}*`);
  return lines.join('\n');
}

module.exports = {
  createGDD, serializeGDD, gddToMarkdown, GDD_FILENAME, GDD_MD_FILENAME,
};
