'use strict';

/**
 * Craftera Task-Modell (AP-12.5).
 *
 * Ein Task repräsentiert eine einzelne Arbeitseinheit im AI Game Factory-Flow
 * (Master Prompt §45). Felder:
 *   id, title, description, agent, priority, dependencies, inputs, outputs,
 *   ownedResources, acceptanceCriteria, tests, status.
 *
 * Status (AP-12.6): BACKLOG → READY → IN_PROGRESS → REVIEW → TESTING → DONE.
 */

const { createId } = require('./ids.js');

// Erlaubte Agent-Typen (AP-12.7).
const AGENTS = ['gameplay', 'scene', 'ui', 'asset', 'code', 'test'];

// Erlaubte Prioritäten.
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

// Erlaubte Status (AP-12.6).
const TASK_STATUSES = [
  'BACKLOG',
  'READY',
  'IN_PROGRESS',
  'REVIEW',
  'TESTING',
  'BLOCKED',
  'FAILED',
  'DONE',
];

/**
 * Erzeugt einen neuen Task.
 * @param {object} input - { title, agent, priority?, description?, dependencies?,
 *   inputs?, outputs?, ownedResources?, acceptanceCriteria?, tests? }
 * @returns {object} Task-Objekt.
 */
function createTask(input = {}) {
  const agent = String(input.agent || '');
  if (!AGENTS.includes(agent)) {
    throw new Error(`createTask: unbekannter Agent "${agent}". Erlaubt: ${AGENTS.join(', ')}`);
  }
  const priority = String(input.priority || 'medium');
  if (!PRIORITIES.includes(priority)) {
    throw new Error(`createTask: unbekannte Priorität "${priority}". Erlaubt: ${PRIORITIES.join(', ')}`);
  }

  return {
    id: createId('task'),
    title: String(input.title || ''),
    description: String(input.description || ''),
    agent,
    priority,
    dependencies: Array.isArray(input.dependencies) ? input.dependencies.map(String) : [],
    inputs: Array.isArray(input.inputs) ? input.inputs.map(String) : [],
    outputs: Array.isArray(input.outputs) ? input.outputs.map(String) : [],
    ownedResources: Array.isArray(input.ownedResources) ? input.ownedResources.map(String) : [],
    acceptanceCriteria: Array.isArray(input.acceptanceCriteria) ? input.acceptanceCriteria.map(String) : [],
    tests: Array.isArray(input.tests) ? input.tests.map(String) : [],
    status: 'BACKLOG',
  };
}

module.exports = { createTask, AGENTS, PRIORITIES, TASK_STATUSES };
