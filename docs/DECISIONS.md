# Entscheidungen — Craftera

> Status: **Phase 0 – Reconnaissance**
> Jede größere Architekturentscheidung wird hier mit Begründung und Konsequenzen festgehalten.

---

## D-001 — UI-Technologie für Client + Studio

**Datum:** Phase 0
**Status:** ✅ Entscheiden

**Entscheidung:** Web-basierter UI-Core (HTML/CSS/JS, kein Framework), serviert von einem Node.js-Server. Später als Electron- oder Tauri-Desktop-Wrapper.

**Begründung:**
- Schnellster Weg zum funktionierenden Creator→Publish→Play-Loop (Master Prompt §96).
- Web-UI ist 1:1 in Electron/Tauri wiederverwendbar — kein Wegwerf-Code.
- Größtes Ökosystem für WYSIWYG-Editoren (Canvas, Konva, PixiJS).
- Einfachste AI-Integration (fetch zu LLM-APIs).
- Godot ist laut Master Prompt §59 ohnehin nur Runtime-Backend, nicht UI.

**Konsequenzen:**
- Desktop-Shell (Electron/Tauri) wird erst nach funktionierendem MVP ergänzt.
- Dateisystem-/Credential-Zugriff im Browser eingeschränkt → später über Desktop-Wrapper oder Node-Backend.

**Verworfen:**
- Electron-first: zu schwer für den MVP-Start.
- Tauri: Rust nicht installiert, Toolchain-Setup nötig.
- Flutter: WYSIWYG-Editor in Flutter deutlich aufwändiger.
- Godot als UI: verstößt gegen §59, koppelt unnötig an Godot.

---

## D-002 — Backend für lokale Registry

**Datum:** Phase 0
**Status:** ✅ Entscheiden

**Entscheidung:** Node.js-HTTP-Server, der die statische UI ausliefert und die lokale Registry-API bereitstellt. Kein Build-Tooling, reines Node.js.

**Begründung:**
- Node.js ist installiert (v11.13.0).
- Ein Prozess für UI + API = minimaler Setup-Aufwand.
- Registry-Interfaces (Master Prompt §62) bleiben abstrakt, damit später ein Remote-Backend angeschlossen werden kann.

**Konsequenzen:**
- Daten liegen als JSON unter `.data/` (gitignored).
- `server/src/` enthält den Server-Code.

---

## D-003 — Godot als Runtime-Backend

**Datum:** Phase 0
**Status:** ⏳ Offen (nicht installiert)

**Entscheidung:** Godot wird technische Basis der Runtime (Master Prompt §58), aber **nicht** öffentliche Produktarchitektur.

**Offen:**
- Godot ist auf diesem System **nicht installiert** und nicht im PATH.
- Anbindung (Subprozess vs. eingebettetes Viewport) noch zu klären.
- Bis dahin: Runtime-Abstraktion (`runtime/host`, `runtime/platform_api`) vorbereiten, Godot-Adapter später ergänzen.

---

## D-004 — Experience Package-Format

**Datum:** Phase 0
**Status:** ⏳ Offen

**Entscheidung:** Noch nicht final. Arbeitstitel `.gamepkg` oder `ExperiencePackage` (Master Prompt §17). Nicht zu früh auf eine Dateiendung festlegen.

**Struktur (Entwurf):**
```
experience-package/
├── manifest.json
├── game/
├── assets/
├── runtime/
├── metadata/
└── integrity.json
```

---

## D-005 — MVP-Scope

**Datum:** Phase 0
**Status:** ✅ Entscheiden

**Entscheidung:** Zwei Vertical Slices (Master Prompt §80): Creator-Loop + Platform-Loop. Kein Cloud, kein Multiplayer, kein Marketplace, keine Social Features im MVP.

**Begründung:** Master Prompt §96 — ein vollständiger Loop schlägt fünfzig halbfertige Features.
