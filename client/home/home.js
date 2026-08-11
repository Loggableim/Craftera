'use strict';

/**
 * Craftera Home-View (AP-1.5).
 *
 * Rendert "Featured" und "Recently Played" aus einer Datenquelle.
 * Aktuell ist die Datenquelle leer (noch keine Experiences — Phase 2),
 * daher wird der leere Zustand real angezeigt. Sobald die Experience-API
 * existiert (AP-2.7), wird `loadHomeData` auf die API umgestellt.
 */

(function () {
  // Datenquelle: vorerst leer. Wird später durch die API ersetzt.
  function loadHomeData() {
    return {
      featured: [],
      recentlyPlayed: [],
    };
  }

  /** Baut eine Karten-Liste oder den leeren Zustand. */
  function renderList(container, items, emptyText) {
    container.innerHTML = '';
    if (!items || items.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = emptyText;
      container.appendChild(empty);
      return;
    }
    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `<h3 class="card-title"></h3><p class="card-meta"></p>`;
      card.querySelector('.card-title').textContent = item.name;
      card.querySelector('.card-meta').textContent = item.meta || '';
      container.appendChild(card);
    });
  }

  /** Rendert die Home-View in den Container. */
  function renderHome() {
    const featured = document.getElementById('home-featured');
    const recently = document.getElementById('home-recently-played');
    if (!featured || !recently) return;

    const data = loadHomeData();
    renderList(featured, data.featured, 'Noch keine Featured-Experiences.');
    renderList(recently, data.recentlyPlayed, 'Noch nichts gespielt.');
  }

  window.craftera = window.craftera || {};
  window.craftera.renderHome = renderHome;
})();
