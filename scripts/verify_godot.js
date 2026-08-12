'use strict';
const { createProject } = require('../engine/project.js');
const { createScene } = require('../engine/scene.js');
const { createEntity } = require('../engine/entity.js');
const { addComponent } = require('../engine/component.js');
const { GodotAdapter } = require('../runtime/godot/godotAdapter.js');

(async () => {
  const project = createProject({ experienceId: 'exp_1', name: 'Space Runner' });
  const scene = createScene({ name: 'Main' });
  project.scenes.push(scene);
  const player = createEntity({ sceneId: scene.sceneId, name: 'Player', transform: { x: 10, y: 20, scale: 2, rotation: 45 } });
  addComponent(player, { type: 'sprite', props: { color: '#ff0000' } });
  project.entities.push(player);

  const adapter = new GodotAdapter({ outputDir: 'C:/Users/logga/craftera-tools/godot-build' });
  const out = await adapter.build(project);
  console.log('BUILD_OK', out);
})();
