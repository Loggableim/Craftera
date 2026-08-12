'use strict';

/**
 * Unit-Tests für LocalExperienceRegistry.launch (AP-10.8).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { LocalExperienceRegistry } = require('../platform/registry/localExperienceRegistry.js');
const { createExperience } = require('../engine/experience.js');
const { createProject } = require('../engine/project.js');
const { createScene } = require('../engine/scene.js');
const { createEntity } = require('../engine/entity.js');
const { addComponent } = require('../engine/component.js');
const { saveProject } = require('../engine/serialization.js');
const { buildPackage } = require('../platform/package/packageBuilder.js');

async function makeTempDataDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'craftera-launch-'));
}

/** Legt eine Experience mit Package + Projekt an und installiert sie. */
async function seedInstalled(dataDir) {
  const registry = new LocalExperienceRegistry(dataDir);
  const exp = createExperience({ name: 'Launch Test' });
  await registry.experienceRepo.create(exp);

  const project = createProject({ experienceId: exp.experienceId, name: 'Launch Test' });
  const scene = createScene({ name: 'Main' });
  project.scenes.push(scene);
  const player = createEntity({ sceneId: scene.sceneId, name: 'Player', transform: { x: 5, y: 5 } });
  addComponent(player, { type: 'sprite', props: { color: '#00ff00' } });
  project.entities.push(player);

  // Projekt speichern + Package bauen.
  const projectDir = path.join(dataDir, 'projects', exp.experienceId);
  await fs.mkdir(projectDir, { recursive: true });
  await saveProject(projectDir, project);

  // Package bauen und installieren.
  const packageDir = await buildPackage(project, path.join(dataDir, 'packages'));
  const installedDir = path.join(dataDir, 'installed', exp.experienceId);
  await fs.mkdir(installedDir, { recursive: true });
  await copyDir(packageDir, installedDir);

  return { registry, exp, project, scene };
}

async function copyDir(src, dest) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

test('launch startet installierte Experience real (Godot startet)', async () => {
  const dataDir = await makeTempDataDir();
  const { registry, exp, scene } = await seedInstalled(dataDir);

  const result = await registry.launch(exp.experienceId);
  assert.ok(result.outputDir.includes(exp.experienceId));
  assert.ok(result.mainScene.startsWith('scenes/'));
  assert.ok(result.pid > 0, 'Godot-Prozess muss gestartet sein');
  await fs.access(path.join(result.outputDir, 'project.godot'));
  await fs.access(path.join(result.outputDir, 'scenes', `${scene.sceneId}.tscn`));
});

test('launch wirft, wenn die Experience nicht installiert ist', async () => {
  const dataDir = await makeTempDataDir();
  const registry = new LocalExperienceRegistry(dataDir);
  await assert.rejects(() => registry.launch('exp_missing'), /nicht installiert/);
});
