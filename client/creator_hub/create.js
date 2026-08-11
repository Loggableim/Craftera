'use strict';

/**
 * Craftera Create-View (AP-1.8).
 *
 * Creator Hub mit "New Experience"-Formular (Name, Slug, Tags).
 * Das Formular rendert hier nur das UI-Gerüst. Die Anbindung an die
 * Experience-API (POST /api/experiences) folgt in AP-2.8.
 */

(function () {
  /** Rendert die Create-View in den Container. */
  function renderCreate() {
    const form = document.getElementById('create-form');
    const status = document.getElementById('create-status');
    if (!form || !status) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      // AP-1.8: nur UI-Gerüst. Echte Erstellung folgt in AP-2.8 (API-Anbindung).
      status.textContent = 'Erstellung folgt in AP-2.8 (API-Anbindung).';
      status.className = 'form-status';
    });
  }

  window.craftera = window.craftera || {};
  window.craftera.renderCreate = renderCreate;
})();
