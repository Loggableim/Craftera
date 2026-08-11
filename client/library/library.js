'use strict';

/**
 * Craftera Library-View (AP-1.7).
 *
 * Zeigt installierte Experiences. Aktuell ist die Datenquelle leer (noch
 * keine Installationen — Phase 10), daher wird der leere Zustand real
 * angezeigt. Sobald die Registry-API existiert (Phase 10), wird
 * `loadLibraryData` auf die API umgestellt.
 */

(function () {
  // Datenquelle: vorerst leer. Wird später durch die Registry-API ersetzt.
  function loadLibraryData() {
    return [];
  }

  /** Baut die Karten-Liste oder den leeren Zustand. */
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
      card.querySelector('.card-meta').textContent = item.version ? `v${item.version}` : '';
      container.appendChild(card);
    });
  }

  /** Rendert die Library-View in den Container. */
  function renderLibrary() {
    const list = document.getElementById('library-list');
    if (!list) return;

    const installed = loadLibraryData();
    renderList(list, installed, 'Noch keine Experiences installiert.');
  }

  window.craftera = window.craftera || {};
  window.craftera.renderLibrary = renderLibrary;
})();
