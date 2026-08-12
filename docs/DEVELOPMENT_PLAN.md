# Entwicklungsplan — Craftera

> Status: **Phase 0 – Reconnaissance** (Plan, noch keine Implementierung)
> Quelle: `docs/MASTER_PROMPT.md` §80–§89, `docs/ROADMAP.md`
> Zweck: Jede Entwicklungsphase in konkrete, nummerierte Arbeitspunkte aufgelöst.

## Arbeitsweise (Master Prompt §88, §89)

- **ORCHESTRATOR** führt das Projekt, **Worker** übernehmen einzelne Arbeitspunkte.
- Tasks laufen über einen **Dependency Graph**; unabhängige Tasks parallelisieren.
- **Keine unkoordinierten Dateiänderungen** — jeder Task definiert `ownedResources`.
- Nach jedem größeren Task:
  ```
  IMPLEMENT → STATIC CHECK → UNIT TEST → INTEGRATION TEST → RUN APPLICATION → VERIFY REAL BEHAVIOR → REVIEW → COMMIT
  ```
- **Keine Fake-Implementierungen** (Master Prompt §79): kein Publish-Button ohne Pipeline, kein Install-Button ohne Installation, keine Fake-Analytics.

## Legende

- **AP-x.y** = Arbeitspunkt, Phase x, Nummer y.
- **DoD** = Definition of Done (wann der Arbeitspunkt abgeschlossen ist).
- **Verifikation** = konkreter Nachweis, dass es real funktioniert.
- **Abhängigkeit** = welche Arbeitspunkte zuerst fertig sein müssen.

---

# Phase 0 — Reconnaissance

> Ziel: Environment analysieren, Risiken erfassen, Grundlagen dokumentieren. **Bereits erledigt.**

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-0.1 | Environment analysieren (OS, Node, Python, .NET, Go, Flutter, Git, Godot, Ollama) | Tool-Versionen erfasst | `node --version`, `git --version` etc. liefern Werte |
| AP-0.2 | Godot-Installation prüfen; falls fehlend, Installationsweg dokumentieren | Status im `docs/DECISIONS.md` (D-003) | `godot --version` |
| AP-0.3 | Build-Tools & SDKs prüfen (für spätere Android-Exporte) | Liste verfügbarer SDKs | Tool-Checks dokumentiert |
| AP-0.4 | Technologie-Entscheidungen treffen (UI, Backend, Runtime) | `docs/DECISIONS.md` D-001…D-005 | Entscheidungen mit Begründung |
| AP-0.5 | Architektur-Dokumente erstellen | `ARCHITECTURE.md`, `PLATFORM_ARCHITECTURE.md`, `SECURITY_MODEL.md`, `ROADMAP.md`, `DECISIONS.md` | Dateien existieren, konsistent |
| AP-0.6 | Repository-Struktur gemäß §74 anlegen | Alle Layer-Ordner vorhanden | `find . -type d` |
| AP-0.7 | Entwicklungsplan (dieses Dokument) erstellen | Alle Phasen in Arbeitspunkte aufgelöst | Dokument reviewt |

**Abhängigkeiten:** keine. **Status: ✅ abgeschlossen.**

---

# Phase 1 — Client Shell

