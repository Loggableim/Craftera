'use strict';

/**
 * Craftera Experience-Modell (AP-2.2).
 *
 * `createExperience` erzeugt ein Experience-Objekt mit stabiler,
 * typ-präfixierter `experienceId` (AP-2.1) und den Kernfeldern
 * `name`, `slug`, `status`, `tags` sowie sinnvollen Defaults.
 */

const { createId } = require('./ids.js');

// Gültige Status-Werte einer Experience.
const EXPERIENCE_STATUS = ['draft', 'published', 'archived'];

/**
 * Erzeugt ein neues Experience-Objekt.
 * @param {object} input - { name, slug?, tags?, description? }
 * @returns {object} Experience-Objekt.
 */
function createExperience(input = {}) {
  const name = String(input.name || '').trim();
  if (!name) {
    throw new Error('createExperience: "name" ist erforderlich');
  }

  const slug = String(input.slug || '').trim() || slugify(name);
  const tags = Array.isArray(input.tags) ? input.tags.map(String) : [];

  return {
    experienceId: createId('exp'),
    name,
    slug,
    description: String(input.description || ''),
    status: 'draft',
    tags,
    visibility: 'private',
    createdAt: new Date().toISOString(),
  };
}

/** Erzeugt einen URL-freundlichen Slug aus einem Namen. */
function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = { createExperience, EXPERIENCE_STATUS, slugify };
