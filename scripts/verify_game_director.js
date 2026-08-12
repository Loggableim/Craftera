'use strict';
// Verifikation AP-12.2: Game Director erzeugt GDD real (Ollama-Cloud).
const { GameDirector } = require('../ai/agents/gameDirector.js');

(async () => {
  const director = new GameDirector({});
  const gdd = await director.direct('Ein Weltraum-Rennspiel, bei dem man Asteroiden ausweicht und Power-Ups sammelt');
  console.log('GDD:', JSON.stringify(gdd, null, 2));
  if (gdd.title && gdd.genre && gdd.coreLoop && Array.isArray(gdd.features) && gdd.features.length > 0) {
    console.log('VERIFY_OK');
  } else {
    console.log('VERIFY_FAIL');
    process.exit(1);
  }
})();
