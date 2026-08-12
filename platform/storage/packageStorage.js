'use strict';

/**
 * Craftera Package Storage-Interface (AP-15.9).
 *
 * Abstrakte Schnittstelle für die Speicherung von Package-Archiven.
 * Der Remote-Registry-Server speichert Packages aktuell im lokalen
 * Dateisystem (LocalPackageStorage). Für den Produktivbetrieb kann eine
 * objektbasierte Implementierung (z.B. Cloudflare R2 / S3 / CDN) eingesetzt
 * werden, ohne den Server-Code zu ändern.
 *
 * Interface:
 *   put(packageId, archive)  — speichert ein Package-Archiv
 *   get(packageId)           — lädt ein Package-Archiv
 *   exists(packageId)        — prüft, ob ein Package existiert
 */

class PackageStorage {
  /** @abstract */
  async put(packageId, archive) {
    throw new Error('PackageStorage.put ist nicht implementiert');
  }

  /** @abstract */
  async get(packageId) {
    throw new Error('PackageStorage.get ist nicht implementiert');
  }

  /** @abstract */
  async exists(packageId) {
    throw new Error('PackageStorage.exists ist nicht implementiert');
  }
}

module.exports = { PackageStorage };