> Ziel: Reale Navigation (Home, Discover, Library, Create, Settings). Noch kein Cloud-Backend.
> Master Prompt §6, §19, §74 (`client/`).

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-1.1 | Node.js-Projekt initialisieren (`package.json`, `npm start`) | `npm start` startet Server | Server läuft, Log erscheint | ✅ |
| AP-1.2 | HTTP-Server bauen, der statische Dateien aus `client/` ausliefert | `GET /` liefert `index.html` | Browser zeigt Client | ✅ |
| AP-1.3 | HTML-Shell mit Topbar-Navigation (Home, Discover, Library, Create, Settings) | 5 Nav-Buttons vorhanden | Klick wechselt View | ✅ |
| AP-1.4 | SPA-Router implementieren (View-Wechsel ohne Reload) | `navigate(view)` rendert View | URL/View wechselt real | ✅ |
| AP-1.5 | Home-View: Featured + Recently Played (echte Daten, leerer Zustand ok) | Home rendert | View sichtbar | ✅ |
| AP-1.6 | Discover-View: Liste + Suche | Liste + Suchfeld | Suche filtert | ✅ |
| AP-1.7 | Library-View: installierte Experiences | View rendert | View sichtbar | ✅ |
| AP-1.8 | Create-View: Creator Hub + "New Experience"-Formular | Formular vorhanden | Formular rendert | ✅ |
| AP-1.9 | Settings-View: BYOK-Provider-Konfiguration (UI-Gerüst) | Provider-Liste sichtbar | View rendert | ✅ |
| AP-1.10 | CSS-Grundsystem (Layout, Cards, Buttons, Status) | Einheitliches Styling | Visuell konsistent | ✅ |
| AP-1.11 | API-Client-Helper (`fetch`-Wrapper) | `api.get/post/put` funktionieren | Aufruf gegen Test-Endpoint | ✅ |

**DoD Phase 1:** Client startet stabil, Navigation funktioniert real, alle 5 Views erreichbar.
**Abhängigkeiten:** AP-1.1 → AP-1.2 → AP-1.3/1.4 → Views.

---

# Phase 2 — Experience Domain

> Ziel: Experience, ExperienceId, Metadata, Version, Repository — lokal erstellen/speichern/laden.
> Master Prompt §13, §14, §15, §29, §62, §73.

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-2.1 | ID-Generator (`createId(type)`) mit stabilen, typ-präfixierten IDs | IDs wie `exp_…`, `ver_…` | Unit-Test: Kollisionsfreiheit | ✅ |
| AP-2.2 | Experience-Modell (`createExperience`) | Objekt mit `experienceId`, `name`, `slug`, `status`, `tags` | Unit-Test | ✅ |
| AP-2.3 | ExperienceVersion-Modell (`createVersion`) | Version mit `versionNumber`, `status`, `packageHash` | Unit-Test | ✅ |
| AP-2.4 | ExperienceRepository (JSON-Persistenz) | create/get/list/save funktionieren | Integrationstest: speichern+laden | ✅ |
| AP-2.5 | Version-Repository (create/get/list) | Versionen pro Experience | Integrationstest | ✅ |
| AP-2.6 | Datenverzeichnis-Konvention (`dataDir`, gitignored) | `.data/` nicht in Git | `git status` sauber | ✅ |
| AP-2.7 | REST-Endpoints: `GET/POST /api/experiences` | API erstellt + listet Experiences | `curl`-Test | ✅ |
| AP-2.8 | Create-View an API anbinden | Formular erstellt echte Experience | Experience erscheint in Liste | ✅ |

**DoD Phase 2:** Lokale Experiences können erstellt, gespeichert und wieder geladen werden.
**Abhängigkeiten:** Phase 1 (Server + Create-View), AP-2.1 → 2.2/2.3 → 2.4/2.5 → 2.7/2.8.

---

# Phase 3 — Studio Shell

