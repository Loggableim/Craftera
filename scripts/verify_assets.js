'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createProject } = require('../engine/project.js');
const { compileAssets } = require('../runtime/godot/resourceCompiler.js');

const outDir = 'C:/Users/logga/craftera-tools/asset-build';
try { fs.rmSync(outDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 }); } catch (e) { /* ignore */ }
fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });

const project = createProject({ name: 'Asset Test' });
// 1x1-PNG (base64).
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
project.assets.push(
  { assetId: 'asset_1', type: 'image', name: 'player.png', data: PNG },
  { assetId: 'asset_2', type: 'image', name: 'bg.png', data: PNG }
);

const rels = compileAssets(project, outDir);
console.log('ASSETS_COMPILED', rels.join(', '));

// project.godot schreiben, damit Godot das Projekt headless importieren kann.
const projectGodot = `config_version=5

[application]

config/name="Asset Test"
config/features=PackedStringArray("4.7")
`;
fs.writeFileSync(path.join(outDir, 'project.godot'), projectGodot, 'utf8');
console.log('PROJECT_READY', outDir);
