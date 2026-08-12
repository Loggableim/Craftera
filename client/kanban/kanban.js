'use strict';

/**
 * Craftera Kanban im Studio (AP-12.9).
 *
 * Zeigt die Tasks einer Experience als Kanban-Board mit den Spalten
 * BACKLOG / READY / WORKING / REVIEW / TESTING / DONE (Master Prompt §46).
 * Die Tasks und ihr Status kommen aus der Task-API — es wird nur echter,
 * persistierter Zustand angezeigt (kein Fake-Status).
 *
 * WORKING ist die Anzeige-Spalte für IN_PROGRESS.
 */

(function () {
  // Spalten-Reihenfolge und Zuordnung von Task-Status → Spalte.
  const COLUMNS = [
    { key: 'BACKLOG', label: 'BACKLOG' },
    { key: 'READY', label: 'READY' },
    { key: 'IN_PROGRESS', label: 'WORKING' },
    { key: 'REVIEW', label: 'REVIEW' },
    { key: 'TESTING', label: 'TESTING' },
    { key: 'DONE', label: 'DONE' },
  ];

  /** Lädt die Tasks einer Experience über die API. */
  async function loadTasks(experienceId) {
    return window.craftera.api.get(`/api/experiences/${encodeURIComponent(experienceId)}/tasks`);
  }

  /** Rendert das Kanban-Board für eine Experience. */
  async function renderKanban(experienceId) {
    const container = document.getElementById('kanban');
    if (!container) return;

    let tasks;
    try {
      tasks = await loadTasks(experienceId);
    } catch {
      container.innerHTML = '<p class="empty-state">Tasks konnten nicht geladen werden.</p>';
      return;
    }

    container.innerHTML = '';

    for (const col of COLUMNS) {
      const colEl = document.createElement('div');
      colEl.className = 'kanban-column';
      colEl.dataset.column = col.key;

      const header = document.createElement('div');
      header.className = 'kanban-column-header';
      header.textContent = col.label;
      colEl.appendChild(header);

      const cards = document.createElement('div');
      cards.className = 'kanban-cards';

      const colTasks = tasks.filter((t) => t.status === col.key);
      if (colTasks.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'kanban-empty';
        empty.textContent = '—';
        cards.appendChild(empty);
      } else {
        for (const task of colTasks) {
          const card = document.createElement('div');
          card.className = 'kanban-card';
          card.dataset.taskId = task.id;

          const title = document.createElement('div');
          title.className = 'kanban-card-title';
          title.textContent = task.title;
          card.appendChild(title);

          const agent = document.createElement('div');
          agent.className = 'kanban-card-agent';
          agent.textContent = task.agent;
          card.appendChild(agent);
          cards.appendChild(card);
        }
      }

      colEl.appendChild(cards);
      container.appendChild(colEl);
    }
  }

  window.craftera = window.craftera || {};
  window.craftera.renderKanban = renderKanban;
})();
