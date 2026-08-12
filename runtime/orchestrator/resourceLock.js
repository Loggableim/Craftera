'use strict';

/**
 * Craftera Resource Ownership + Locks (AP-12.8).
 *
 * Verhindert parallele Konflikte: Zwei Tasks dürfen nicht gleichzeitig
 * dieselbe Ressource (ownedResources, Master Prompt §47) besitzen.
 *
 * `acquire` ist atomar — wenn eine Ressource bereits von einem anderen Owner
 * gehalten wird, wird der gesamte Acquire abgelehnt (keine Teil-Locks).
 */

class ResourceLockManager {
  constructor() {
    /** @type {Map<string, string>} resource → owner */
    this._locks = new Map();
  }

  /**
   * Versucht, die angegebenen Ressourcen für einen Owner zu sperren.
   * @param {string} owner - Owner-ID (z.B. Task-ID).
   * @param {string[]} resources - Liste der Ressourcen.
   * @returns {boolean} true, wenn alle Ressourcen gesperrt wurden.
   */
  acquire(owner, resources) {
    if (!owner) throw new Error('acquire: owner ist erforderlich');
    const list = Array.isArray(resources) ? resources : [];

    // Prüfe zuerst, ob alle Ressourcen frei sind (atomar).
    for (const resource of list) {
      const current = this._locks.get(resource);
      if (current !== undefined && current !== owner) {
        return false; // Konflikt: Ressource von anderem Owner gehalten.
      }
    }
    // Alle frei → sperren.
    for (const resource of list) {
      this._locks.set(resource, owner);
    }
    return true;
  }

  /**
   * Gibt die Ressourcen eines Owners frei.
   * @param {string} owner - Owner-ID.
   * @param {string[]} resources - Liste der Ressourcen.
   */
  release(owner, resources) {
    const list = Array.isArray(resources) ? resources : [];
    for (const resource of list) {
      if (this._locks.get(resource) === owner) {
        this._locks.delete(resource);
      }
    }
  }

  /**
   * Liefert den aktuellen Owner einer Ressource.
   * @param {string} resource - Ressource.
   * @returns {string|null} Owner oder null.
   */
  ownerOf(resource) {
    return this._locks.get(resource) ?? null;
  }

  /** Anzahl der aktuell gesperrten Ressourcen. */
  get lockCount() {
    return this._locks.size;
  }
}

module.exports = { ResourceLockManager };