> Ziel: Viewport, Hierarchy, Inspector, Assets, Console, Play Toolbar, AI Panel.
> Master Prompt §30, §33, §34, §74 (`studio/`).

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-3.1 | Studio-Layout (3-Spalten: Hierarchy / Viewport / Inspector + Bottom-Panels) | Layout rendert | Studio öffnet | ✅ |
| AP-3.2 | Studio-Route: Experience aus Creator Hub im Studio öffnen | `navigate('studio', {id})` | Klick "Edit" öffnet Studio | ✅ |
| AP-3.3 | Hierarchy-Panel (Entities der aktuellen Scene) | Entities gelistet | Liste zeigt Entities | ✅ |
| AP-3.4 | Inspector-Panel (Transform + Components) | Properties anzeigen | Werte sichtbar | ✅ |
| AP-3.5 | Viewport-Panel (Canvas, leerer Zustand) | Canvas vorhanden | Canvas rendert | ✅ |
| AP-3.6 | Assets-Panel (Asset-Liste) | Assets gelistet | Liste zeigt Assets | ✅ |
| AP-3.7 | Console-Panel (Log-Ausgabe) | Logs erscheinen | Test-Log sichtbar | ✅ |
| AP-3.8 | Play-Toolbar (Play/Stop/Pause) | Buttons vorhanden | Buttons klickbar | ✅ |
| AP-3.9 | AI-Panel (Chat-Gerüst, noch ohne Funktion) | Panel vorhanden | Panel rendert | ✅ |
| AP-3.10 | Projekt-Laden im Studio (via API) | Studio zeigt geladenes Projekt | Projekt-Daten sichtbar | ✅ |

**DoD Phase 3:** Experience kann aus Creator Hub im Studio geöffnet werden.
**Abhängigkeiten:** Phase 1, Phase 2 (Experience + Projekt laden).

---

# Phase 4 — GameProject

> Ziel: Strukturiertes Game Project Model — Source of Truth des Editors.
> Master Prompt §28, §29, §73.

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-4.1 | GameProject-Modell (`createProject`) | Projekt mit `formatVersion`, `scenes`, `entities`, `components`, `assets` | Unit-Test | ✅ |
| AP-4.2 | Scene-Modell (`createScene`) | Scene mit `sceneId`, `name`, `rootEntityId` | Unit-Test | ✅ |
| AP-4.3 | Entity-Modell (`createEntity`) | Entity mit `entityId`, `sceneId`, `parentId`, `transform`, `components` | Unit-Test | ✅ |
| AP-4.4 | Component-Modell (`addComponent`) | Component mit `componentId`, `type`, Props | Unit-Test | ✅ |
| AP-4.5 | Transform-Modell (`setTransform`) | x/y/scale/rotation setzbar | Unit-Test | ✅ |
| AP-4.6 | Serialisierung (`saveProject`/`loadProject`) | `game.project.json` exakt reproduzierbar | Roundtrip-Test: save→load→identisch | ✅ |
| AP-4.7 | Format-Versionierung + Migrationspfad | `formatVersion` geprüft | Test: falsche Version wirft Fehler | ✅ |
| AP-4.8 | REST-Endpoints: `GET/PUT /api/experiences/:id/project` | Projekt laden/speichern | `curl`-Test | ✅ |
| AP-4.9 | Studio an Projekt-Serialisierung anbinden | Studio speichert/lädt Projekt | Save→Reopen→identisch | ✅ |

**DoD Phase 4:** Save/Load exakt reproduzierbar.
**Abhängigkeiten:** Phase 2, Phase 3.

---

# Phase 5 — Command System

> Ziel: Alle Editor-Mutationen über Commands; Undo/Redo.
> Master Prompt §38, §39, §74 (`engine/commands/`).

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-5.1 | Command-Dispatch (`executeCommand`) | Commands ausführbar | Unit-Test | ✅ |
| AP-5.2 | Command: `CreateEntity` | Entity erzeugt, invertierbar | Unit-Test | ✅ |
| AP-5.3 | Command: `DeleteEntity` | Entity entfernt, invertierbar | Unit-Test | ✅ |
| AP-5.4 | Command: `MoveEntity` / `ScaleEntity` | Transform geändert, invertierbar | Unit-Test | ✅ |
| AP-5.5 | Command: `AddComponent` / `RemoveComponent` | Component hinzugefügt/entfernt | Unit-Test | ✅ |
| AP-5.6 | Command: `SetProperty` | Property gesetzt, invertierbar | Unit-Test | ✅ |
| AP-5.7 | Command: `CreateScene` / `DeleteScene` | Scenes erzeugt/entfernt | Unit-Test | ✅ |
| AP-5.8 | CommandHistory (Undo/Redo-Stacks) | undo/redo funktionieren | Unit-Test: 3 Commands → undo×3 → redo×3 | ✅ |
| AP-5.9 | Undo/Redo-UI im Studio (Toolbar-Buttons) | Buttons aktiv/inaktiv korrekt | Klick undo/redo ändert Projekt | ✅ |
| AP-5.10 | Command-API für AI vorbereiten (strukturierte JSON-Commands) | Commands als JSON serialisierbar | Test: JSON→execute | ✅ |

