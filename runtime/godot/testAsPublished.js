'use strict';

/**
 * Craftera Test-as-Published-Service (AP-7.11).
 *
 * Simuliert den "Test as Published"-Modus: baut aus dem GameProject ein
 * Package (AP-9.2), lädt das `game/game.project.json` aus dem Package
 * (als wäre es veröffentlicht), übersetzt es mit dem ProjectBuilder in ein
 * Godot-Projekt und startet Godot real.
 *
 * Verifikation (DoD): "Package läuft" — Godot startet das aus dem Package
 * gebaute Projekt headless (Exit 0).
 */

const fs = require('node:fs/promises');
const path = require('node:path');

const { buildPackage } = require('../../platform/package/packageBuilder.js');
const { ProjectBuilder } = require('./projectBuilder.js');
const { loadProject } = require('../../engine/serialization.js');
const { godotBinary } = require('./runtimeSession.js');
const { spawn } = require('node:child_process');

/**
 * Baut ein Package aus dem Projekt und startet Godot mit dem daraus
 * geladenen Projekt (Test as Published).
 * @param {string} dataDir - Datenverzeichnis.
 * @param {string} experienceId - ID der Experience.
 * @param {object} options - { packageDir?, buildDir?, timeoutMs? }
 * @returns {Promise<object>} { packageDir, outputDir, mainScene, exitCode, godot }
 */
async function testAsPublished(dataDir, experienceId, options = {}) {
  const projectDir = path.join(dataDir, 'projects', experienceId);
  const project = await loadProject(projectDir);
  if (!project) {
    throw new Error(`testAsPublished: Experience "${experienceId}" hat kein Projekt`);
  }

  // 1. Package bauen (AP-9.2).
  const packageRoot = options.packageDir || path.join(dataDir, 'packages');
  const packageDir = await buildPackage(project, packageRoot);

  // 2. Projekt aus dem Package laden (als wäre es veröffentlicht).
  const publishedProject = await loadProject(path.join(packageDir, 'game'));
  if (!publishedProject) {
    throw new Error('testAsPublished: game/game.project.json fehlt im Package');
  }

  // 3. In ein Godot-Projekt übersetzen.
  const buildDir = options.buildDir || path.join(dataDir, 'builds', `${experienceId}-published`);
  const builder = new ProjectBuilder({ outputDir: buildDir });
  const built = await builder.build(publishedProject);

  // 4. Godot starten (headless, --quit für Verifikation).
  const godot = godotBinary();
  const timeoutMs = options.timeoutMs || 30000;

  return new Promise((resolve, reject) => {
    const child = spawn(godot, ['--headless', '--path', built.outputDir, '--quit'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`testAsPublished: Godot-Start timeout nach ${timeoutMs}ms`));
    }, timeoutMs);

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`testAsPublished: Godot konnte nicht gestartet werden: ${err.message}`));
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        packageDir,
        outputDir: built.outputDir,
        mainScene: built.mainScene,
        exitCode: code,
        godot,
        stdout,
        stderr,
      });
    });
  });
}

module.exports = { testAsPublished };
