'use strict';

/**
 * Unit-Tests für den OpenAI-kompatiblen Provider (AP-8.6).
 * Läuft mit Node's eingebautem Test-Runner: `npm test`.
 */

const test = require('node:test');
const assert = require('node:assert');

const { OpenAICompatibleProvider, ollamaFreeKey, DEFAULT_MODEL, FREE_MODELS } = require('../ai/providers/openaiCompatibleProvider.js');

/** Mock-Fetch, der eine OpenAI-kompatible Antwort liefert. */
function mockFetch(responseBody, status = 200) {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(responseBody),
    json: async () => responseBody,
  });
}

test('DEFAULT_MODEL und FREE_MODELS sind definiert', () => {
  assert.strictEqual(DEFAULT_MODEL, 'minimax-m3');
  assert.ok(FREE_MODELS.includes('minimax-m3'));
});

test('ollamaFreeKey liest OLLAMA_FREE_KEY_* aus der Umgebung', () => {
  const key = ollamaFreeKey();
  assert.strictEqual(typeof key, 'string');
  assert.ok(key.length > 0);
});

test('generate liefert die Antwort des Endpoints', async () => {
  const provider = new OpenAICompatibleProvider({
    apiKey: 'test-key',
    fetch: mockFetch({ choices: [{ message: { content: 'Hallo Welt' } }] }),
  });
  const result = await provider.generate({ messages: [{ role: 'user', content: 'hi' }] });
  assert.strictEqual(result, 'Hallo Welt');
});

test('generate wirft ohne API-Key', async () => {
  // Env-Keys temporär entfernen, um den Fehlerfall zu erzwingen.
  const saved = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith('OLLAMA_FREE_KEY_')) { saved[k] = v; delete process.env[k]; }
  }
  try {
    const provider = new OpenAICompatibleProvider({ apiKey: '', fetch: mockFetch({}) });
    await assert.rejects(() => provider.generate({ messages: [] }), /Kein API-Key/);
  } finally {
    Object.assign(process.env, saved);
  }
});

test('generate wirft bei HTTP-Fehler', async () => {
  const provider = new OpenAICompatibleProvider({
    apiKey: 'test-key',
    fetch: mockFetch({ error: 'boom' }, 500),
  });
  await assert.rejects(() => provider.generate({ messages: [] }), /HTTP 500/);
});

test('stream ruft onToken auf und liefert die volle Antwort', async () => {
  const provider = new OpenAICompatibleProvider({
    apiKey: 'test-key',
    fetch: mockFetch({ choices: [{ message: { content: 'Stream' } }] }),
  });
  let token = null;
  const result = await provider.stream({ messages: [], onToken: (t) => { token = t; } });
  assert.strictEqual(result, 'Stream');
  assert.strictEqual(token, 'Stream');
});

test('generateStructured parst JSON-Antwort', async () => {
  const provider = new OpenAICompatibleProvider({
    apiKey: 'test-key',
    fetch: mockFetch({ choices: [{ message: { content: '{"ok": true}' } }] }),
  });
  const result = await provider.generateStructured({ messages: [] });
  assert.deepStrictEqual(result, { ok: true });
});

test('capabilities meldet generate/stream/structured, keine tools/vision/embeddings', () => {
  const provider = new OpenAICompatibleProvider({ apiKey: 'x', fetch: mockFetch({}) });
  const caps = provider.capabilities();
  assert.strictEqual(caps.generate, true);
  assert.strictEqual(caps.stream, true);
  assert.strictEqual(caps.structured, true);
  assert.strictEqual(caps.tools, false);
  assert.strictEqual(caps.vision, false);
  assert.strictEqual(caps.embeddings, false);
});

test('toolCall/vision/embeddings werfen "nicht unterstützt"', async () => {
  const provider = new OpenAICompatibleProvider({ apiKey: 'x', fetch: mockFetch({}) });
  await assert.rejects(() => provider.toolCall({}), /nicht unterstützt/);
  await assert.rejects(() => provider.vision({}), /nicht unterstützt/);
  await assert.rejects(() => provider.embeddings({}), /nicht unterstützt/);
});
