'use strict';

/**
 * Craftera AI Context (AP-8.10).
 *
 * Baut einen strukturierten Kontext für die AI auf: Scene, Entities,
 * Components und Selection. Die AI kann damit kontextbezogen antworten.
 */

/**
 * Baut den AI-Kontext aus Projekt und Auswahl.
 * @param {object} project - GameProject-Objekt.
 * @param {object} opts - { selectedEntityIds? }.
 * @returns {object} Kontext-Objekt.
 */
function buildAiContext(project, opts = {}) {
  if (!project || !Array.isArray(project.entities)) {
    throw new Error('buildAiContext: Projekt benötigt ein entities-Array');
  }

  const selectedIds = new Set(opts.selectedEntityIds || []);

  const scenes = (project.scenes || []).map((scene) => ({
    sceneId: scene.sceneId,
    name: scene.name,
  }));

  const entities = project.entities.map((entity) => ({
    entityId: entity.entityId,
    name: entity.name,
    sceneId: entity.sceneId,
    parentId: entity.parentId,
    transform: entity.transform,
    components: (entity.components || []).map((comp) => ({
      componentId: comp.componentId,
      type: comp.type,
      props: comp.props,
    })),
  }));

  const selection = entities.filter((e) => selectedIds.has(e.entityId));

  return {
    project: { name: project.name, formatVersion: project.formatVersion },
    scenes,
    entities,
    selection,
  };
}

module.exports = { buildAiContext };
