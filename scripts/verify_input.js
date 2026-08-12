'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createProject } = require('../engine/project.js');
const { createScene } = require('../engine/scene.js');
const { compileInput } = require('../runtime/godot/inputBridge.js');

const outDir = 'C:/Users/logga/craftera-tools/input-build';
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, 'scenes'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'scripts'), { recursive: true });

const project = createProject({ name: 'Input Test' });
project.inputActions = [
  { name: 'move_left', keys: ['A', 'Left'] },
  { name: 'move_right', keys: ['D', 'Right'] },
  { name: 'jump', keys: ['Space'] },
];

const mainScene = 'scenes/main.tscn';
fs.writeFileSync(
  path.join(outDir, 'scenes', 'main.tscn'),
  '[gd_scene load_steps=2 format=3]\n\n[ext_resource type="Script" path="res://scripts/root.gd" id="1_root"]\n\n[node name="Root" type="Node2D"]\nscript = ExtResource("1_root")\n',
  'utf8'
);
fs.writeFileSync(path.join(outDir, 'scripts', 'root.gd'), 'extends Node2D\nfunc _ready() -> void:\n\tpass\n', 'utf8');

const result = compileInput(project, outDir, mainScene);
console.log('INPUT_COMPILED', result);
console.log('PROJECT_READY', outDir);
