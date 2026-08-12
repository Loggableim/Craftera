'use strict';

/**
 * Craftera RemoteExperienceRegistry (AP-15.1).
 *
 * Implementiert das Registry-Interface (publish, list, search, install,
 * update, remove, setVisibility, listPublic) über HTTP gegen einen
 * Remote-Registry-Server. Damit kann die Registry remote statt lokal
 * betrieben werden — der Rest der Plattform spricht dasselbe Interface.
 */

class RemoteExperienceRegistry {
  /**
   * @param {string} baseUrl - Basis-URL des Remote-Registry-Servers (z.B. http://host:port).
   */
  constructor(baseUrl) {
    this.baseUrl = String(baseUrl).replace(/\/$/, '');
  }

  /** Führt einen HTTP-Request aus und verarbeitet die JSON-Antwort. */
  async _request(method, path, body) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body !== undefined) options.body = JSON.stringify(body);

    const res = await fetch(this.baseUrl + path, options);
    const text = await res.text();
    let data = null;
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }
    if (!res.ok) {
      const err = new Error(data && data.error ? data.error : `Remote-Registry ${method} ${path} fehlgeschlagen (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  /** Publiziert eine Experience. */
  async publish(experienceId) {
    return this._request('POST', `/api/experiences/${encodeURIComponent(experienceId)}/publish`);
  }

  /** Liefert alle Experiences (nur public). */
  async list() {
    return this._request('GET', '/api/experiences');
  }

  /** Sucht nach Name/Tag. */
  async search(query) {
    return this._request('GET', `/api/experiences?search=${encodeURIComponent(query)}`);
  }

  /** Setzt die Sichtbarkeit. */
  async setVisibility(experienceId, visibility) {
    return this._request('PUT', `/api/experiences/${encodeURIComponent(experienceId)}/visibility`, { visibility });
  }

  /** Liefert nur öffentlich sichtbare Experiences. */
  async listPublic() {
    return this._request('GET', '/api/experiences');
  }

  /** Installiert eine Experience. */
  async install(experienceId) {
    return this._request('POST', `/api/experiences/${encodeURIComponent(experienceId)}/install`);
  }

  /** Installiert neue Version. */
  async update(experienceId) {
    return this.publish(experienceId).then(() => this.install(experienceId));
  }

  /** Entfernt eine Experience. */
  async remove(experienceId) {
    return this._request('DELETE', `/api/experiences/${encodeURIComponent(experienceId)}`);
  }

  /** Startet eine Experience (Runtime-abhängig, AP-10.8 übersprungen). */
  async launch(experienceId) {
    throw new Error('RemoteExperienceRegistry.launch: Runtime nicht verfügbar (Godot nicht installiert)');
  }
}

module.exports = { RemoteExperienceRegistry };
