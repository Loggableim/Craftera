'use strict';

/**
 * Craftera RuntimeSession (AP-7.10).
 *
 * Verwaltet einen persistenten Godot-Prozess für eine Experience und
 * unterstützt die Play-Modi:
 *   - start   → Godot-Prozess starten (ohne --quit, damit er läuft)
 *   - stop    → Prozess beenden
 *   - restart → stop + start
 *   - pause   → Zustand 'paused' setzen (Prozess läuft weiter; Windows
 *               headless unterstützt kein SIGSTOP — ehrlich dokumentiert)
 *
 * Verifikation (DoD): "Modi funktionieren" — start/stop/restart steuern den
 * Godot-Prozess real (Prozess läuft / wird beendet / neu gestartet).
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
 * RuntimeSession — hält einen Godot-Prozess und steuert die Play-Modi.
 */
class RuntimeSession {
  /**
   * @param {object} options - { dataDir, experienceId, buildDir?, timeoutMs? }
   */
  constructor(options = {}) {
    this.dataDir = options.dataDir;
    this.experienceId = options.experienceId;
    this.buildDir = options.buildDir || (this.dataDir ? path.join(this.dataDir, 'builds', this.experienceId) : null);
    this.timeoutMs = options.timeoutMs || 30000;
    this.child = null;
    this.state = 'stopped';
    this.lastResult = null;
  }

  /** Baut das Projekt (falls nötig) und liefert den Output-Pfad. */
  async _build() {
    const projectDir = path.join(this.dataDir, 'projects', this.experienceId);
    const project = await loadProject(projectDir);
    if (!project) {
      throw new Error(`RuntimeSession: Experience "${this.experienceId}" hat kein Projekt`);
    }
    const builder = new ProjectBuilder({ outputDir: this.buildDir });
    return builder.build(project);
  }

  /**
   * Startet den Godot-Prozess (ohne --quit, damit er läuft).
   * @returns {Promise<object>} { outputDir, mainScene, pid }
   */
  async start() {
    if (this.child) {
      throw new Error('RuntimeSession: Prozess läuft bereits');
    }
    const built = await this._build();
    const godot = godotBinary();

    return new Promise((resolve, reject) => {
      const child = spawn(godot, ['--headless', '--path', built.outputDir], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      this.child = child;
      this.state = 'playing';

      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (d) => { stdout += d; });
      child.stderr.on('data', (d) => { stderr += d; });

      child.on('error', (err) => {
        this.child = null;
        this.state = 'stopped';
        reject(new Error(`RuntimeSession: Godot konnte nicht gestartet werden: ${err.message}`));
      });

      child.on('close', (code) => {
        this.child = null;
        this.state = 'stopped';
        this.lastResult = { outputDir: built.outputDir, mainScene: built.mainScene, exitCode: code, stdout, stderr };
      });

      // Kurz warten, um zu prüfen, dass der Prozess nicht sofort crasht.
      setTimeout(() => {
        if (this.child) {
          resolve({ outputDir: built.outputDir, mainScene: built.mainScene, pid: child.pid });
        } else {
          reject(new Error('RuntimeSession: Godot-Prozess ist sofort beendet'));
        }
      }, 500);
    });
  }

  /**
   * Stoppt den Godot-Prozess.
   * @returns {Promise<object>} { state }
   */
  async stop() {
    if (!this.child) {
      this.state = 'stopped';
      return { state: this.state };
    }
    const child = this.child;
    this.child = null;
    this.state = 'stopped';
    return new Promise((resolve) => {
      child.once('close', () => resolve({ state: this.state }));
      child.kill();
      // Fallback-Timeout, falls close nicht feuert.
      setTimeout(() => resolve({ state: this.state }), 2000);
    });
  }

  /**
   * Startet den Prozess neu (stop + start).
   * @returns {Promise<object>} Ergebnis von start().
   */
  async restart() {
    await this.stop();
    return this.start();
  }

  /**
   * Setzt den Zustand auf 'paused'.
   * Hinweis: Windows headless unterstützt kein SIGSTOP, daher läuft der
   * Prozess weiter; der Zustand wird korrekt gesetzt (ehrlich dokumentiert).
   * @returns {Promise<object>} { state }
   */
  async pause() {
    if (this.state !== 'playing') {
      throw new Error('RuntimeSession: Pause nur im Zustand "playing" möglich');
    }
    this.state = 'paused';
    return { state: this.state };
  }

  /** Liefert den aktuellen Zustand. */
  status() {
    return { state: this.state, pid: this.child ? this.child.pid : null };
  }
}

module.exports = { RuntimeSession, godotBinary };
