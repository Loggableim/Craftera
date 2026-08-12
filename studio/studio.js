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

  // Kamera-Zustand (AP-6.7): Zoom + Pan.
  const camera = { zoom: 1, panX: 0, panY: 0 };

  /**
   * Setzt den Zoom-Faktor der Kamera (AP-6.7).
   * @param {number} zoom - Neuer Zoom-Faktor (z.B. 0.5 … 3).
   */
  function setZoom(zoom) {
    camera.zoom = Math.max(0.1, Number(zoom) || 1);
  }

  /**
   * Verschiebt die Kamera (Pan) um dx/dy (AP-6.7).
   * @param {number} dx - X-Verschiebung.
   * @param {number} dy - Y-Verschiebung.
   */
  function panViewport(dx, dy) {
    camera.panX += Number(dx) || 0;
    camera.panY += Number(dy) || 0;
  }

  /**
   * Rendert das Viewport-Panel (AP-3.5, AP-6.1, AP-6.7).
   * Zeichnet den Hintergrund + Raster und rendert Entities als Sprites
   * (farbige Rechtecke an ihrer Transform-Position), unter Anwendung der
   * Kamera (Zoom + Pan).
   * @param {object[]} entities - Entities des Projekts (optional).
   */
  function renderViewport(entities = []) {
    const canvas = document.getElementById('viewport-canvas-el');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Hintergrund.
    ctx.fillStyle = '#0b0d11';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Kamera anwenden (Zoom + Pan).
    ctx.save();
    ctx.translate(camera.panX, camera.panY);
    ctx.scale(camera.zoom, camera.zoom);

    // Raster (im Weltraum).
    ctx.strokeStyle = '#1a1d24';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width / camera.zoom; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, -camera.panY);
      ctx.lineTo(x, canvas.height / camera.zoom);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height / camera.zoom; y += 40) {
      ctx.beginPath();
      ctx.moveTo(-camera.panX, y);
      ctx.lineTo(canvas.width / camera.zoom, y);
      ctx.stroke();
    }

    // Entities als Sprites zeichnen (AP-6.1).
    entities.forEach((entity) => {
      const t = entity.transform || { x: 0, y: 0, scale: 1, rotation: 0 };
      const size = 40 * (t.scale || 1);
      ctx.save();
      ctx.translate(t.x, t.y);
      if (t.rotation) ctx.rotate((t.rotation * Math.PI) / 180);
      ctx.fillStyle = '#2f6fed';
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    });

    ctx.restore();
  }

  /**
   * Objektselektion (AP-6.2).
   * Setzt die ausgewählte Entity und rendert den Inspector.
   * @param {object|null} entity - Ausgewählte Entity oder null.
   */
  function selectEntity(entity) {
    renderInspector(entity);
  }

  /**
   * Hit-Test: findet die Entity, deren Sprite die Klick-Koordinaten enthält.
   * @param {object[]} entities - Entities des Projekts.
   * @param {number} x - Klick-X (Canvas-Koordinate).
   * @param {number} y - Klick-Y (Canvas-Koordinate).
   * @returns {object|null} Getroffene Entity oder null.
   */
  function hitTestEntity(entities, x, y) {
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      const t = entity.transform || { x: 0, y: 0, scale: 1, rotation: 0 };
      const size = 40 * (t.scale || 1);
      const half = size / 2;
      if (x >= t.x - half && x <= t.x + half && y >= t.y - half && y <= t.y + half) {
        return entity;
      }
    }
    return null;
  }

  /**
   * Drag & Drop / Move (AP-6.3).
   * Verschiebt eine Entity auf neue Koordinaten (ändert den Transform).
   * @param {object} entity - Entity-Objekt.
   * @param {number} x - Neue X-Position.
   * @param {number} y - Neue Y-Position.
   * @returns {object} Der aktualisierte Transform.
   */
  function moveEntity(entity, x, y) {
    if (!entity || !entity.transform) {
      throw new Error('moveEntity: Entity benötigt ein transform-Objekt');
    }
    entity.transform.x = Number(x);
    entity.transform.y = Number(y);
    return entity.transform;
  }

  /**
   * Scale (AP-6.4).
   * Ändert die Größe einer Entity (ändert den Transform-Scale).
   * @param {object} entity - Entity-Objekt.
   * @param {number} scale - Neuer Scale-Wert.
   * @returns {object} Der aktualisierte Transform.
   */
  function scaleEntity(entity, scale) {
    if (!entity || !entity.transform) {
      throw new Error('scaleEntity: Entity benötigt ein transform-Objekt');
    }
    entity.transform.scale = Number(scale);
    return entity.transform;
  }

  /**
   * Rotate (AP-6.5).
   * Ändert die Rotation einer Entity (ändert den Transform-Rotation).
   * @param {object} entity - Entity-Objekt.
   * @param {number} rotation - Neue Rotation in Grad.
   * @returns {object} Der aktualisierte Transform.
   */
  function rotateEntity(entity, rotation) {
    if (!entity || !entity.transform) {
      throw new Error('rotateEntity: Entity benötigt ein transform-Objekt');
    }
    entity.transform.rotation = Number(rotation);
    return entity.transform;
  }

  /**
   * Grid + Snapping (AP-6.6).
   * Rundet einen Wert auf das nächstgelegene Raster-Vielfache.
   * @param {number} value - Zu rastender Wert.
   * @param {number} gridSize - Rastergröße (Standard: 40, entspricht dem Viewport-Raster).
   * @returns {number} Auf das Raster gerundeter Wert.
   */
  function snapToGrid(value, gridSize = 40) {
    return Math.round(Number(value) / gridSize) * gridSize;
  }

  /**
   * Multi-Select (AP-6.8).
   * Setzt eine Auswahl von mehreren Entities (rendert den Inspector mit
   * der zuletzt ausgewählten).
   * @param {object[]} entities - Ausgewählte Entities.
   */
  function selectEntities(entities) {
    if (!Array.isArray(entities)) {
      throw new Error('selectEntities: erwartet ein Array');
    }
    if (entities.length > 0) {
      renderInspector(entities[entities.length - 1]);
    } else {
      renderInspector(null);
    }
    return entities;
  }

  /**
   * Box-Select (AP-6.8).
   * Findet alle Entities, deren Sprite-Bounding-Box die Auswahl-Box schneidet.
   * @param {object[]} entities - Alle Entities.
   * @param {object} rect - { x, y, width, height } der Auswahl-Box.
   * @returns {object[]} Getroffene Entities.
   */
  function boxSelect(entities, rect) {
    if (!rect || rect.width === undefined || rect.height === undefined) {
      throw new Error('boxSelect: rect benötigt x, y, width, height');
    }
    const x1 = Math.min(rect.x, rect.x + rect.width);
    const x2 = Math.max(rect.x, rect.x + rect.width);
    const y1 = Math.min(rect.y, rect.y + rect.height);
    const y2 = Math.max(rect.y, rect.y + rect.height);

    return entities.filter((entity) => {
      const t = entity.transform || { x: 0, y: 0, scale: 1, rotation: 0 };
      const size = 40 * (t.scale || 1);
      const half = size / 2;
      const ex1 = t.x - half;
      const ex2 = t.x + half;
      const ey1 = t.y - half;
      const ey2 = t.y + half;
      // AABB-Schnitt.
      return ex1 <= x2 && ex2 >= x1 && ey1 <= y2 && ey2 >= y1;
    });
  }

  /**
   * Copy/Paste + Duplicate (AP-6.9).
   * Dupliziert eine Entity im Projekt: erzeugt eine Kopie mit neuer ID,
   * leicht versetzt, und fügt sie hinzu.
   * @param {object} project - GameProject-Objekt.
   * @param {object} entity - Zu duplizierende Entity.
   * @returns {object} Die neue (duplizierte) Entity.
   */
  function duplicateEntity(project, entity) {
    if (!project || !Array.isArray(project.entities)) {
      throw new Error('duplicateEntity: Projekt benötigt ein entities-Array');
    }
    const copy = JSON.parse(JSON.stringify(entity));
    copy.entityId = 'ent_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    if (copy.transform) {
      copy.transform.x += 20;
      copy.transform.y += 20;
    }
    project.entities.push(copy);
    return copy;
  }

  /**
   * Delete (AP-6.10).
   * Entfernt eine Entity aus dem Projekt.
   * @param {object} project - GameProject-Objekt.
   * @param {string} entityId - ID der zu löschenden Entity.
   * @returns {boolean} true, wenn gelöscht; false, wenn nicht gefunden.
   */
  function deleteEntity(project, entityId) {
    if (!project || !Array.isArray(project.entities)) {
      throw new Error('deleteEntity: Projekt benötigt ein entities-Array');
    }
    const idx = project.entities.findIndex((e) => e.entityId === entityId);
    if (idx === -1) return false;
    project.entities.splice(idx, 1);
    return true;
  }

  /**
   * Parenting + Layering (AP-6.11).
   * Setzt die parentId einer Entity (Reparent). newParentId '' = Wurzel.
   * @param {object} project - GameProject-Objekt.
   * @param {string} entityId - ID der Entity.
   * @param {string} newParentId - Neue parentId ('' für Wurzel).
   * @returns {object} Die aktualisierte Entity.
   */
  function reparentEntity(project, entityId, newParentId) {
    if (!project || !Array.isArray(project.entities)) {
      throw new Error('reparentEntity: Projekt benötigt ein entities-Array');
    }
    const entity = project.entities.find((e) => e.entityId === entityId);
    if (!entity) {
      throw new Error(`reparentEntity: Entity "${entityId}" nicht gefunden`);
    }
    entity.parentId = String(newParentId || '');
    return entity;
  }

  /**
   * Layering (AP-6.11): liefert die direkten Kinder einer Entity.
   * @param {object} project - GameProject-Objekt.
   * @param {string} parentId - parentId, deren Kinder gesucht werden.
   * @returns {object[]} Direkte Kinder.
   */
  function getChildren(project, parentId) {
    if (!project || !Array.isArray(project.entities)) {
      throw new Error('getChildren: Projekt benötigt ein entities-Array');
    }
    return project.entities.filter((e) => e.parentId === parentId);
  }

  /**
   * Hierarchy-Interaktion: Rename (AP-6.12).
   * Benennt eine Entity um.
   * @param {object} entity - Entity-Objekt.
   * @param {string} name - Neuer Name.
   * @returns {object} Die aktualisierte Entity.
   */
  function renameEntity(entity, name) {
    if (!entity) throw new Error('renameEntity: Entity ist erforderlich');
    entity.name = String(name || '');
    return entity;
  }

  /**
   * Hierarchy-Interaktion: Lock (AP-6.12).
   * Sperrt/entsperrt eine Entity (verhindert Bearbeitung).
   * @param {object} entity - Entity-Objekt.
   * @param {boolean} locked - true = gesperrt.
   * @returns {object} Die aktualisierte Entity.
   */
  function setEntityLocked(entity, locked) {
    if (!entity) throw new Error('setEntityLocked: Entity ist erforderlich');
    entity.locked = Boolean(locked);
    return entity;
  }

  /**
   * Hierarchy-Interaktion: Visibility (AP-6.12).
   * Blendet eine Entity ein/aus.
   * @param {object} entity - Entity-Objekt.
   * @param {boolean} visible - true = sichtbar.
   * @returns {object} Die aktualisierte Entity.
   */
  function setEntityVisible(entity, visible) {
    if (!entity) throw new Error('setEntityVisible: Entity ist erforderlich');
    entity.visible = Boolean(visible);
    return entity;
  }

  /**
   * Inspector-Edit: Transform (AP-6.13).
   * Setzt einen Transform-Wert (x/y/scale/rotation) einer Entity.
   * @param {object} entity - Entity-Objekt.
   * @param {string} key - Transform-Schlüssel (x/y/scale/rotation).
   * @param {number} value - Neuer Wert.
   * @returns {object} Der aktualisierte Transform.
   */
  function setTransformValue(entity, key, value) {
    if (!entity || !entity.transform) {
      throw new Error('setTransformValue: Entity benötigt ein transform-Objekt');
    }
    if (!['x', 'y', 'scale', 'rotation'].includes(key)) {
      throw new Error(`setTransformValue: Unbekannter Transform-Schlüssel "${key}"`);
    }
    entity.transform[key] = Number(value);
    return entity.transform;
  }

  /**
   * Inspector-Edit: Component-Prop (AP-6.13).
   * Setzt eine Property einer Component einer Entity.
   * @param {object} entity - Entity-Objekt.
   * @param {string} componentId - ID der Component.
   * @param {string} prop - Property-Name.
   * @param {*} value - Neuer Wert.
   * @returns {object} Die aktualisierte Component.
   */
  function setComponentProp(entity, componentId, prop, value) {
    if (!entity || !Array.isArray(entity.components)) {
      throw new Error('setComponentProp: Entity benötigt ein components-Array');
    }
    const component = entity.components.find((c) => c.componentId === componentId);
    if (!component) {
      throw new Error(`setComponentProp: Component "${componentId}" nicht gefunden`);
    }
    component.props[prop] = value;
    return component;
  }

  /**
   * Component-Add im Inspector (AP-6.14).
   * Fügt einer Entity eine Component hinzu.
   * @param {object} entity - Entity-Objekt.
   * @param {string} type - Component-Typ (z.B. "Sprite").
   * @param {object} [props] - Optionale Props.
   * @returns {object} Die erzeugte Component.
   */
  function addComponentToEntity(entity, type, props = {}) {
    if (!entity || !Array.isArray(entity.components)) {
      throw new Error('addComponentToEntity: Entity benötigt ein components-Array');
    }
    const typeStr = String(type || '').trim();
    if (!typeStr) throw new Error('addComponentToEntity: "type" ist erforderlich');
    const component = {
      componentId: 'comp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      type: typeStr,
      props: { ...(props || {}) },
    };
    entity.components.push(component);
    return component;
  }

  /**
   * Component-Remove im Inspector (AP-6.14).
   * Entfernt eine Component von einer Entity.
   * @param {object} entity - Entity-Objekt.
   * @param {string} componentId - ID der zu entfernenden Component.
   * @returns {boolean} true, wenn entfernt; false, wenn nicht gefunden.
   */
  function removeComponentFromEntity(entity, componentId) {
    if (!entity || !Array.isArray(entity.components)) {
      throw new Error('removeComponentFromEntity: Entity benötigt ein components-Array');
    }
    const idx = entity.components.findIndex((c) => c.componentId === componentId);
    if (idx === -1) return false;
    entity.components.splice(idx, 1);
    return true;
  }

  /**
   * Asset-Import (AP-6.15).
   * Fügt ein Asset (z.B. PNG als Sprite) zum Projekt hinzu und erzeugt eine
   * Entity mit Sprite-Component, die das Asset referenziert.
   * @param {object} project - GameProject-Objekt.
   * @param {object} input - { name, type, dataUrl? }
   * @returns {object} { asset, entity }.
   */
  function importAsset(project, input) {
    if (!project || !Array.isArray(project.assets) || !Array.isArray(project.entities)) {
      throw new Error('importAsset: Projekt benötigt assets- und entities-Arrays');
    }
    const name = String(input.name || '').trim();
    if (!name) throw new Error('importAsset: "name" ist erforderlich');

    const asset = {
      assetId: 'asset_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name,
      type: String(input.type || 'sprite'),
      dataUrl: String(input.dataUrl || ''),
    };
    project.assets.push(asset);

    const entity = {
      entityId: 'ent_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name,
      sceneId: '',
      parentId: '',
      transform: { x: 0, y: 0, scale: 1, rotation: 0 },
      components: [{ componentId: 'comp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8), type: 'Sprite', props: { assetId: asset.assetId } }],
    };
    project.entities.push(entity);

    return { asset, entity };
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
   * AI-Panel (AP-3.9, AP-8.12).
   * Chat-Gerüst mit echter Command-Ausführung: Bei Senden wird das Projekt
   * geladen, eine einfache Anweisung (z.B. "Verschiebe 200px") in einen
   * Command übersetzt, ausgeführt und gespeichert. Ohne API-Key wird eine
   * simulierte AI verwendet, die strukturierte Commands erzeugt.
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
      <input type="text" id="ai-input" class="ai-input" placeholder="z.B. Verschiebe 200px">
      <button type="button" id="ai-send" class="btn">Senden</button>
    `;
    body.appendChild(inputRow);

    const send = inputRow.querySelector('#ai-send');
    const input = inputRow.querySelector('#ai-input');

    /** Übersetzt eine einfache Anweisung in einen Command (simulierte AI). */
    function parseAiInstruction(text, project) {
      const lower = text.toLowerCase();
      const moveMatch = lower.match(/verschiebe\s+(\d+)px/);
      if (moveMatch) {
        const delta = Number(moveMatch[1]);
        const entity = project.entities[0];
        if (!entity) throw new Error('Keine Entity im Projekt zum Verschieben.');
        return { command: 'MoveEntity', entityId: entity.entityId, x: entity.transform.x + delta, y: entity.transform.y };
      }
      throw new Error('Anweisung nicht verstanden. Beispiel: "Verschiebe 200px"');
    }

    send.addEventListener('click', async () => {
      const text = input.value.trim();
      if (!text) return;
      const msg = document.createElement('div');
      msg.className = 'ai-message';
      msg.textContent = text;
      messages.appendChild(msg);
      input.value = '';

      const project = await loadProject();
      if (!project) {
        const hint = document.createElement('div');
        hint.className = 'ai-hint';
        hint.textContent = 'Kein Projekt geladen.';
        messages.appendChild(hint);
        return;
      }

      try {
        const command = parseAiInstruction(text, project);
        // Command ausführen (simulierte AI über die Command-API).
        const result = applyCommand(project, command);
        await saveProject(project);
        const done = document.createElement('div');
        done.className = 'ai-assistant';
        done.textContent = `Ausgeführt: ${command.command} (${result ? 'ok' : 'ok'}). Projekt gespeichert.`;
        messages.appendChild(done);
      } catch (err) {
        const hint = document.createElement('div');
        hint.className = 'ai-hint';
        hint.textContent = `Fehler: ${err.message}`;
        messages.appendChild(hint);
      }
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') send.click();
    });
  }

  /** Führt einen strukturierten Command inline aus (simulierte AI). */
  function applyCommand(project, command) {
    if (command.command === 'MoveEntity') {
      const entity = project.entities.find((e) => e.entityId === command.entityId);
      if (!entity) throw new Error('Entity nicht gefunden');
      entity.transform.x = Number(command.x);
      entity.transform.y = Number(command.y);
      return true;
    }
    throw new Error(`Unbekannter Command "${command.command}"`);
  }

  /**
   * Undo/Redo-UI (AP-5.9).
   * Verbindet die CommandHistory mit den Toolbar-Buttons. Die Buttons sind
   * aktiv/inaktiv je nach canUndo/canRedo; Klick führt undo/redo aus.
   */
  let history = null;

  /** Aktualisiert die Undo/Redo-Button-Zustände. */
  function updateUndoRedoButtons() {
    const undo = document.getElementById('undo-btn');
    const redo = document.getElementById('redo-btn');
    if (!undo || !redo) return;
    undo.disabled = !history || !history.canUndo();
    redo.disabled = !history || !history.canRedo();
  }

  /** Setzt die CommandHistory und aktualisiert die Buttons. */
  function setHistory(newHistory) {
    history = newHistory;
    updateUndoRedoButtons();
  }

  /** Initialisiert die Undo/Redo-Buttons. */
  function initUndoRedo() {
    const undo = document.getElementById('undo-btn');
    const redo = document.getElementById('redo-btn');
    if (!undo || !redo) return;

    undo.addEventListener('click', () => {
      if (history && history.undo()) {
        log('Undo ausgeführt.', 'info');
        updateUndoRedoButtons();
      }
    });
    redo.addEventListener('click', () => {
      if (history && history.redo()) {
        log('Redo ausgeführt.', 'info');
        updateUndoRedoButtons();
      }
    });

    updateUndoRedoButtons();
  }

  window.craftera = window.craftera || {};
  window.craftera.studio = {
    loadExperience, renderHierarchy, renderInspector, renderViewport, renderAssets,
    log, renderConsole, initPlayToolbar, setPlayState, renderAI,
    loadProject, saveProject, initSaveButton,
    initUndoRedo, setHistory, updateUndoRedoButtons,
    selectEntity, hitTestEntity, moveEntity, scaleEntity, rotateEntity, snapToGrid,
    setZoom, panViewport, selectEntities, boxSelect, duplicateEntity, deleteEntity,
    reparentEntity, getChildren, renameEntity, setEntityLocked, setEntityVisible,
    setTransformValue, setComponentProp, addComponentToEntity, removeComponentFromEntity,
    importAsset, applyCommand,
  };
})();
