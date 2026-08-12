'use strict';

/**
 * Craftera Game Director (AP-12.2).
 *
 * Übersetzt einen natürlichen Sprach-Prompt in ein GDD (Game Design Document).
 * Nutzt einen AIProvider (Standard: OpenAI-kompatibler Provider via Ollama-Cloud).
 *
 * Verifikation (DoD): "Director erzeugt GDD" — aus einem Prompt entsteht ein
 * sinnvolles GDD (title, genre, summary, coreLoop, features, controls).
 */

const { createGDD } = require('../../engine/gdd.js');
const { OpenAICompatibleProvider } = require('../providers/openaiCompatibleProvider.js');

// System-Prompt, der die GDD-Struktur vorgibt.
const SYSTEM_PROMPT = `Du bist der Game Director einer AI-Spieleplattform.
Erzeuge aus der Spielidee des Nutzers ein Game Design Document (GDD).
Antworte ausschließlich mit gültigem JSON in folgendem Schema:
{
  "title": "Spieltitel",
  "genre": "Genre",
  "summary": "Kurzbeschreibung (1-2 Sätze)",
  "coreLoop": "Kern-Gameplay-Loop (1-2 Sätze)",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "controls": "Steuerungsbeschreibung"
}`;

/**
 * GameDirector — erzeugt ein GDD aus einem Prompt.
 */
class GameDirector {
  /**
   * @param {object} options - { provider?, model? }
   */
  constructor(options = {}) {
    this.provider = options.provider || new OpenAICompatibleProvider({ model: options.model });
  }

  /**
   * Erzeugt ein GDD aus einem Prompt.
   * @param {string} prompt - Spielidee in natürlicher Sprache.
   * @param {object} opts - { experienceId?, model? }
   * @returns {Promise<object>} GDD-Objekt.
   */
  async direct(prompt, opts = {}) {
    if (!prompt || !String(prompt).trim()) {
      throw new Error('GameDirector.direct: "prompt" ist erforderlich');
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: String(prompt) },
    ];

    const structured = await this.provider.generateStructured({
      messages,
      model: opts.model,
    });

    // GDD aus der strukturierten Antwort bauen.
    const gdd = createGDD({
      experienceId: opts.experienceId || '',
      title: structured.title || '',
      genre: structured.genre || '',
      summary: structured.summary || '',
      coreLoop: structured.coreLoop || '',
      features: Array.isArray(structured.features) ? structured.features : [],
      controls: structured.controls || '',
    });

    return gdd;
  }
}

module.exports = { GameDirector, SYSTEM_PROMPT };
