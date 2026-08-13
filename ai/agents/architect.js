'use strict';

/**
 * Craftera Architect (AP-12.3).
 *
 * Übersetzt ein GDD (Game Design Document, AP-12.1) in eine konkrete
 * Architektur: Scenes, Entities und Components, die das Spiel umsetzen.
 * Nutzt einen AIProvider (Standard: OpenAI-kompatibler Provider via Ollama-Cloud).
 *
 * Die Architektur wird in drei kleinen, fokussierten Schritten erzeugt
 * (Scenes → Entities → Components), damit die Modelle keine zu langen
 * Antworten liefern müssen (robust gegen Token-Limits).
 *
 * Verifikation (DoD): "Architektur erzeugt" — aus einem GDD entsteht eine
 * konsistente Architektur (scenes, entities, components).
 */

const { createScene } = require('../../engine/scene.js');
const { createEntity } = require('../../engine/entity.js');
const { addComponent } = require('../../engine/component.js');
const { OpenAICompatibleProvider } = require('../providers/openaiCompatibleProvider.js');

// System-Prompt für Scenes.
const SCENES_PROMPT = `Du bist der Architect einer AI-Spieleplattform.
Erzeuge aus dem GDD die Szenen des Spiels. Erzeuge höchstens 2 Szenen.
Antworte ausschließlich mit gültigem JSON: {"scenes":[{"name":"Szenenname","description":"Kurzbeschreibung"}]}`;

// System-Prompt für Entities.
const ENTITIES_PROMPT = `Du bist der Architect einer AI-Spieleplattform.
Erzeuge aus dem GDD und den Szenen die Entities des Spiels. Erzeuge höchstens 4 Entities.
Antworte ausschließlich mit gültigem JSON: {"entities":[{"name":"Entity-Name","scene":"Szenenname","transform":{"x":0,"y":0,"scale":1,"rotation":0}}]}`;

// System-Prompt für Components.
const COMPONENTS_PROMPT = `Du bist der Architect einer AI-Spieleplattform.
Erzeuge aus dem GDD und den Entities die Components des Spiels. Erzeuge höchstens 8 Components.
Erlaubte Component-Typen: sprite, player-controller, collider, audio, text, behavior.
Antworte ausschließlich mit gültigem JSON: {"components":[{"entity":"Entity-Name","type":"sprite","props":{}}]}`;

/**
 * Architect — erzeugt eine Architektur aus einem GDD.
 */
class Architect {
  /**
   * @param {object} options - { provider?, model? }
   */
  constructor(options = {}) {
    this.provider = options.provider || new OpenAICompatibleProvider({ model: options.model });
  }

  /**
   * Erzeugt eine Architektur (Scenes, Entities, Components) aus einem GDD.
   * @param {object} gdd - GDD-Objekt.
   * @param {object} opts - { model? }
   * @returns {Promise<object>} { scenes, entities, components }.
   */
  async architect(gdd, opts = {}) {
    if (!gdd || !gdd.title) {
      throw new Error('Architect.architect: "gdd" mit title ist erforderlich');
    }
    const gddJson = JSON.stringify(gdd);

    // Schritt 1: Scenes.
    const scenesResult = await this.provider.generateStructured({
      messages: [
        { role: 'system', content: SCENES_PROMPT },
        { role: 'user', content: gddJson },
      ],
      model: opts.model,
      maxTokens: 2000,
    });

    // Schritt 2: Entities (mit Szenen als Kontext).
    const scenes = [];
    const sceneByName = {};
    for (const def of (Array.isArray(scenesResult.scenes) ? scenesResult.scenes : [])) {
      const scene = createScene({ name: def.name || 'Scene' });
      scenes.push(scene);
      sceneByName[scene.name] = scene;
    }
    if (scenes.length === 0) {
      const scene = createScene({ name: 'Main' });
      scenes.push(scene);
      sceneByName[scene.name] = scene;
    }

    const entitiesResult = await this.provider.generateStructured({
      messages: [
        { role: 'system', content: ENTITIES_PROMPT },
        { role: 'user', content: `${gddJson}\n\nSzenen: ${JSON.stringify(scenes.map((s) => s.name))}` },
      ],
      model: opts.model,
      maxTokens: 2000,
    });

    // Schritt 3: Components (mit Entities als Kontext).
    const entities = [];
    const entityByName = {};
    for (const def of (Array.isArray(entitiesResult.entities) ? entitiesResult.entities : [])) {
      const scene = sceneByName[def.scene] || scenes[0];
      const entity = createEntity({
        sceneId: scene.sceneId,
        name: def.name || 'Entity',
        transform: def.transform || {},
      });
      entities.push(entity);
      entityByName[entity.name] = entity;
    }
    // Fallback: mindestens eine Entity, falls keine definiert.
    if (entities.length === 0) {
      const entity = createEntity({ sceneId: scenes[0].sceneId, name: 'Player' });
      entities.push(entity);
      entityByName[entity.name] = entity;
    }

    const componentsResult = await this.provider.generateStructured({
      messages: [
        { role: 'system', content: COMPONENTS_PROMPT },
        { role: 'user', content: `${gddJson}\n\nEntities: ${JSON.stringify(entities.map((e) => e.name))}` },
      ],
      model: opts.model,
      maxTokens: 2000,
    });

    const components = [];
    for (const def of (Array.isArray(componentsResult.components) ? componentsResult.components : [])) {
      const entity = entityByName[def.entity];
      if (!entity) continue;
      addComponent(entity, { type: def.type || 'sprite', props: def.props || {} });
      components.push({ entity: entity.name, type: def.type || 'sprite' });
    }

    return { scenes, entities, components };
  }
}

module.exports = { Architect, SCENES_PROMPT, ENTITIES_PROMPT, COMPONENTS_PROMPT };
