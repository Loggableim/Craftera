'use strict';

/**
 * Craftera Play-Service (AP-7.9).
 *
 * Startet die Runtime (Godot) für eine Experience real:
 *   1. Lädt das GameProject der Experience.
 *   2. Baut es mit dem ProjectBuilder in ein lauffähiges Godot-Projekt.
 *   3. Startet Godot headless mit dem gebauten Projekt.
 *
 * Verifikation (DoD): "Studio startet Runtime" — der Play-Aufruf startet
 * Godot real (Prozess läuft, Exit-Code 0 nach --quit).
 */

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const { ProjectBuilder } = require('./projectBuilder.js');
const { loadProject } = require('../../engine/serialization.js');

/**
 * Ermittelt den Godot-Binärpfad.
 * @returns {string} Pfad zur Godot-Console-Exe.
 */
function godotBinary() {
  const env = process.env.GODOT_BIN;
  // GODOT_BIN darf nur eine ausführbare .exe sein (spawn kann bash-Skripte nicht direkt ausführen).
  if (env && fs.existsSync(env) && env.toLowerCase().endsWith('.exe')) return env;
  const home = process.env.USERPROFILE || process.env.HOME || '';
  const candidates = [
    path.join(home, 'craftera-tools', 'godot', 'Godot_v4.7.1-stable_win64_console.exe'),
    path.join(home, 'craftera-tools', 'godot', 'Godot_v4.7.1-stable_win64.exe'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return 'godot';
}

/**
 * Startet die Runtime für eine Experience.
 * @param {string} dataDir - Datenverzeichnis.
 * @param {string} experienceId - ID der Experience.
 * @param {object} options - { buildDir?, timeoutMs? }
 * @returns {Promise<object>} { outputDir, mainScene, exitCode, godot }
 */
async function play(dataDir, experienceId, options = {}) {
  const projectDir = path.join(dataDir, 'projects', experienceId);
  const project = await loadProject(projectDir);
  if (!project) {
    throw new Error(`play: Experience "${experienceId}" hat kein Projekt`);
  }

  const buildDir = options.buildDir || path.join(dataDir, 'builds', experienceId);
  const builder = new ProjectBuilder({ outputDir: buildDir });
  const built = await builder.build(project);

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
      reject(new Error(`play: Godot-Start timeout nach ${timeoutMs}ms`));
    }, timeoutMs);

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`play: Godot konnte nicht gestartet werden: ${err.message}`));
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
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

module.exports = { play, godotBinary };
