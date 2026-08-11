'use strict';

/**
 * Craftera Client-Shell (AP-1.3).
 *
 * Topbar-Navigation mit 5 Views (Home, Discover, Library, Create, Settings).
 * Klick auf einen Nav-Button wechselt die sichtbare View.
 * Der URL-basierte SPA-Router folgt in AP-1.4.
 */

(function () {
  const navButtons = Array.from(document.querySelectorAll('#topbar-nav .nav-btn'));
  const views = Array.from(document.querySelectorAll('#view-container .view'));

  /** Zeigt genau die View mit der übergebenen `data-view`-Id. */
  function showView(viewId) {
    views.forEach((view) => {
      const isActive = view.dataset.view === viewId;
      view.hidden = !isActive;
      view.classList.toggle('active', isActive);
    });
    navButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });
  }

  // Klick-Handler auf den Nav-Buttons.
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });

  // Start-View: Home.
  showView('home');
})();
