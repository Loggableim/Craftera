'use strict';
// Verifikation AP-8.6: Live-Test des OpenAI-kompatiblen Providers gegen Ollama-Cloud.
const { OpenAICompatibleProvider } = require('../ai/providers/openaiCompatibleProvider.js');

(async () => {
  const provider = new OpenAICompatibleProvider({ model: 'minimax-m3' });
  const result = await provider.generate({
    messages: [{ role: 'user', content: 'Antworte nur mit: OK' }],
    maxTokens: 10,
  });
  console.log('GENERATE_RESULT:', JSON.stringify(result));
  if (result && result.trim().length > 0) {
    console.log('VERIFY_OK');
  } else {
    console.log('VERIFY_FAIL');
    process.exit(1);
  }
})();
