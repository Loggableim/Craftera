'use strict';

/**
 * Craftera Create-View (AP-1.8, AP-2.8).
 *
 * Creator Hub mit "New Experience"-Formular (Name, Slug, Tags).
 * Der Submit erstellt eine echte Experience über die API
 * (POST /api/experiences) und zeigt Erfolg/Fehler an.
 */

(function () {
  /** Rendert die Liste der Experiences mit Edit-Button (AP-3.2). */
  async function renderExperienceList() {
    const container = document.getElementById('create-experiences');
    if (!container) return;

    let experiences;
    try {
      experiences = await window.craftera.api.get('/api/experiences');
    } catch {
      container.innerHTML = '<p class="empty-state">Experiences konnten nicht geladen werden.</p>';
      return;
    }

    container.innerHTML = '';
    if (!experiences.length) {
      container.innerHTML = '<p class="empty-state">Noch keine Experiences erstellt.</p>';
      return;
    }

    experiences.forEach((exp) => {
      const row = document.createElement('div');
      row.className = 'experience-row';
      row.innerHTML = `
        <span class="experience-name"></span>
        <button class="btn btn-edit" type="button">Edit</button>
      `;
      row.querySelector('.experience-name').textContent = exp.name;
      row.querySelector('.btn-edit').addEventListener('click', () => {
        // Studio-Route: Experience im Studio öffnen (AP-3.2).
        window.location.href = `/studio/?experienceId=${encodeURIComponent(exp.experienceId)}`;
      });
      container.appendChild(row);
    });
  }

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
        renderExperienceList();
      } catch (err) {
        status.textContent = `Fehler: ${err.message}`;
        status.className = 'form-status form-status-error';
      }
    });

    renderExperienceList();
  }

  window.craftera = window.craftera || {};
  window.craftera.renderCreate = renderCreate;
})();
