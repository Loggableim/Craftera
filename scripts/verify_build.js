'use strict';
const { createProject } = require('../engine/project.js');
const { createScene } = require('../engine/scene.js');
const { createEntity } = require('../engine/entity.js');
const { addComponent } = require('../engine/component.js');
const { ProjectBuilder } = require('../runtime/godot/projectBuilder.js');

(async () => {
  const project = createProject({ name: 'Space Runner' });
  project.inputActions = [
    { name: 'move_left', keys: ['A', 'Left'] },
    { name: 'jump', keys: ['Space'] },
  ];

  const scene = createScene({ name: 'Main' });
  project.scenes.push(scene);

  const player = createEntity({ sceneId: scene.sceneId, name: 'Player', transform: { x: 10, y: 20 } });
  addComponent(player, { type: 'sprite', props: { color: '#ff0000', speed: 5 } });
  project.entities.push(player);

  project.assets.push({
    assetId: 'asset_1',
    type: 'image',
    name: 'player.png',
    data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  });

  const builder = new ProjectBuilder({ outputDir: 'C:/Users/logga/craftera-tools/full-build' });
  const result = await builder.build(project);
  console.log('BUILD_OK', JSON.stringify(result, null, 2));
})();
