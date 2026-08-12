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

  /**
   * Rendert das Inspector-Panel (AP-3.4).
   * Zeigt Transform (x/y/scale/rotation) und Components einer ausgewählten
   * Entity. Ohne Auswahl wird der leere Zustand angezeigt.
   * @param {object|null} entity - Ausgewählte Entity oder null.
   */
  function renderInspector(entity) {
    const body = document.getElementById('inspector-body');
    if (!body) return;

    body.innerHTML = '';
    if (!entity) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Keine Auswahl.';
      body.appendChild(empty);
      return;
    }

    // Transform-Sektion.
    const transform = entity.transform || { x: 0, y: 0, scale: 1, rotation: 0 };
    const transformSection = document.createElement('div');
    transformSection.className = 'inspector-section';
    transformSection.innerHTML = '<h3 class="inspector-section-title">Transform</h3>';
    const transformFields = [
      ['x', transform.x],
      ['y', transform.y],
      ['scale', transform.scale],
      ['rotation', transform.rotation],
    ];
    transformFields.forEach(([key, value]) => {
      const row = document.createElement('div');
      row.className = 'inspector-row';
      row.innerHTML = `<span class="inspector-label"></span><span class="inspector-value"></span>`;
      row.querySelector('.inspector-label').textContent = key;
      row.querySelector('.inspector-value').textContent = String(value);
      transformSection.appendChild(row);
    });
    body.appendChild(transformSection);

    // Components-Sektion.
    const components = entity.components || [];
    const compSection = document.createElement('div');
    compSection.className = 'inspector-section';
    compSection.innerHTML = '<h3 class="inspector-section-title">Components</h3>';
    if (!components.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Keine Components.';
      compSection.appendChild(empty);
    } else {
      components.forEach((comp) => {
        const row = document.createElement('div');
        row.className = 'inspector-row';
        row.innerHTML = `<span class="inspector-label"></span><span class="inspector-value"></span>`;
        row.querySelector('.inspector-label').textContent = comp.type;
        row.querySelector('.inspector-value').textContent = JSON.stringify(comp.props || {});
        compSection.appendChild(row);
      });
    }
    body.appendChild(compSection);
  }

  /**
   * Rendert das Viewport-Panel (AP-3.5).
   * Initialisiert den Canvas und zeichnet den leeren Zustand (Hintergrund).
   * Später (Phase 6) werden hier Entities als Sprites gezeichnet.
   */
  function renderViewport() {
    const canvas = document.getElementById('viewport-canvas-el');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Leerer Zustand: dunkler Hintergrund + Raster.
    ctx.fillStyle = '#0b0d11';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1a1d24';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  /**
   * Rendert das Assets-Panel (AP-3.6).
   * Zeigt die Assets des Projekts. Da das Asset-System erst in Phase 6
   * entsteht, ist die Datenquelle aktuell leer → leerer Zustand.
   */
  function renderAssets() {
    const list = document.getElementById('assets-list');
    if (!list) return;

    // Datenquelle: Assets des Projekts (noch leer, Phase 6).
    const assets = [];

    list.innerHTML = '';
    if (!assets.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Keine Assets.';
      list.appendChild(empty);
      return;
    }

    assets.forEach((asset) => {
      const row = document.createElement('div');
      row.className = 'asset-item';
      row.innerHTML = `<span class="asset-name"></span><span class="asset-type"></span>`;
      row.querySelector('.asset-name').textContent = asset.name;
      row.querySelector('.asset-type').textContent = asset.type || '';
      list.appendChild(row);
    });
  }

  window.craftera = window.craftera || {};
  window.craftera.studio = { loadExperience, renderHierarchy, renderInspector, renderViewport, renderAssets };
})();
