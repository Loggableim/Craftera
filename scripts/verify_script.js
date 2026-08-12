'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createProject } = require('../engine/project.js');
const { createScene } = require('../engine/scene.js');
const { createEntity } = require('../engine/entity.js');
const { addComponent } = require('../engine/component.js');
const { compileComponents } = require('../runtime/godot/scriptBridge.js');

const outDir = 'C:/Users/logga/craftera-tools/script-build';
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, 'scripts'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'scenes'), { recursive: true });

const project = createProject({ name: 'Script Test' });
const scene = createScene({ name: 'Main' });
project.scenes.push(scene);
const player = createEntity({ sceneId: scene.sceneId, name: 'Player' });
addComponent(player, { type: 'sprite', props: { color: '#ff0000', speed: 5 } });
project.entities.push(player);

const rels = compileComponents(project, outDir);
console.log('SCRIPTS_COMPILED', rels);

// project.godot + Main-Scene schreiben, damit Godot das Projekt headless lädt.
const mainScene = 'scenes/main.tscn';
fs.writeFileSync(
  path.join(outDir, 'scenes', 'main.tscn'),
  '[gd_scene load_steps=2 format=3]\n\n[ext_resource type="Script" path="res://scripts/sprite.gd" id="1_sprite"]\n\n[node name="Root" type="Node2D"]\nscript = ExtResource("1_sprite")\n',
  'utf8'
);
fs.writeFileSync(
  path.join(outDir, 'project.godot'),
  `config_version=5\n\n[application]\n\nconfig/name="Script Test"\nrun/main_scene="res://${mainScene}"\nconfig/features=PackedStringArray("4.7")\n`,
  'utf8'
);
console.log('PROJECT_READY', outDir);
