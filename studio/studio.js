'use strict';

/**
 * Craftera Studio — Route (AP-3.2).
 *
 * Liest die `experienceId` aus der URL (`/studio/?experienceId=…`),
 * lädt die Experience über die API und zeigt sie in der Topbar an.
 * Die Panels (Hierarchy, Viewport, Inspector, …) folgen in AP-3.3+.
 */

(function () {
  /** Liest einen Query-Parameter aus der aktuellen URL. */
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  /**
   * Lädt das GameProject der Experience über die API (AP-4.9).
   * @returns {object|null} Projekt oder null, wenn keine Experience geladen.
   */
  async function loadProject() {
    const experienceId = getQueryParam('experienceId');
    if (!experienceId) return null;
    try {
      return await window.craftera.api.get(`/api/experiences/${experienceId}/project`);
    } catch (err) {
      log(`Projekt laden fehlgeschlagen: ${err.message}`, 'error');
      return null;
    }
  }

  /**
   * Speichert das GameProject der Experience über die API (AP-4.9).
   * @param {object} project - GameProject-Objekt.
   * @returns {boolean} true bei Erfolg.
   */
  async function saveProject(project) {
    const experienceId = getQueryParam('experienceId');
    if (!experienceId) return false;
    try {
      await window.craftera.api.put(`/api/experiences/${experienceId}/project`, project);
      log('Projekt gespeichert.', 'info');
      return true;
    } catch (err) {
      log(`Projekt speichern fehlgeschlagen: ${err.message}`, 'error');
      return false;
    }
  }

  /** Initialisiert den Save-Button (AP-4.9). */
  function initSaveButton() {
    const save = document.getElementById('save-btn');
    if (!save) return;
    save.addEventListener('click', async () => {
      const project = await loadProject();
      if (project) {
        await saveProject(project);
      }
    });
  }

  /** Lädt die Experience (Projekt) und zeigt ihre Daten an (AP-3.10). */
  async function loadExperience() {
    const experienceId = getQueryParam('experienceId');
    const brand = document.querySelector('.studio-brand');
    const info = document.getElementById('project-info');
    if (!experienceId) {
      if (brand) brand.textContent = 'Craftera Studio — keine Experience';
      if (info) info.textContent = 'Kein Projekt geladen';
      return;
    }

    try {
      const experiences = await window.craftera.api.get('/api/experiences');
      const exp = experiences.find((e) => e.experienceId === experienceId);
      if (brand) {
        brand.textContent = exp
          ? `Craftera Studio — ${exp.name}`
          : `Craftera Studio — ${experienceId}`;
      }
      // Projekt-Daten sichtbar anzeigen (AP-3.10).
      if (info) {
        info.textContent = exp
          ? `${exp.name} · ${exp.slug} · ${exp.status} · Tags: ${(exp.tags || []).join(', ') || '—'}`
          : `Projekt ${experienceId} nicht gefunden`;
      }
    } catch {
      if (brand) brand.textContent = 'Craftera Studio — Fehler beim Laden';
      if (info) info.textContent = 'Fehler beim Laden des Projekts';
    }
  }

  /**
   * Rendert das Hierarchy-Panel (AP-3.3).
   * Zeigt die Entities der aktuellen Scene. Da das GameProject/Scene-Modell
   * erst in Phase 4 entsteht, ist die Datenquelle aktuell leer → leerer Zustand.
   */
  function renderHierarchy() {
    const list = document.getElementById('hierarchy-list');
    if (!list) return;

    // Datenquelle: Entities der aktuellen Scene (noch leer, Phase 4).
    const entities = [];

    list.innerHTML = '';
    if (!entities.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Keine Entities in der Scene.';
      list.appendChild(empty);
      return;
    }

    entities.forEach((entity) => {
      const row = document.createElement('div');
      row.className = 'hierarchy-item';
      row.textContent = entity.name || entity.entityId;
      list.appendChild(row);
    });
  }

  /**
   * Rendert das Inspector-Panel (AP-3.4).
   * Zeigt Transform (x/y/scale/rotation) und Components einer ausgewählten
   * Entity. Ohne Auswahl wird der leere Zustand angezeigt.
   * @param {object|null} entity - Ausgewählte Entity oder null.
   */
  function renderInspector(entity) {
    const body = document.getElementById('inspector-body');
    if (!body) return;

    body.innerHTML = '';
    if (!entity) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Keine Auswahl.';
      body.appendChild(empty);
      return;
    }

    // Transform-Sektion.
    const transform = entity.transform || { x: 0, y: 0, scale: 1, rotation: 0 };
    const transformSection = document.createElement('div');
    transformSection.className = 'inspector-section';
    transformSection.innerHTML = '<h3 class="inspector-section-title">Transform</h3>';
    const transformFields = [
      ['x', transform.x],
      ['y', transform.y],
      ['scale', transform.scale],
      ['rotation', transform.rotation],
    ];
    transformFields.forEach(([key, value]) => {
      const row = document.createElement('div');
      row.className = 'inspector-row';
      row.innerHTML = `<span class="inspector-label"></span><span class="inspector-value"></span>`;
      row.querySelector('.inspector-label').textContent = key;
      row.querySelector('.inspector-value').textContent = String(value);
      transformSection.appendChild(row);
    });
    body.appendChild(transformSection);

    // Components-Sektion.
    const components = entity.components || [];
    const compSection = document.createElement('div');
    compSection.className = 'inspector-section';
    compSection.innerHTML = '<h3 class="inspector-section-title">Components</h3>';
    if (!components.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Keine Components.';
      compSection.appendChild(empty);
    } else {
      components.forEach((comp) => {
        const row = document.createElement('div');
        row.className = 'inspector-row';
        row.innerHTML = `<span class="inspector-label"></span><span class="inspector-value"></span>`;
        row.querySelector('.inspector-label').textContent = comp.type;
        row.querySelector('.inspector-value').textContent = JSON.stringify(comp.props || {});
        compSection.appendChild(row);
      });
    }
    body.appendChild(compSection);
  }

  /**
   * Rendert das Viewport-Panel (AP-3.5).
   * Initialisiert den Canvas und zeichnet den leeren Zustand (Hintergrund).
   * Später (Phase 6) werden hier Entities als Sprites gezeichnet.
   */
  function renderViewport() {
    const canvas = document.getElementById('viewport-canvas-el');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Leerer Zustand: dunkler Hintergrund + Raster.
    ctx.fillStyle = '#0b0d11';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1a1d24';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  /**
   * Rendert das Assets-Panel (AP-3.6).
   * Zeigt die Assets des Projekts. Da das Asset-System erst in Phase 6
   * entsteht, ist die Datenquelle aktuell leer → leerer Zustand.
   */
  function renderAssets() {
    const list = document.getElementById('assets-list');
    if (!list) return;

    // Datenquelle: Assets des Projekts (noch leer, Phase 6).
    const assets = [];

    list.innerHTML = '';
    if (!assets.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Keine Assets.';
      list.appendChild(empty);
      return;
    }

    assets.forEach((asset) => {
      const row = document.createElement('div');
      row.className = 'asset-item';
      row.innerHTML = `<span class="asset-name"></span><span class="asset-type"></span>`;
      row.querySelector('.asset-name').textContent = asset.name;
      row.querySelector('.asset-type').textContent = asset.type || '';
      list.appendChild(row);
    });
  }

  /**
   * Console-Panel (AP-3.7).
   * Sammelt Logs und rendert sie in das Console-Panel.
   */
  const consoleLogs = [];

  /** Fügt einen Log-Eintrag hinzu und rendert das Console-Panel. */
  function log(message, level = 'info') {
    consoleLogs.push({ message: String(message), level, time: new Date().toISOString() });
    renderConsole();
  }

  /** Rendert das Console-Panel. */
  function renderConsole() {
    const list = document.getElementById('console-list');
    if (!list) return;

    list.innerHTML = '';
    if (!consoleLogs.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Keine Logs.';
      list.appendChild(empty);
      return;
    }

    consoleLogs.forEach((entry) => {
      const row = document.createElement('div');
      row.className = `console-item console-${entry.level}`;
      row.textContent = `[${entry.time}] ${entry.message}`;
      list.appendChild(row);
    });
  }

  /**
   * Play-Toolbar (AP-3.8).
   * Play/Stop/Pause-Buttons mit echtem Zustand (stopped/playing/paused).
   * Die Runtime selbst folgt in Phase 7; hier wird der Modus real umgeschaltet
   * und in der Console geloggt.
   */
  let playState = 'stopped';

  /** Aktualisiert die Button-Zustände anhand des aktuellen playState. */
  function updatePlayButtons() {
    const play = document.getElementById('play-btn');
    const pause = document.getElementById('pause-btn');
    const stop = document.getElementById('stop-btn');
    if (!play || !pause || !stop) return;

    play.disabled = playState === 'playing' || playState === 'paused';
    pause.disabled = playState !== 'playing';
    stop.disabled = playState === 'stopped';
  }

  /** Setzt den Play-Modus und loggt ihn. */
  function setPlayState(state) {
    playState = state;
    updatePlayButtons();
    log(`Play-Modus: ${state}`, 'info');
  }

  /** Initialisiert die Play-Toolbar-Buttons. */
  function initPlayToolbar() {
    const play = document.getElementById('play-btn');
    const pause = document.getElementById('pause-btn');
    const stop = document.getElementById('stop-btn');
    if (!play || !pause || !stop) return;

    play.addEventListener('click', () => setPlayState('playing'));
    pause.addEventListener('click', () => setPlayState('paused'));
    stop.addEventListener('click', () => setPlayState('stopped'));

    updatePlayButtons();
  }

  /**
   * AI-Panel (AP-3.9).
   * Chat-Gerüst: Eingabefeld + Senden-Button. Die echte AI-Funktion
   * (Provider, Command-Ausführung) folgt in Phase 8. Hier wird nur das
   * UI-Gerüst gerendert und eine Hinweis-Meldung angezeigt.
   */
  function initAiPanel() {
    const chat = document.getElementById('ai-chat');
    const input = document.getElementById('ai-input');
    const send = document.getElementById('ai-send');
    if (!chat || !input || !send) return;

    function appendMessage(text, cls) {
      const msg = document.createElement('div');
      msg.className = `ai-message ${cls}`;
      msg.textContent = text;
      chat.appendChild(msg);
    }

    send.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) return;
      appendMessage(text, 'ai-user');
      appendMessage('AI-Funktion folgt in Phase 8.', 'ai-assistant');
      input.value = '';
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') send.click();
    });
  }

  /**
   * AI-Panel (AP-3.9).
   * Chat-Gerüst: Nachrichten-Liste + Eingabefeld + Senden-Button.
   * Noch ohne Funktion — die AI-Anbindung folgt in Phase 8.
   */
  function renderAI() {
    const body = document.getElementById('ai-body');
    if (!body) return;

    body.innerHTML = '';

    // Nachrichten-Liste.
    const messages = document.createElement('div');
    messages.className = 'ai-messages';
    messages.id = 'ai-messages';
    body.appendChild(messages);

    // Eingabezeile.
    const inputRow = document.createElement('div');
    inputRow.className = 'ai-input-row';
    inputRow.innerHTML = `
      <input type="text" id="ai-input" class="ai-input" placeholder="Frage die AI…">
      <button type="button" id="ai-send" class="btn">Senden</button>
    `;
    body.appendChild(inputRow);

    const send = inputRow.querySelector('#ai-send');
    const input = inputRow.querySelector('#ai-input');
    send.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) return;
      const msg = document.createElement('div');
      msg.className = 'ai-message';
      msg.textContent = text;
      messages.appendChild(msg);
      input.value = '';
      // Noch ohne Funktion — Hinweis anzeigen.
      const hint = document.createElement('div');
      hint.className = 'ai-hint';
      hint.textContent = 'AI-Funktion folgt in Phase 8.';
      messages.appendChild(hint);
    });
  }

  window.craftera = window.craftera || {};
  window.craftera.studio = {
    loadExperience, renderHierarchy, renderInspector, renderViewport, renderAssets,
    log, renderConsole, initPlayToolbar, setPlayState, renderAI,
    loadProject, saveProject, initSaveButton,
  };
})();
