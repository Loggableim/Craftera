'use strict';

/**
 * Craftera RuntimeAdapter-Interface (AP-7.2).
 *
 * Abstrakte Schnittstelle zwischen GameProject und der konkreten Runtime
 * (z.B. Godot). Die Runtime-Abstraktion wird vorbereitet, der konkrete
 * Godot-Adapter folgt später (AP-7.3+, sobald Godot installiert ist).
 *
 * Jede Methode ist abstrakt und wirft "not implemented", bis ein konkreter
 * Adapter sie implementiert.
 */

/**
 * @class RuntimeAdapter
 * @description Abstraktes Interface. Nicht direkt instanziieren.
 */
class RuntimeAdapter {
  constructor() {
    if (new.target === RuntimeAdapter) {
      throw new Error('RuntimeAdapter ist abstrakt und kann nicht direkt instanziiert werden');
    }
  }

  /**
   * Übersetzt ein GameProject in ein lauffähiges Runtime-Projekt.
   * @param {object} project - GameProject-Objekt.
   * @returns {Promise<string>} Pfad zum erzeugten Projekt.
   */
  async build(project) {
    throw new Error('RuntimeAdapter.build ist nicht implementiert');
  }

  /**
   * Startet eine Scene.
   * @param {string} sceneId - ID der zu startenden Scene.
   * @returns {Promise<void>}
   */
  async play(sceneId) {
    throw new Error('RuntimeAdapter.play ist nicht implementiert');
  }

  /**
   * Pausiert die laufende Scene.
   * @returns {Promise<void>}
   */
  async pause() {
    throw new Error('RuntimeAdapter.pause ist nicht implementiert');
  }

  /**
   * Stoppt die laufende Scene.
   * @returns {Promise<void>}
   */
  async stop() {
    throw new Error('RuntimeAdapter.stop ist nicht implementiert');
  }
}

module.exports = { RuntimeAdapter };