**DoD Phase 5:** Undo/Redo funktioniert.
**Abhängigkeiten:** Phase 4 (GameProject).

---

# Phase 6 — WYSIWYG

> Ziel: Echter visueller Editor — kleine Szene vollständig visuell baubar.
> Master Prompt §32, §33, §34, §35, §36, §37.

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-6.1 | Canvas-Renderer (Entities als Sprites zeichnen) | Entities im Viewport sichtbar | Viewport zeigt Objekte | ✅ |
| AP-6.2 | Objektselektion (Klick auf Entity) | Entity selektierbar, Inspector zeigt sie | Klick → Inspector | ✅ |
| AP-6.3 | Drag & Drop / Move (Entity verschieben) | Entity per Maus bewegen | Move ändert Transform |
| AP-6.4 | Scale (Größe ändern) | Entity skalierbar | Scale ändert Transform |
| AP-6.5 | Rotate | Entity rotierbar | Rotation sichtbar |
| AP-6.6 | Grid + Snapping | Raster + Einrasten | Objekt rastet ein |
| AP-6.7 | Zoom + Pan | Viewport zoombar/verschiebbar | Zoom/Pan funktioniert |
| AP-6.8 | Multi-Select + Box-Select | Mehrere Entities wählbar | Box-Selektion |
| AP-6.9 | Copy/Paste + Duplicate | Entities duplizierbar | Duplikat erscheint |
| AP-6.10 | Delete | Entity löschbar | Entity verschwindet |
| AP-6.11 | Parenting + Layering | Entities hierarchisch | Reparent funktioniert |
| AP-6.12 | Hierarchy-Interaktion (Rename, Lock, Visibility) | Hierarchy steuert Entities | Rename/Lock wirkt |
| AP-6.13 | Inspector-Edit (Transform + Component-Props) | Werte im Inspector editierbar | Änderung wirkt im Viewport |
| AP-6.14 | Component-Add/Remove im Inspector | Components hinzufügbar | Component erscheint |
| AP-6.15 | Asset-Import (PNG als Sprite) | PNG importierbar, platzierbar | Sprite im Viewport |
| AP-6.16 | Event-System (WHEN→THEN, Master Prompt §37) | Events konfigurierbar | Event auslösbar |
| AP-6.17 | Behaviors (Follow, Patrol, Collect, etc., §36) | Behaviors hinzufügbar | Behavior wirkt |

**DoD Phase 6:** Kleine Szene vollständig visuell baubar (Sprite platzieren, bewegen, skalieren, speichern).
**Abhängigkeiten:** Phase 4, Phase 5 (alle Mutationen über Commands).

---

# Phase 7 — Runtime Adapter

> Ziel: GameProject → Godot Runtime → Play. Studio-Szene läuft real.
> Master Prompt §58, §59, §60, §74 (`runtime/`).

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-7.1 | Godot installieren + im PATH verfügbar machen | `godot --version` liefert Version | Terminal-Check |
| AP-7.2 | RuntimeAdapter-Interface definieren | Interface abstrakt | Code-Review |
| AP-7.3 | GodotAdapter: GameProject → Godot-Projekt | Projekt wird nach Godot übersetzt | Godot öffnet Projekt |
| AP-7.4 | SceneCompiler: Scene → PackedScene | Scene kompiliert | Godot lädt Scene |
| AP-7.5 | ResourceCompiler: Assets → Godot-Resources | Assets importiert | Godot zeigt Assets |
| AP-7.6 | ScriptBridge: Components → GDScript | Components als GDScript | Script läuft |
| AP-7.7 | InputBridge: InputActions → InputMap | Input gemappt | Tastatur steuert |
| AP-7.8 | ProjectBuilder: GameProject → lauffähiges Godot-Projekt | Build erzeugt Projekt | Godot startet |
| AP-7.9 | Play-Modus im Studio (Play Current Scene) | Studio startet Runtime | Szene läuft real |
| AP-7.10 | Play-Modi: Pause, Stop, Restart | Modi funktionieren | Buttons wirken |
| AP-7.11 | Test as Published (simuliert Package) | Modus startet Package | Package läuft |

