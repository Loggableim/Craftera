'use strict';

/**
 * Craftera API-Client-Helper (AP-1.11).
 *
 * Dünner `fetch`-Wrapper mit `get`, `post`, `put`. Setzt JSON-Header,
 * serialisiert/parst JSON und wirft bei Nicht-2xx einen Fehler mit Status.
 *
 * Beispiel:
 *   const list = await api.get('/api/experiences');
 *   const created = await api.post('/api/experiences', { name: 'X' });
 */

(function () {
  /** Führt einen fetch-Aufruf aus und verarbeitet die JSON-Antwort. */
  async function request(method, url, body) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);

    let data = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      const err = new Error(`API ${method} ${url} fehlgeschlagen (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  const api = {
    get: (url) => request('GET', url),
    post: (url, body) => request('POST', url, body),
    put: (url, body) => request('PUT', url, body),
  };

  window.craftera = window.craftera || {};
  window.craftera.api = api;
})();
