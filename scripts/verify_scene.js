'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createProject } = require('../engine/project.js');
const { createScene } = require('../engine/scene.js');
const { createEntity } = require('../engine/entity.js');
const { addComponent } = require('../engine/component.js');
const { compileSceneToFile } = require('../runtime/godot/sceneCompiler.js');

const outDir = 'C:/Users/logga/craftera-tools/scene-build';
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, 'scenes'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'scripts'), { recursive: true });

const project = createProject({ name: 'Scene Test' });
const scene = createScene({ name: 'Main' });
project.scenes.push(scene);
const player = createEntity({ sceneId: scene.sceneId, name: 'Player', transform: { x: 10, y: 20, scale: 2, rotation: 45 } });
addComponent(player, { type: 'sprite', props: { color: '#ff0000' } });
project.entities.push(player);

const sceneFile = compileSceneToFile(scene, project, path.join(outDir, 'scenes', `${scene.sceneId}.tscn`));
console.log('SCENE_COMPILED', sceneFile);

// Root-Skript + project.godot schreiben, damit Godot die Scene als Main laden kann.
fs.writeFileSync(path.join(outDir, 'scripts', 'root.gd'), 'extends Node2D\nfunc _ready() -> void:\n\tpass\n', 'utf8');
const mainScene = `scenes/${path.basename(sceneFile)}`;
const projectGodot = `config_version=5\n\n[application]\n\nconfig/name="Scene Test"\nrun/main_scene="res://${mainScene}"\nconfig/features=PackedStringArray("4.7")\n`;
fs.writeFileSync(path.join(outDir, 'project.godot'), projectGodot, 'utf8');
console.log('PROJECT_READY', outDir);