**DoD Phase 7:** Studio-Szene läuft real in Godot.
**Abhängigkeiten:** Phase 6 (WYSIWYG), Godot-Installation (AP-7.1).

---

# Phase 8 — BYOK AI

> Ziel: Provider-Abstraktion, Credential Store, Model Profiles, AI Command Tools.
> Master Prompt §9, §10, §11, §12, §40, §41, §77.

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-8.1 | AIProvider-Interface (`generate`, `stream`, `generate_structured`, `tool_call`, `vision`, `embeddings`, `capabilities`) | Interface definiert | Code-Review |
| AP-8.2 | OpenAI-Provider | generate/stream funktionieren | Live-Test mit Key |
| AP-8.3 | Anthropic-Provider | generate funktioniert | Live-Test |
| AP-8.4 | OpenRouter-Provider | generate funktioniert | Live-Test |
| AP-8.5 | Ollama-Provider (lokal) | generate funktioniert | Live-Test |
| AP-8.6 | OpenAI-kompatible-API-Provider | generate funktioniert | Live-Test |
| AP-8.7 | Credential Store (OS Credential Manager + verschlüsselte Settings) | Keys lokal, nie in Git/Projects | Test: Key nicht in Projekt |
| AP-8.8 | Model Profiles (Aufgaben→Modell-Zuordnung) | Profile konfigurierbar | Settings speichert Profile |
| AP-8.9 | AI Command Tools (AI ruft Command API auf) | AI führt Commands aus | AI ändert Projekt |
| AP-8.10 | AI Context (Assistent kennt Scene, Selection, Entities, Components) | Kontext an AI übergeben | AI antwortet kontextbezogen |
| AP-8.11 | AI Modification Preview (Preview/Apply/Reject) | Vorschlag vor Anwendung | Preview zeigt Diff |
| AP-8.12 | AI-Panel im Studio anbinden | Chat verändert Projekt | "Verschiebe 200px" wirkt |

**DoD Phase 8:** AI verändert sichtbares Projekt über Commands.
**Abhängigkeiten:** Phase 5 (Command API), Phase 6 (Kontext).

---

# Phase 9 — Experience Packaging

> Ziel: Package Builder, Manifest, Validation, Hashing, Runtime Metadata.
> Master Prompt §16, §17, §18, §69.

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-9.1 | Package-Struktur definieren (`manifest.json`, `game/`, `assets/`, `runtime/`, `metadata/`, `integrity.json`) | Struktur festgelegt | Doku |
| AP-9.2 | Package Builder (`buildPackage`) | Package erzeugbar | Package existiert |
| AP-9.3 | Manifest-Generator | Manifest mit `formatVersion`, `experienceId`, `versionId`, `runtimeVersion`, `entryScene`, `permissions`, `contentHash` | Manifest korrekt |
| AP-9.4 | Content-Hashing (SHA-256) | Hash reproduzierbar | Gleicher Input → gleicher Hash |
| AP-9.5 | Validation (Package vollständig, Assets vorhanden) | Validierung prüft | Test: fehlende Datei → Fehler |
| AP-9.6 | Runtime-Compatibility-Check (`minimumRuntimeVersion`, `targetRuntimeVersion`) | Kompatibilität geprüft | Test: inkompatibel → Fehler |
| AP-9.7 | Package-Format-Versionierung | `packageFormatVersion` getrennt | Doku |
| AP-9.8 | Ausschluss von Nicht-Laufzeitdaten (AI-Memory, Logs, Keys, Git-History) | Package enthält nur Laufzeitdaten | Test: Keys nicht im Package |

