'use strict';

/**
 * Craftera Client-Shell — SPA-Router (AP-1.4).
 *
 * URL-basierter View-Wechsel ohne Reload:
 *   - `navigate(view)` setzt den Hash (`#/view`) und rendert die View.
 *   - Beim Laden und bei `hashchange` wird die View aus der URL gerendert.
 *   - Browser-Zurück/Vorwärts funktioniert über den Hash.
 *
 * Routen-Format: `#/home`, `#/discover`, `#/library`, `#/create`, `#/settings`.
 */

(function () {
  const navButtons = Array.from(document.querySelectorAll('#topbar-nav .btn'));
  const views = Array.from(document.querySelectorAll('#view-container .view'));

  // Gültige View-Ids (aus den vorhandenen View-Sektionen abgeleitet).
  const validViews = new Set(views.map((v) => v.dataset.view));

  /** Rendert die View mit der übergebenen Id und markiert den aktiven Button. */
  function renderView(viewId) {
    views.forEach((view) => {
      const isActive = view.dataset.view === viewId;
      view.hidden = !isActive;
      view.classList.toggle('active', isActive);
    });
    navButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });
  }

  /** Liest die View-Id aus dem aktuellen Hash. Fallback: 'home'. */
  function viewFromHash() {
    const match = window.location.hash.match(/^#\/([a-z]+)/);
    const viewId = match ? match[1] : 'home';
    return validViews.has(viewId) ? viewId : 'home';
  }

  /** Navigiert zu einer View: aktualisiert URL (Hash) und rendert die View. */
  function navigate(viewId) {
    if (!validViews.has(viewId)) {
      viewId = 'home';
    }
    if (window.location.hash !== `#/${viewId}`) {
      window.location.hash = `#/${viewId}`;
    }
    renderView(viewId);
  }

  // Bei Hash-Änderung (inkl. Browser-Zurück/Vorwärts) die View rendern.
  window.addEventListener('hashchange', () => renderView(viewFromHash()));

  // Klick auf Nav-Button navigiert zur zugehörigen View.
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.view));
  });

  // Beim Laden die View aus der URL rendern (Deep-Link-fähig).
  renderView(viewFromHash());

  // Globale API für spätere Views (z.B. Studio-Route in AP-3.2).
  window.craftera = window.craftera || {};
  window.craftera.navigate = navigate;
})();
