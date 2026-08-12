# Craftera

**AI-native UGC Game Platform** mit integriertem WYSIWYG Studio, BYOK Multi-LLM und eigener Runtime-Abstraktion.

> Ein Client. Viele von Nutzern erschaffene Games. Ein integrierter Editor. Ein gemeinsames Ökosystem.

Craftera ist eine Plattform, auf der Nutzer **eigene Spiele (Experiences)** erstellen, bearbeiten, publizieren und spielen können – unterstützt durch KI-Agenten. Das vollständige Produktziel ist in [`docs/MASTER_PROMPT.md`](docs/MASTER_PROMPT.md) beschrieben.

---

## ✨ Features

### Plattform-Kern
- **Experience-Verwaltung** – Erstellen, Bearbeiten, Publizieren, Installieren, Aktualisieren und Entfernen von Games über eine lokale Registry.
- **WYSIWYG-Studio** – Integrierter Editor mit Viewport, Hierarchy, Inspector, Assets, Console und AI-Panel.
- **Game Project-Modell** – Strukturierte Projekte mit Scenes, Entities, Components, Assets und Versionierung.
- **Packaging** – Verbindliche Package-Struktur mit `game/`, `assets/`, `runtime/`, `metadata/`, `manifest.json` und `integrity.json`.
- **Discover & Library** – Öffentliche Games entdecken, installieren und spielen.

### Play & Runtime (Phase 11)
- **Game Page** – Detailansicht mit Name, Creator, Thumbnail, Beschreibung, Version, Tags und Play-Button.
- **Play-Flow** – Check Local Version → Check Required → Install/Update → Verify → Prepare → Start.
- **Runtime Host** – Lädt Manifest, Projekt und Save für eine Experience.
- **Platform API** – `getCurrentUser`, `saveData`, `loadData` für die Runtime.
- **Save-Isolation** – Saves pro Experience getrennt unter `userdata/<experience-id>/`.
- **Sandbox-Grundlage** – Capability-Modell mit **Default-DENY**.

### AI Game Factory (Phase 12)
- **GDD-Modell** – Game Design Documents als `GDD.json` + `GDD.md`.
- **Task-Graph** – Task-Modell, Status-Übergänge (BACKLOG→…→DONE), Resource Ownership + Locks.
- **Kanban** – Echter Task-Status im Studio (BACKLOG/READY/WORKING/REVIEW/TESTING/DONE).

### Remote Registry (Phase 15)
- **RemoteExperienceRegistry** – Registry-Interface über HTTP (lokal verifiziert, für Cloud vorbereitet).
- **Auth-Service** – Accounts + Sessions mit Passwort-Hashing (SHA-256 + Salt).
- **Creator Identity** – Creator-Profile mit Handle, Bio und Avatar.
- **Package-Upload/-Download** – Packages als JSON-Archive über HTTP.
- **Public/Private & Search** – Sichtbarkeit und Suche remote.
- **Package Storage** – Abstrakte Storage-Schnittstelle (lokales Dateisystem; R2/CDN vorbereitet).

---

## 🚀 Schnellstart

### Voraussetzungen
- **Node.js** (≥ 18, für `fetch` und den eingebauten Test-Runner)

### Server starten
```bash
npm start
# → Server läuft auf http://127.0.0.1:3000
# → Health-Check: http://127.0.0.1:3000/health
```

### Tests ausführen
```bash
npm test
# → 248 Unit- & Integrationstests
```

### Datenverzeichnis
Alle lokalen Laufzeit-Daten liegen unter `.data/` (per `.gitignore` ausgeschlossen). Überschreibbar über die Umgebungsvariable `CRAFTERA_DATA_DIR`.

---

## 📁 Struktur

```
client/    → Client-Shell + Views (Home, Discover, Library, Creator Hub, Game Page, Kanban, Settings)
studio/    → WYSIWYG-Editor (Viewport, Hierarchy, Inspector, Assets, Console, AI)
engine/    → Project Model, Scene, Entities, Components, Behaviors, Events, Commands, GDD, Tasks
runtime/   → Host, Sandbox, Platform API, Orchestrator
platform/  → Experiences, Registry, Publishing, Packages, Auth, Creators, Tasks, Storage
ai/        → Providers, Orchestrator, Agents, Planner, Tools, Memory
server/    → Lokaler HTTP-Server (statische UI + Registry-API)
tests/     → Unit- & Integrationstests
templates/ → Start-Templates
examples/  → Beispiel-Experiences
docs/      → Dokumentation
```