**DoD Phase 9:** Experience Package reproduzierbar erzeugbar.
**Abhängigkeiten:** Phase 4 (GameProject), Phase 7 (Runtime-Metadaten).

---

# Phase 10 — Local Registry

> Ziel: publish, list, search, install, update, launch.
> Master Prompt §61, §62, §66.

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-10.1 | LocalExperienceRegistry-Klasse | Interface vorhanden | Code-Review |
| AP-10.2 | `publish(experienceId)` | Baut Package, registriert Version, markiert published | Publish → Status published |
| AP-10.3 | `list()` | Alle Experiences | Liste korrekt |
| AP-10.4 | `search(query)` | Suche nach Name/Tag | Suche filtert |
| AP-10.5 | `install(experienceId)` | Kopiert Package in installierten Bereich | Installiert-Verzeichnis gefüllt |
| AP-10.6 | `update(experienceId)` | Neue Version installiert | Update wirkt |
| AP-10.7 | `remove(experienceId)` | Experience entfernt | Entfernt |
| AP-10.8 | `launch(experienceId)` | Startet installierte Experience | Runtime startet |
| AP-10.9 | REST-Endpoints: publish/install/play | API funktioniert | `curl`-Test |
| AP-10.10 | Visibility (PRIVATE/UNLISTED/PUBLIC) | Sichtbarkeit steuerbar | Test: private nicht in Discover |
| AP-10.11 | Creator Hub: Publish-Button anbinden | Button publiziert real | Game erscheint im Client |

**DoD Phase 10:** Publiziertes Game erscheint im Client.
**Abhängigkeiten:** Phase 2 (Experience), Phase 9 (Packaging).

---

# Phase 11 — Platform Play

> Ziel: Game Page → Play → Runtime Host. Veröffentlichte Experience startet unabhängig vom Studio.
> Master Prompt §21, §23, §24, §25, §26, §55, §56.

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-11.1 | Game Page-View (Name, Creator, Thumbnail, Beschreibung, Version, Tags, Play) | Game Page rendert | View sichtbar |
| AP-11.2 | Play-Flow: Check Local Version → Check Required → Install/Update → Verify → Prepare → Start | Ablauf real | Play startet Game |
| AP-11.3 | Runtime Host (`prepare(experienceId)`) | Host lädt Manifest + Projekt + Save | Host liefert Daten |
| AP-11.4 | Platform API (`getCurrentUser`, `saveData`, `loadData`) | API funktioniert | Save/Load-Test |
| AP-11.5 | Save-Isolation (`userdata/<experience-id>/`) | Saves pro Experience getrennt | Test: kein Cross-Access |
| AP-11.6 | Sandbox-Grundlage (Capability-Modell, Default DENY) | Permissions geprüft | Test: nicht erlaubte Capability blockiert |
| AP-11.7 | Play-Viewport (Experience rendern) | Game läuft im Client | Game spielbar |
| AP-11.8 | Library: Install + Play | Library zeigt installierte, Play startet | Loop funktioniert |
| AP-11.9 | Discover → Game Page → Play (kompletter Loop) | End-to-End | Creator→Publish→Discover→Play |

**DoD Phase 11:** Veröffentlichte Experience wird unabhängig vom Studio gestartet.
**Abhängigkeiten:** Phase 10 (Registry), Phase 7 (Runtime).

---

# Phase 12 — AI Game Factory

