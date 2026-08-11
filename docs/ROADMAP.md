# Roadmap — Craftera

> Status: **Phase 0 – Reconnaissance** (Entwurf)
> Quelle: `docs/MASTER_PROMPT.md` §80–§87

## Versionen

| Version | Fokus | Definition of Done |
|---------|-------|---------------------|
| **0.1** | Client Shell + Studio + Project Model + Commands + Godot Runtime | Start Client → Create Experience → Studio → Create Scene → Import PNG → Place Sprite → Move/Scale → Save → Play → Stop → Reopen |
| **0.2** | AI Copilot (BYOK) | "Verschiebe das Objekt 200px nach rechts" → reale Editoränderung; "Mach daraus einen Gegner" → AI erzeugt Components/Behaviors |
| **0.3** | Lokale UGC Platform | Creator veröffentlicht lokal; Game erscheint im Client als installierbare/spielbare Experience |
| **0.4** | AI Game Factory | Prompt erzeugt spielbares, editierbares, speicherbares, veröffentlichbares Game |
| **0.5** | Remote Platform Prototype | Accounts, Creator Identity, Upload/Download Package, List, Public/Private, Search |
| **0.6+** | Cloud Saves, Analytics, Ratings, Favorites, Creator Profiles, Asset Sharing, Remix, Marketplace, Multiplayer, Game Servers, Social, Moderation, Monetization | — |

## Entwicklungsphasen (Master Prompt §87)

| Phase | Inhalt | DoD |
|-------|--------|-----|
| **0** | Reconnaissance: Environment, Godot, SDKs, Build Tools, Risiken | `docs/ARCHITECTURE.md`, `PLATFORM_ARCHITECTURE.md`, `SECURITY_MODEL.md`, `ROADMAP.md`, `DECISIONS.md` |
| **1** | Client Shell: Home, Discover, Library, Create, Settings | Client startet stabil, Navigation funktioniert real |
| **2** | Experience Domain: Experience, ExperienceId, Metadata, Version, Repository | lokale Experiences erstellen/speichern/laden |
| **3** | Studio Shell: Viewport, Hierarchy, Inspector, Assets, Console, Play Toolbar, AI Panel | Experience aus Creator Hub im Studio öffnen |
| **4** | GameProject: strukturiertes Project Model | Save/Load exakt reproduzierbar |
| **5** | Command System: alle Editor-Mutationen über Commands | Undo/Redo funktioniert |
| **6** | WYSIWYG: echter visueller Editor | kleine Szene vollständig visuell baubar |
| **7** | Runtime Adapter: GameProject → Godot Runtime → Play | Studio-Szene läuft real |
| **8** | BYOK AI: Provider Abstraction, Credential Store, Model Profiles, AI Command Tools | AI verändert sichtbares Projekt |
| **9** | Experience Packaging: Package Builder, Manifest, Validation, Hashing | Package reproduzierbar erzeugbar |
| **10** | Local Registry: publish, list, search, install, update, launch | publiziertes Game erscheint im Client |
| **11** | Platform Play: Game Page → Play → Runtime Host | veröffentlichte Experience startet unabhängig vom Studio |
| **12** | AI Game Factory: Director + Architect + Planner + Workers | Prompt erzeugt kleines editierbares/publishbares Game |
| **13** | Validation/Repair: Runtime Logs, Screenshots, Tests, Repair | — |
| **14** | Android: Mobile Runtime, Preview, Export | — |
| **15** | Remote Registry: Online-Plattform | — |

## MVP-Priorität (Master Prompt §96)

> Lieber einen einzigen vollständigen Creator→Publish→Play-Loop als fünfzig halbfertige Plattformfeatures.

**Erstes großes technisches Ziel:**
> Baue den ersten vollständigen, funktionsfähigen Mini-UGC-Platform-Loop, in dem ein Nutzer innerhalb desselben Clients eine Experience erstellen, bearbeiten, testen, veröffentlichen, wiederentdecken und anschließend als Spieler starten kann.

## Nicht-MVP (bewusst später)

Cloud, Multiplayer, Marketplace, Social Features, Monetarisierung, Recommendation Engine, komplexe Moderation.
