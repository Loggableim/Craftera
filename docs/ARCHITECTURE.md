# Architektur — Craftera

> Status: **Phase 0 – Reconnaissance** (Entwurf, noch keine Implementierung)
> Quelle: `docs/MASTER_PROMPT.md`

## 1. Produktphilosophie

Craftera ist eine **AI-native UGC Game Platform** mit integriertem WYSIWYG Studio, BYOK Multi-LLM und eigener Runtime-Abstraktion.

**Kein Roblox-Klon.** Übernommen wird nur das Plattformprinzip:

> Ein Client. Viele von Nutzern erschaffene Games. Ein integrierter Editor. Ein gemeinsames Ökosystem.

Der Desktop-Client besitzt zwei Rollen: **PLAYER** und **CREATOR**.

## 2. Drei Produktschichten (Master Prompt §5)

| Layer | Verantwortung |
|-------|---------------|
| **A – Platform** | Experiences, Nutzer, Discover, Library, Publishing, Versionen, Installation, Metadaten |
| **B – Studio** | WYSIWYG, Scene Editor, Inspector, Assets, Components, Scripts, AI, Playtest, Builds |
| **C – Runtime** | Rendering, Physics, Audio, Input, Animation, Game Execution, Sandbox, Lifecycle |

Die Schichten dürfen nicht unkontrolliert ineinander wachsen.

## 3. Zentrale Architekturregeln (Master Prompt §91)

1. **Experience** ist das Plattformobjekt.
2. **GameProject** ist die Source of Truth des Editors.
3. **Godot** ist Runtime Backend, nicht öffentliche Produktarchitektur.
4. **Mensch und AI** verwenden dieselben Commands.
5. Veröffentlichte Games laufen als **kontrollierte Experience Packages**.
6. **Creator Credentials** gelangen niemals in Experiences.
7. **Studio und Player Runtime** müssen getrennt sein.
8. Ein Game muss **lokal funktionieren**, bevor Cloud-Skalierung gebaut wird.

## 4. Engine-Abstraktion (Master Prompt §27)

```
USER / WYSIWYG / AI / CODE
        ↓
ENGINE COMMAND API
        ↓
GAME PROJECT MODEL
        ↓
RUNTIME ADAPTER
        ↓
GODOT
```

Das GameProject ist die Source of Truth. Der Godot-Output ist Runtime-Artefakt.

## 5. Repository-Struktur (Master Prompt §74)

```
client/    → Client-Shell + Views (Home, Discover, Library, Creator Hub, Settings)
studio/    → WYSIWYG-Editor (Viewport, Hierarchy, Inspector, Assets, Console, AI)
engine/    → Project Model, Scene, Entities, Components, Behaviors, Events, Commands
runtime/   → Host, Godot-Adapter, Sandbox, Platform API
platform/  → Experiences, Registry, Publishing, Packages, Discovery, Users, Storage
ai/        → Providers, Orchestrator, Agents, Planner, Tools, Memory
server/    → Lokaler HTTP-Server (statische UI + Registry-API)
tests/     → Unit- & Integrationstests
templates/ → Start-Templates
examples/  → Beispiel-Experiences
docs/      → Dokumentation
```

## 6. Technologie-Entscheidung (MVP)

Siehe `docs/DECISIONS.md` — Entscheidung D-001.

**Kurz:** Web-basierter UI-Core (HTML/CSS/JS, kein Framework), Node.js-Server für die lokale Registry-API. Später als Electron/Tauri-Desktop-Wrapper. Godot als Runtime-Backend (noch nicht installiert).

## 7. Offene Architekturfragen (Master Prompt §90)

- Wie wird der Godot-Runtime-Adapter konkret angebunden (Subprozess, eingebettetes Viewport)?
- Wie wird das Experience Package-Format final benannt (`.gamepkg` vs. Ordner)?
- Wie wird die Sandbox für fremde Experiences technisch umgesetzt?
