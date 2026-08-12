'use strict';

/**
 * Craftera Create-View (AP-1.8, AP-2.8).
 *
 * Creator Hub mit "New Experience"-Formular (Name, Slug, Tags).
 * Der Submit erstellt eine echte Experience über die API
 * (POST /api/experiences) und zeigt Erfolg/Fehler an.
 */

(function () {
  /** Rendert die Create-View in den Container. */
  function renderCreate() {
    const form = document.getElementById('create-form');
    const status = document.getElementById('create-status');
    if (!form || !status) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('create-name').value.trim();
      const slug = document.getElementById('create-slug').value.trim();
      const tagsRaw = document.getElementById('create-tags').value.trim();
      const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

      status.textContent = 'Erstelle Experience …';
      status.className = 'form-status';

      try {
        const created = await window.craftera.api.post('/api/experiences', { name, slug, tags });
        status.textContent = `Experience "${created.name}" erstellt (${created.experienceId}).`;
        status.className = 'form-status form-status-success';
        form.reset();
      } catch (err) {
        status.textContent = `Fehler: ${err.message}`;
        status.className = 'form-status form-status-error';
      }
    });
  }

  window.craftera = window.craftera || {};
  window.craftera.renderCreate = renderCreate;
})();
