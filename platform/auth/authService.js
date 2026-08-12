'use strict';

/**
 * Craftera Auth-Service (AP-15.2).
 *
 * Accounts + Sessions. Passwörter werden gehasht (SHA-256 + Salt) gespeichert,
 * nie im Klartext. Sessions sind zufällige Tokens mit Ablaufzeit.
 *
 * Persistenz unter `<dataDir>/auth/accounts.json` und `<dataDir>/auth/sessions.json`.
 */

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

class AuthService {
  /**
   * @param {string} dataDir - Wurzelverzeichnis für persistierte Daten.
   */
  constructor(dataDir) {
    this.authDir = path.join(dataDir, 'auth');
    this.accountsPath = path.join(this.authDir, 'accounts.json');
    this.sessionsPath = path.join(this.authDir, 'sessions.json');
  }

  /** Lädt eine JSON-Datei (leer, wenn nicht vorhanden). */
  async _load(filePath) {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') return {};
      throw err;
    }
  }

  /** Speichert eine JSON-Datei. */
  async _save(filePath, data) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tmpPath = `${filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(tmpPath, filePath);
  }

  /** Hasht ein Passwort mit Salt. */
  _hash(password, salt) {
    return crypto.createHash('sha256').update(salt + password).digest('hex');
  }

  /** Erzeugt ein zufälliges Session-Token. */
  _newToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Registriert einen Account.
   * @param {object} input - { username, password }.
   * @returns {Promise<object>} { id, username }.
   */
  async register({ username, password }) {
    if (!username || !password) {
      throw new Error('register: username und password sind erforderlich');
    }
    const accounts = await this._load(this.accountsPath);
    if (accounts[username]) {
      throw new Error(`register: Benutzername "${username}" ist bereits vergeben`);
    }
    const salt = crypto.randomBytes(16).toString('hex');
    accounts[username] = {
      id: crypto.randomBytes(8).toString('hex'),
      username,
      salt,
      passwordHash: this._hash(password, salt),
      createdAt: new Date().toISOString(),
    };
    await this._save(this.accountsPath, accounts);
    return { id: accounts[username].id, username };
  }

  /**
   * Loggt einen Benutzer ein und erstellt eine Session.
   * @param {object} input - { username, password }.
   * @returns {Promise<object>} { token, user }.
   */
  async login({ username, password }) {
    const accounts = await this._load(this.accountsPath);
    const account = accounts[username];
    if (!account) {
      throw new Error('login: Ungültiger Benutzername oder Passwort');
    }
    const hash = this._hash(password, account.salt);
    if (hash !== account.passwordHash) {
      throw new Error('login: Ungültiger Benutzername oder Passwort');
    }
    const token = this._newToken();
    const sessions = await this._load(this.sessionsPath);
    sessions[token] = {
      userId: account.id,
      username,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(), // 7 Tage
    };
    await this._save(this.sessionsPath, sessions);
    return { token, user: { id: account.id, username } };
  }

  /**
   * Validiert ein Session-Token.
   * @param {string} token - Session-Token.
   * @returns {Promise<object|null>} { userId, username } oder null.
   */
  async validate(token) {
    if (!token) return null;
    const sessions = await this._load(this.sessionsPath);
    const session = sessions[token];
    if (!session) return null;
    if (new Date(session.expiresAt) < new Date()) return null; // abgelaufen
    return { userId: session.userId, username: session.username };
  }

  /**
   * Loggt einen Benutzer aus (Session löschen).
   * @param {string} token - Session-Token.
   */
  async logout(token) {
    const sessions = await this._load(this.sessionsPath);
    delete sessions[token];
    await this._save(this.sessionsPath, sessions);
  }
}

module.exports = { AuthService };