> Ziel: Director + Architect + Planner + Workers. Prompt erzeugt kleines editierbares/publishbares Game.
> Master Prompt §42, §43, §44, §45, §46, §47.

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-12.1 | GDD-Modell (`GDD.md` + `GDD.json`) | GDD speicherbar | GDD erzeugt |
| AP-12.2 | Game Director (Prompt → GDD) | Director erzeugt GDD | GDD sinnvoll |
| AP-12.3 | Architect (GDD → Architektur) | Architektur erzeugt | Architektur konsistent |
| AP-12.4 | Planner (Architektur → Task Graph) | Task Graph erzeugt | Tasks mit Dependencies |
| AP-12.5 | Task-Modell (`id`, `title`, `agent`, `priority`, `dependencies`, `ownedResources`, `acceptanceCriteria`, `status`) | Task-Modell | Unit-Test |
| AP-12.6 | Task-Graph-Status (BACKLOG→READY→IN_PROGRESS→REVIEW→TESTING→DONE) | Status-Übergänge | Test |
| AP-12.7 | Worker-Agents (Gameplay, Scene, UI, Asset, Code, Test) | Worker führen Tasks aus | Tasks erledigt |
| AP-12.8 | Resource Ownership + Locks | Keine parallelen Konflikte | Test: Lock verhindert Konflikt |
| AP-12.9 | Kanban im Studio (BACKLOG/READY/WORKING/REVIEW/TESTING/DONE) | Kanban zeigt echten Status | Status sichtbar |
| AP-12.10 | AI Game Factory-Flow (Prompt → editierbares Game) | Prompt erzeugt Game | Game im Studio editierbar |
| AP-12.11 | Ergebnis im Studio öffnen (keine Black Box) | Game editierbar | Studio zeigt Game |

**DoD Phase 12:** Prompt erzeugt kleines editierbares und publishbares Game.
**Abhängigkeiten:** Phase 8 (AI), Phase 5 (Commands), Phase 6 (WYSIWYG).

---

# Phase 13 — Validation / Repair

> Ziel: Runtime Logs, Screenshots, Tests, Repair.
> Master Prompt §89, §13.

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-13.1 | Runtime-Log-Erfassung | Logs werden gesammelt | Log-Datei |
| AP-13.2 | Screenshot-Erfassung | Screenshots aufgenommen | Bilddatei |
| AP-13.3 | Automatische Tests (Playtest-Skripte) | Tests laufen | Test-Ergebnis |
| AP-13.4 | Fehler-Erkennung (Crash, Fehler im Log) | Fehler erkannt | Fehler gemeldet |
| AP-13.5 | Repair-Agent (Fehler → Fix-Commands) | AI repariert Fehler | Fehler behoben |
| AP-13.6 | Validation-Pipeline (vor Publish) | Pipeline prüft | Fehler blockieren Publish |

**DoD Phase 13:** Fehler werden erkannt und repariert.
**Abhängigkeiten:** Phase 12 (AI), Phase 7 (Runtime).

---

# Phase 14 — Android

> Ziel: Mobile Runtime, Preview, Export.
> Master Prompt §70, §71.

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-14.1 | Android-SDK/Toolchain prüfen/installieren | `flutter doctor` / SDK ok | Tool-Check |
| AP-14.2 | Touch-Input (Multi-Touch) | Touch steuert Game | Test auf Gerät |
| AP-14.3 | Portrait/Landscape + Safe Areas | Orientierung korrekt | Test |
| AP-14.4 | UI-Scaling + Mobile Preview | UI skaliert | Test |
| AP-14.5 | Performance-Profile | FPS akzeptabel | Messung |
| AP-14.6 | Experience im Android-Client | Game läuft auf Android | Test |
| AP-14.7 | Standalone-Export (APK/AAB) | Export erzeugt APK | APK installierbar |
| AP-14.8 | Web-Export (optional) | Web-Build erzeugt | Web läuft |

**DoD Phase 14:** Experience läuft auf Android, Export möglich.
**Abhängigkeiten:** Phase 11 (Platform Play), Phase 7 (Runtime).

---

# Phase 15 — Remote Registry

