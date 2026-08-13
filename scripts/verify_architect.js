'use strict';
// Verifikation AP-12.3: Architect erzeugt Architektur real (Ollama-Cloud).
const { Architect } = require('../ai/agents/architect.js');
const { createGDD } = require('../engine/gdd.js');

(async () => {
  const gdd = createGDD({
    title: 'Stellar Drift',
    genre: 'Arcade-Rennspiel',
    summary: 'Weltraum-Rennspiel mit Asteroiden-Ausweichen und Power-Ups.',
    coreLoop: 'Rase durch Asteroidenfelder, sammle Power-Ups, schlage Bestzeiten.',
    features: ['Power-Ups', 'Mehrere Raumschiffe', 'Bestenlisten'],
    controls: 'Pfeiltasten/WASD zum Steuern, Leertaste für Boost',
  });

  const architect = new Architect({});
  const result = await architect.architect(gdd);
  console.log('SCENES:', result.scenes.map((s) => s.name));
  console.log('ENTITIES:', result.entities.map((e) => `${e.name} (${e.components.length} comps)`));
  if (result.scenes.length > 0 && result.entities.length > 0) {
    console.log('VERIFY_OK');
  } else {
    console.log('VERIFY_FAIL');
    process.exit(1);
  }
})();
