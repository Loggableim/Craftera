'use strict';

/**
 * Craftera Sandbox-Grundlage (AP-11.6).
 *
 * Capability-Modell mit Default-DENY: Eine Experience darf nur Capabilities
 * nutzen, die im Manifest explizit erlaubt sind. Nicht erlaubte Capabilities
 * werden blockiert.
 *
 * Beispiel-Manifest:
 *   { "permissions": ["save", "load"] }
 */

// Bekannte Capabilities.
const KNOWN_CAPABILITIES = ['save', 'load', 'network', 'filesystem', 'audio'];

/**
 * Prüft, ob eine Capability für ein Manifest erlaubt ist (Default DENY).
 * @param {object} manifest - Package-Manifest mit `permissions`.
 * @param {string} capability - Zu prüfende Capability.
 * @returns {{ ok: boolean, reason?: string }}
 */
function checkCapability(manifest, capability) {
  const permissions = Array.isArray(manifest.permissions) ? manifest.permissions : [];

  if (!KNOWN_CAPABILITIES.includes(capability)) {
    return { ok: false, reason: `Unbekannte Capability "${capability}"` };
  }

  if (!permissions.includes(capability)) {
    return { ok: false, reason: `Capability "${capability}" ist nicht erlaubt (Default DENY)` };
  }

  return { ok: true };
}

module.exports = { checkCapability, KNOWN_CAPABILITIES };
