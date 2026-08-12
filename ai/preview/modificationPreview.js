'use strict';

/**
 * Craftera AI Modification Preview (AP-8.11).
 *
 * Zeigt einen Vorschlag (Diff) vor der Anwendung und erlaubt Preview/Apply/Reject.
 * Der Diff vergleicht den aktuellen mit dem vorgeschlagenen Projektzustand.
 *
 * API:
 *   createPreview(currentProject, proposedProject) → { diff, apply, reject }
 *   diffProjects(current, proposed) → Liste von Änderungen
 */

/**
 * Berechnet einen Diff zwischen zwei Projekt-Snapshots.
 * @param {object} current - Aktuelles Projekt.
 * @param {object} proposed - Vorgeschlagenes Projekt.
 * @returns {object[]} Liste von Änderungen { path, before, after }.
 */
function diffProjects(current, proposed) {
  const changes = [];
  const keys = new Set([...Object.keys(current), ...Object.keys(proposed)]);

  keys.forEach((key) => {
    const before = current[key];
    const after = proposed[key];
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      changes.push({ path: key, before, after });
    }
  });

  return changes;
}

/**
 * Erzeugt einen Preview mit apply/reject.
 * @param {object} currentProject - Aktuelles Projekt (wird bei apply mutiert).
 * @param {object} proposedProject - Vorgeschlagenes Projekt.
 * @returns {object} { diff, apply, reject }.
 */
function createPreview(currentProject, proposedProject) {
  const diff = diffProjects(currentProject, proposedProject);

  function apply() {
    Object.keys(proposedProject).forEach((key) => {
      currentProject[key] = JSON.parse(JSON.stringify(proposedProject[key]));
    });
    return true;
  }

  function reject() {
    return false;
  }

  return { diff, apply, reject };
}

module.exports = { createPreview, diffProjects };
