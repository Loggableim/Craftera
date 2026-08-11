# Craftera

**AI-native UGC Game Platform** mit integriertem WYSIWYG Studio, BYOK Multi-LLM und eigener Runtime-Abstraktion.

> Ein Client. Viele von Nutzern erschaffene Games. Ein integrierter Editor. Ein gemeinsames Ökosystem.

## Zielbild

Das vollständige Produktziel ist in [`docs/MASTER_PROMPT.md`](docs/MASTER_PROMPT.md) dokumentiert.

**Kurzfassung:** Eine AI-native UGC Game Platform mit integriertem WYSIWYG Studio, BYOK Multi-LLM und eigener Runtime-Abstraktion. Ein Client, viele von Nutzern erschaffene Games, ein integrierter Editor, ein gemeinsames Ökosystem.

## Status

**Phase 0 – Reconnaissance** (Arbeitsumgebung eingerichtet, noch keine Implementierung).

- ✅ Repository-Struktur gemäß Master Prompt §74 angelegt
- ✅ Architektur-Dokumente erstellt (`docs/`)
- ✅ Technologie-Entscheidungen getroffen (`docs/DECISIONS.md`)
- ⏳ Implementierung des Mini-UGC-Platform-Loops (Phase 1+)

## Struktur

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

## Dokumentation

- [`docs/MASTER_PROMPT.md`](docs/MASTER_PROMPT.md) — das vollständige Zielbild
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Systemarchitektur
- [`docs/PLATFORM_ARCHITECTURE.md`](docs/PLATFORM_ARCHITECTURE.md) — Plattform-Architektur
- [`docs/SECURITY_MODEL.md`](docs/SECURITY_MODEL.md) — Sicherheitsmodell
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — Roadmap & Phasen
- [`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md) — alle Phasen in konkrete Arbeitspunkte aufgelöst
- [`docs/CONSISTENT_GOAL.md`](docs/CONSISTENT_GOAL.md) — Zielbild für wiederkehrende autonome Runs (ein AP pro Run)
- [`docs/SKIPPED_POINTS.md`](docs/SKIPPED_POINTS.md) — nicht bearbeitbare Arbeitspunkte
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — Architektur-Entscheidungen

## Umgebung

| Tool | Version | Status |
|------|---------|--------|
| Node.js | 11.13.0 | ✅ installiert |
| Python | 3.11.14 | ✅ installiert |
| .NET | 10.0.302 | ✅ installiert |
| Go | 1.25.5 | ✅ installiert |
| Flutter | 3.29.3 | ✅ installiert |
| Git | 2.52.0 | ✅ installiert |
| Godot | — | ❌ nicht installiert (Runtime-Backend, später) |
| Ollama | — | ❌ nicht installiert (BYOK, später) |

## Lizenz

Noch nicht festgelegt.
