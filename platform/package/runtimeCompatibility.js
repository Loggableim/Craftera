'use strict';

/**
 * Craftera Runtime-Compatibility-Check (AP-9.6).
 *
 * Prüft, ob ein Package mit der installierten Runtime kompatibel ist, anhand
 * von `minimumRuntimeVersion` und `targetRuntimeVersion` im Manifest.
 * Inkompatibel → Fehler.
 */

/**
 * Vergleicht zwei semantische Versionen (major.minor.patch).
 * @param {string} a - Version a.
 * @param {string} b - Version b.
 * @returns {number} -1, 0 oder 1 (a < b, a == b, a > b).
 */
function compareVersions(a, b) {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const va = pa[i] || 0;
    const vb = pb[i] || 0;
    if (va < vb) return -1;
    if (va > vb) return 1;
  }
  return 0;
}

/**
 * Prüft die Runtime-Kompatibilität eines Manifests.
 * @param {object} manifest - Package-Manifest.
 * @param {string} installedRuntimeVersion - Installierte Runtime-Version.
 * @returns {{ ok: boolean, errors: string[] }}
 */
function checkCompatibility(manifest, installedRuntimeVersion) {
  const errors = [];
  const min = manifest.minimumRuntimeVersion;
  const target = manifest.targetRuntimeVersion;

  if (min && compareVersions(installedRuntimeVersion, min) < 0) {
    errors.push(
      `Runtime ${installedRuntimeVersion} ist älter als minimumRuntimeVersion ${min}`
    );
  }

  if (target && compareVersions(installedRuntimeVersion, target) > 0) {
    errors.push(
      `Runtime ${installedRuntimeVersion} ist neuer als targetRuntimeVersion ${target}`
    );
  }

  return { ok: errors.length === 0, errors };
}

module.exports = { compareVersions, checkCompatibility };
