'use strict';

/**
 * Craftera Discover-View (AP-1.6).
 *
 * Zeigt eine Liste von Experiences mit Suchfeld. Die Suche filtert die Liste
 * nach Name und Tags. Aktuell ist die Datenquelle leer (noch keine Experiences
 * — Phase 2), daher wird der leere Zustand real angezeigt. Sobald die
 * Experience-API existiert (AP-2.7), wird `loadDiscoverData` auf die API
 * umgestellt.
 */

(function () {
  // Datenquelle: vorerst leer. Wird später durch die API ersetzt.
  function loadDiscoverData() {
    return [];
  }

  /** Filtert die Liste nach dem Suchbegriff (Name oder Tag). */
  function filterExperiences(items, query) {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const name = (item.name || '').toLowerCase();
      const tags = (item.tags || []).join(' ').toLowerCase();
      return name.includes(q) || tags.includes(q);
    });
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
      card.querySelector('.card-meta').textContent = (item.tags || []).join(', ');
      container.appendChild(card);
    });
  }

  /** Rendert die Discover-View in den Container. */
  function renderDiscover() {
    const list = document.getElementById('discover-list');
    const search = document.getElementById('discover-search');
    if (!list || !search) return;

    const all = loadDiscoverData();

    function update() {
      const filtered = filterExperiences(all, search.value);
      renderList(list, filtered, 'Keine Experiences gefunden.');
    }

    // Suchfeld: bei Eingabe neu filtern.
    search.addEventListener('input', update);

    update();
  }

  window.craftera = window.craftera || {};
  window.craftera.renderDiscover = renderDiscover;
})();
