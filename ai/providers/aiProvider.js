'use strict';

/**
 * Craftera AIProvider-Interface (AP-8.1).
 *
 * Abstrakte Schnittstelle für AI-Provider (OpenAI, Anthropic, OpenRouter,
 * Ollama, OpenAI-kompatibel). Konkrete Provider implementieren diese
 * Methoden. Jede Methode ist abstrakt und wirft "nicht implementiert".
 */

/**
 * @class AIProvider
 * @description Abstraktes Interface. Nicht direkt instanziieren.
 */
class AIProvider {
  constructor() {
    if (new.target === AIProvider) {
      throw new Error('AIProvider ist abstrakt und kann nicht direkt instanziiert werden');
    }
  }

  /**
   * Erzeugt eine Text-Antwort.
   * @param {object} params - { messages, model?, temperature? }.
   * @returns {Promise<string>} Antworttext.
   */
  async generate(params) {
    throw new Error('AIProvider.generate ist nicht implementiert');
  }

  /**
   * Erzeugt eine gestreamte Text-Antwort.
   * @param {object} params - { messages, model?, onToken }.
   * @returns {Promise<string>} Vollständige Antwort.
   */
  async stream(params) {
    throw new Error('AIProvider.stream ist nicht implementiert');
  }

  /**
   * Erzeugt eine strukturierte Antwort (JSON-Schema).
   * @param {object} params - { messages, schema }.
   * @returns {Promise<object>} Strukturierte Antwort.
   */
  async generateStructured(params) {
    throw new Error('AIProvider.generateStructured ist nicht implementiert');
  }

  /**
   * Führt einen Tool-Call aus.
   * @param {object} params - { messages, tools }.
   * @returns {Promise<object>} Tool-Call-Ergebnis.
   */
  async toolCall(params) {
    throw new Error('AIProvider.toolCall ist nicht implementiert');
  }

  /**
   * Analysiert ein Bild.
   * @param {object} params - { image, prompt }.
   * @returns {Promise<string>} Bildbeschreibung.
   */
  async vision(params) {
    throw new Error('AIProvider.vision ist nicht implementiert');
  }

  /**
   * Erzeugt Embeddings.
   * @param {object} params - { input, model? }.
   * @returns {Promise<number[]>} Embedding-Vektor.
   */
  async embeddings(params) {
    throw new Error('AIProvider.embeddings ist nicht implementiert');
  }

  /**
   * Liefert die Fähigkeiten des Providers.
   * @returns {object} { generate, stream, structured, tools, vision, embeddings }.
   */
  capabilities() {
    throw new Error('AIProvider.capabilities ist nicht implementiert');
  }
}

module.exports = { AIProvider };