---

## 🗺️ Projektstatus

**MVP der Phasen 1–15 ist abgeschlossen** – alle bearbeitbaren Arbeitspunkte sind erledigt (✅) oder dokumentiert übersprungen (⏭️).

| Phase | Inhalt | Status |
|-------|--------|--------|
| 0 | Reconnaissance & Architektur | ✅ |
| 1 | Foundation (Server, Shell, API) | ✅ |
| 2 | Registry & Experiences | ✅ |
| 3 | Commands | ✅ |
| 4 | Projekt & Editor | ✅ |
| 5 | WYSIWYG | ✅ |
| 6 | Studio | ✅ |
| 7 | Godot-Runtime | ⏭️ (Godot nicht installiert) |
| 8 | AI-Provider | ⏭️ (kein API-Key / Ollama) |
| 9 | Packaging | ✅ |
| 10 | Local Registry | ✅ |
| 11 | Platform Play | ✅ (Runtime-abhängige Teile übersprungen) |
| 12 | AI Game Factory | ✅ (AI-abhängige Teile übersprungen) |
| 13 | Validation / Repair | ⏭️ (Runtime + AI fehlen) |
| 14 | Android | ⏭️ (Android-SDK fehlt) |
| 15 | Remote Registry | ✅ |
| 16 | Post-MVP | bewusst später |

**Details:** [`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md) · [`docs/SKIPPED_POINTS.md`](docs/SKIPPED_POINTS.md) · [`docs/COMPLETION.md`](docs/COMPLETION.md)

---

## 📚 Dokumentation

- [`docs/MASTER_PROMPT.md`](docs/MASTER_PROMPT.md) — das vollständige Zielbild
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Systemarchitektur
- [`docs/PLATFORM_ARCHITECTURE.md`](docs/PLATFORM_ARCHITECTURE.md) — Plattform-Architektur
- [`docs/SECURITY_MODEL.md`](docs/SECURITY_MODEL.md) — Sicherheitsmodell
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — Roadmap & Phasen
- [`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md) — alle Phasen in konkrete Arbeitspunkte aufgelöst
- [`docs/CONSISTENT_GOAL.md`](docs/CONSISTENT_GOAL.md) — Zielbild für wiederkehrende autonome Runs (ein AP pro Run)
- [`docs/SKIPPED_POINTS.md`](docs/SKIPPED_POINTS.md) — nicht bearbeitbare Arbeitspunkte
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — Architektur-Entscheidungen
- [`docs/PACKAGE_STORAGE.md`](docs/PACKAGE_STORAGE.md) — abstrakte Package-Storage-Schnittstelle

---

## 🔧 Bekannte Einschränkungen

Die folgenden externen Abhängigkeiten sind **nicht installiert**, daher sind die betroffenen Phasen dokumentiert übersprungen (Details in [`docs/SKIPPED_POINTS.md`](docs/SKIPPED_POINTS.md)):

| Abhängigkeit | Betroffene Phasen | Nötig für |
|--------------|-------------------|-----------|
| **Godot 4.x** | 7, 10, 11, 13, 14 | Runtime, Play-Viewport, Android-Export |
| **AI-API-Key / Ollama** | 8, 12, 13 | AI-Provider, Game Director, Worker-Agents, Repair |
| **Android-SDK** | 14 | Mobile-Export (APK/AAB) |

Die **Remote Registry** ist als lokaler HTTP-Server + Client voll funktionsfähig verifiziert. Für eine echte Cloud-Deployment (Cloudflare Workers/R2) ist ein gültiger Cloudflare-API-Token nötig.

---

## 🤝 Mitwirken

Dieses Projekt wird über **wiederkehrende autonome Runs** entwickelt: Jeder Run bearbeitet genau **einen Arbeitspunkt (AP-x.y)** aus dem Entwicklungsplan, verifiziert ihn real und committet ihn als nachvollziehbaren Punkt auf GitHub. Siehe [`docs/CONSISTENT_GOAL.md`](docs/CONSISTENT_GOAL.md).

---

## 📄 Lizenz

Noch nicht festgelegt.
