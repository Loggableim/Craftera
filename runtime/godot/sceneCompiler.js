'use strict';

/**
 * Craftera SceneCompiler (AP-7.4).
 *
 * Kompiliert eine einzelne Scene (engine/scene.js) zusammen mit ihren
 * Entities (engine/entity.js) in eine Godot-PackedScene (.tscn).
 *
 * Verifikation (DoD): "Godot lädt Scene" — die kompilierte .tscn lässt sich
 * als Main-Scene eines Godot-Projekts headless laden.
 */

const fs = require('node:fs');
const path = require('node:path');

/**
 * Escaped einen String für Godot-Textformate (.tscn).
 */
function godotEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Erzeugt einen gültigen Godot-Node-Namen aus einem Entity-Namen.
 */
function nodeNameFor(entity) {
  const name = (entity.name || 'Entity').replace(/[^A-Za-z0-9_]/g, '_');
  return name || 'Entity';
}

/**
 * Kompiliert eine Scene in den Inhalt einer Godot-PackedScene (.tscn).
 * @param {object} scene - Scene-Objekt (sceneId, name).
 * @param {object} project - GameProject (für Entities/Components).
 * @returns {string} .tscn-Inhalt.
 */
function compileScene(scene, project) {
  if (!scene || !scene.sceneId) {
    throw new Error('SceneCompiler.compileScene: Scene benötigt eine sceneId');
  }
  if (!project || !Array.isArray(project.entities)) {
    throw new Error('SceneCompiler.compileScene: GameProject benötigt ein entities-Array');
  }

  const entities = project.entities.filter((e) => e.sceneId === scene.sceneId);
  const lines = [];
  lines.push('[gd_scene load_steps=2 format=3]');
  lines.push('');
  lines.push('[ext_resource type="Script" path="res://scripts/root.gd" id="1_root"]');
  lines.push('');
  lines.push('[node name="Root" type="Node2D"]');
  lines.push('script = ExtResource("1_root")');
  lines.push('');

  for (const entity of entities) {
    const t = entity.transform || { x: 0, y: 0, scale: 1, rotation: 0 };
    lines.push(`[node name="${godotEscape(nodeNameFor(entity))}" type="Node2D" parent="."]`);
    lines.push(`position = Vector2(${Number(t.x) || 0}, ${Number(t.y) || 0})`);
    if (Number(t.rotation)) {
      lines.push(`rotation = ${Number(t.rotation)}`);
    }
    if (Number(t.scale) && Number(t.scale) !== 1) {
      lines.push(`scale = Vector2(${Number(t.scale)}, ${Number(t.scale)})`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Kompiliert eine Scene und schreibt sie als .tscn-Datei.
 * @param {object} scene - Scene-Objekt.
 * @param {object} project - GameProject.
 * @param {string} outputPath - Zielpfad der .tscn-Datei.
 * @returns {string} Absoluter Pfad der geschriebenen Datei.
 */
function compileSceneToFile(scene, project, outputPath) {
  const content = compileScene(scene, project);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf8');
  return path.resolve(outputPath);
}

module.exports = {
  SceneCompiler: { compileScene, compileSceneToFile },
  compileScene,
  compileSceneToFile,
  godotEscape,
  nodeNameFor,
};
