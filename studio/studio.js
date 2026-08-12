'use strict';

/**
 * Craftera Studio — Route (AP-3.2).
 *
 * Liest die `experienceId` aus der URL (`/studio/?experienceId=…`),
 * lädt die Experience über die API und zeigt sie in der Topbar an.
 * Die Panels (Hierarchy, Viewport, Inspector, …) folgen in AP-3.3+.
 */

(function () {
  /** Liest einen Query-Parameter aus der aktuellen URL. */
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  /** Lädt die Experience und zeigt sie an. */
  async function loadExperience() {
    const experienceId = getQueryParam('experienceId');
    const brand = document.querySelector('.studio-brand');
    if (!experienceId) {
      if (brand) brand.textContent = 'Craftera Studio — keine Experience';
      return;
    }

    try {
      const experiences = await window.craftera.api.get('/api/experiences');
      const exp = experiences.find((e) => e.experienceId === experienceId);
      if (brand) {
        brand.textContent = exp
          ? `Craftera Studio — ${exp.name}`
          : `Craftera Studio — ${experienceId}`;
      }
    } catch {
      if (brand) brand.textContent = 'Craftera Studio — Fehler beim Laden';
    }
  }

  /**
   * Rendert das Hierarchy-Panel (AP-3.3).
   * Zeigt die Entities der aktuellen Scene. Da das GameProject/Scene-Modell
   * erst in Phase 4 entsteht, ist die Datenquelle aktuell leer → leerer Zustand.
   */
  function renderHierarchy() {
    const list = document.getElementById('hierarchy-list');
    if (!list) return;

    // Datenquelle: Entities der aktuellen Scene (noch leer, Phase 4).
    const entities = [];

    list.innerHTML = '';
    if (!entities.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Keine Entities in der Scene.';
      list.appendChild(empty);
      return;
    }

    entities.forEach((entity) => {
      const row = document.createElement('div');
      row.className = 'hierarchy-item';
      row.textContent = entity.name || entity.entityId;
      list.appendChild(row);
    });
  }

  window.craftera = window.craftera || {};
  window.craftera.studio = { loadExperience, renderHierarchy };
})();
