'use strict';

/**
 * Craftera OpenAI-kompatibler Provider (AP-8.6).
 *
 * Implementiert das AIProvider-Interface (AP-8.1) gegen einen beliebigen
 * OpenAI-kompatiblen Endpoint (z.B. Ollama-Cloud unter https://ollama.com/v1).
 *
 * Konfiguration:
 *   - baseUrl:  Endpoint-Basis (Standard: https://ollama.com/v1)
 *   - apiKey:   API-Key (aus CredentialStore oder Env OLLAMA_FREE_KEY_*)
 *   - model:    Standard-Modell (Standard: minimax-m3)
 *
 * Verifikation (DoD): "generate funktioniert" — Live-Test gegen den
 * Ollama-Cloud-Endpoint liefert eine echte Antwort.
 */

const { AIProvider } = require('./aiProvider.js');

// Verfügbare Modelle auf Ollama-Cloud (frei nutzbar, Live-getestet).
const DEFAULT_MODEL = 'minimax-m3';
const FREE_MODELS = ['minimax-m3', 'gemma4:31b', 'gpt-oss:20b', 'nemotron-3-nano:30b'];

/**
 * Liest den ersten gesetzten OLLAMA_FREE_KEY_*-Wert aus der Umgebung.
 * @returns {string|null}
 */
function ollamaFreeKey() {
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('OLLAMA_FREE_KEY_') && value) {
      return value;
    }
  }
  return null;
}

/**
 * Extrahiert JSON aus einer Modell-Antwort (entfernt Markdown-Codefences).
 * @param {string} text - Rohe Antwort.
 * @returns {object} Geparstes JSON.
 */
function parseJsonResponse(text) {
  const cleaned = String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // JSON aus dem Text extrahieren (zwischen ersten { und letzten }).
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error('OpenAICompatibleProvider: Antwort ist kein gültiges JSON');
  }
}

/**
 * OpenAI-kompatibler Provider.
 */
class OpenAICompatibleProvider extends AIProvider {
  /**
   * @param {object} options - { baseUrl?, apiKey?, model?, fetch? }
   */
  constructor(options = {}) {
    super();
    this.baseUrl = (options.baseUrl || 'https://ollama.com/v1').replace(/\/$/, '');
    this.apiKey = options.apiKey || ollamaFreeKey() || '';
    this.model = options.model || DEFAULT_MODEL;
    this._fetch = options.fetch || global.fetch;
  }

  /** Führt einen Chat-Completion-Request aus. */
  async _chat(messages, opts = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAICompatibleProvider: Kein API-Key (OLLAMA_FREE_KEY_* oder apiKey)');
    }
    const res = await this._fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: opts.model || this.model,
        messages,
        max_tokens: opts.maxTokens || 256,
        temperature: opts.temperature !== undefined ? opts.temperature : 0.7,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAICompatibleProvider: HTTP ${res.status} ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    return data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : '';
  }

  /** Erzeugt eine Text-Antwort. */
  async generate(params = {}) {
    const messages = params.messages || [];
    return this._chat(messages, { model: params.model, temperature: params.temperature });
  }

  /** Erzeugt eine gestreamte Antwort (simuliert über generate). */
  async stream(params = {}) {
    const full = await this.generate(params);
    const onToken = params.onToken;
    if (typeof onToken === 'function') {
      onToken(full);
    }
    return full;
  }

  /** Erzeugt eine strukturierte Antwort (JSON). */
  async generateStructured(params = {}) {
    const messages = (params.messages || []).concat([
      { role: 'system', content: 'Antworte ausschließlich mit gültigem JSON.' },
    ]);
    const text = await this._chat(messages, { model: params.model, maxTokens: params.maxTokens || 800 });
    return parseJsonResponse(text);
  }

  /** Tool-Call (nicht unterstützt — ehrlich). */
  async toolCall() {
    throw new Error('OpenAICompatibleProvider.toolCall: nicht unterstützt');
  }

  /** Vision (nicht unterstützt — ehrlich). */
  async vision() {
    throw new Error('OpenAICompatibleProvider.vision: nicht unterstützt');
  }

  /** Embeddings (nicht unterstützt — ehrlich). */
  async embeddings() {
    throw new Error('OpenAICompatibleProvider.embeddings: nicht unterstützt');
  }

  /** Liefert die Fähigkeiten. */
  capabilities() {
    return {
      generate: true,
      stream: true,
      structured: true,
      tools: false,
      vision: false,
      embeddings: false,
    };
  }
}

module.exports = { OpenAICompatibleProvider, ollamaFreeKey, parseJsonResponse, DEFAULT_MODEL, FREE_MODELS };
