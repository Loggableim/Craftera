'use strict';

/**
 * Craftera Settings-View (AP-1.9).
 *
 * BYOK-Provider-Konfiguration — UI-Gerüst: zeigt eine Liste der
 * unterstützten AI-Provider. Die echte Credential-Speicherung
 * (OS Credential Manager, verschlüsselte Settings) folgt in AP-8.7.
 */

(function () {
  // Unterstützte Provider (BYOK). Wird später um Credential-Felder erweitert.
  const PROVIDERS = [
    { id: 'openai', name: 'OpenAI' },
    { id: 'anthropic', name: 'Anthropic' },
    { id: 'openrouter', name: 'OpenRouter' },
    { id: 'ollama', name: 'Ollama (lokal)' },
    { id: 'openai-compatible', name: 'OpenAI-kompatibel' },
  ];

  /** Rendert die Settings-View in den Container. */
  function renderSettings() {
    const list = document.getElementById('settings-providers');
    if (!list) return;

    list.innerHTML = '';
    PROVIDERS.forEach((provider) => {
      const row = document.createElement('div');
      row.className = 'provider-row';
      row.innerHTML = `<span class="provider-name"></span><span class="provider-status">Nicht konfiguriert</span>`;
      row.querySelector('.provider-name').textContent = provider.name;
      list.appendChild(row);
    });
  }

  window.craftera = window.craftera || {};
  window.craftera.renderSettings = renderSettings;
})();