> Ziel: Online-Plattform. Accounts, Creator Identity, Upload/Download, List, Public/Private, Search.
> Master Prompt §63, §64, §85.

| AP | Arbeitspunkt | DoD | Verifikation |
|----|--------------|-----|--------------|
| AP-15.1 | RemoteExperienceRegistry (Interface-Implementierung) | Remote-Registry ersetzt lokal | Interface erfüllt |
| AP-15.2 | Auth-Service (Accounts, Sessions) | Login/Logout | Test |
| AP-15.3 | Creator Identity | Creator-Profil | Test |
| AP-15.4 | Package-Upload | Upload funktioniert | Datei hochgeladen |
| AP-15.5 | Package-Download | Download funktioniert | Datei geladen |
| AP-15.6 | List Experiences (remote) | Liste vom Server | Test |
| AP-15.7 | Public/Private | Sichtbarkeit remote | Test |
| AP-15.8 | Search (remote) | Suche remote | Test |
| AP-15.9 | Package Storage (objektbasiert/CDN vorbereiten) | Storage abstrakt | Doku |

**DoD Phase 15:** Online-Plattform-Prototyp funktioniert.
**Abhängigkeiten:** Phase 10 (Registry-Interface), Phase 9 (Packaging).

---

# Phase 16+ — Post-MVP (bewusst später)

> Master Prompt §86. Nicht MVP, aber architektonisch vorbereitet.

| AP | Arbeitspunkt | Hinweis |
|----|--------------|---------|
| AP-16.1 | Cloud Saves | Save-Isolation (§56) bereits vorbereitet |
| AP-16.2 | Analytics | Events mit ExperienceId/VersionId strukturierbar (§72) |
| AP-16.3 | Ratings & Favorites | Datenmodell offen |
| AP-16.4 | Creator Profiles | Attribution (§52) vorbereitet |
| AP-16.5 | Asset Sharing | Asset-System (§48) |
| AP-16.6 | Remix / Fork | `derivedFromExperienceId` (§51) |
| AP-16.7 | Marketplace | Templates/Prefabs/Assets (§53) |
| AP-16.8 | Multiplayer | Session/Lobby/Replication (§57) |
| AP-16.9 | Game Servers | Matchmaking (§57) |
| AP-16.10 | Social | Community (§21) |
| AP-16.11 | Moderation Automation | Takedown/Disable (§67) |
| AP-16.12 | Monetization | — |

---

## Kritischer Pfad (MVP)

Der minimale End-to-End-Loop (Master Prompt §96):

```
Phase 1 (Client Shell)
  → Phase 2 (Experience Domain)
  → Phase 3 (Studio Shell)
  → Phase 4 (GameProject)
  → Phase 5 (Command System)
  → Phase 6 (WYSIWYG)
  → Phase 7 (Runtime Adapter)
  → Phase 9 (Packaging)
  → Phase 10 (Local Registry)
  → Phase 11 (Platform Play)
```

**Phase 8 (BYOK AI) und Phase 12 (AI Game Factory)** können parallel/anschließend laufen — sie sind nicht Teil des minimalen Loops, aber Kern des Produkts.

## Abhängigkeits-Übersicht

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6 ──► Phase 7
                                                              │            │
                                                              ▼            ▼
                                                          Phase 8 ◄── Phase 9
                                                              │            │
                                                              ▼            ▼
                                                          Phase 12 ◄── Phase 10 ──► Phase 11
                                                                              │
                                                                              ▼
                                                                          Phase 15
```

## Verifikations-Grundsatz

Jeder Arbeitspunkt gilt erst als abgeschlossen, wenn er **real** verifiziert ist (nicht nur "sieht plausibel aus"):
- Unit-Tests für Modelle/Commands/Registry.
- Integrationstests für Save/Load, Publish/Install/Play.
- Manuelle Verifikation im laufenden Client.
- Kein Fake-Button, kein Fake-Status, kein Fake-Progress.
