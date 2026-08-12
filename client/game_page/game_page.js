'use strict';

/**
 * Craftera Game Page-View (AP-11.1).
 *
 * Zeigt eine Experience mit Name, Creator, Thumbnail, Beschreibung, Version,
 * Tags und Play-Button. Die Experience wird über die API geladen.
 */

(function () {
  /** Rendert die Game Page für eine Experience. */
  async function renderGamePage() {
    const container = document.getElementById('game-page');
    if (!container) return;

    // Experience-ID aus der URL (z.B. #/game?experienceId=exp_1).
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const experienceId = params.get('experienceId');

    if (!experienceId) {
      container.innerHTML = '<p class="empty-state">Keine Experience ausgewählt.</p>';
      return;
    }

    let experiences;
    try {
      experiences = await window.craftera.api.get('/api/experiences');
    } catch {
      container.innerHTML = '<p class="empty-state">Experience konnte nicht geladen werden.</p>';
      return;
    }

    const exp = experiences.find((e) => e.experienceId === experienceId);
    if (!exp) {
      container.innerHTML = '<p class="empty-state">Experience nicht gefunden.</p>';
      return;
    }

    container.innerHTML = `
      <div class="game-page-card">
        <h3 class="game-page-name"></h3>
        <p class="game-page-creator"></p>
        <div class="game-page-thumbnail"></div>
        <p class="game-page-description"></p>
        <p class="game-page-version"></p>
        <div class="game-page-tags"></div>
        <button class="btn btn-primary" type="button" id="game-page-play">Play</button>
      </div>
    `;

    container.querySelector('.game-page-name').textContent = exp.name;
    container.querySelector('.game-page-creator').textContent = exp.creator ? `von ${exp.creator}` : '';
    container.querySelector('.game-page-thumbnail').textContent = exp.thumbnail ? '🖼️' : '';
    container.querySelector('.game-page-description').textContent = exp.description || 'Keine Beschreibung.';
    container.querySelector('.game-page-version').textContent = exp.version ? `Version ${exp.version}` : '';
    const tags = container.querySelector('.game-page-tags');
    (exp.tags || []).forEach((tag) => {
      const span = document.createElement('span');
      span.className = 'game-page-tag';
      span.textContent = tag;
      tags.appendChild(span);
    });

    container.querySelector('#game-page-play').addEventListener('click', () => {
      // Play-Flow folgt in AP-11.2.
      window.craftera.navigate('library');
    });
  }

  window.craftera = window.craftera || {};
  window.craftera.renderGamePage = renderGamePage;
})();
