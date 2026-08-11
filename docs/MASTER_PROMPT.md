# MASTER PROMPT — AI-Native UGC Game Platform mit integriertem Studio, BYOK und eigener Runtime-Abstraktion

## 0. Auftrag

Baue ein neues GitHub-Repository für eine **AI-native User-Generated-Content Game Platform mit integriertem WYSIWYG Game Studio**.

Das langfristige Produkt ist konzeptionell eher mit einer Kombination aus:

* Roblox als UGC-Plattform-Prinzip
* Roblox Studio als integrierter Creator-Workflow
* Godot als technisches Runtime-Backend
* Construct/GameMaker als zugänglichem visuellen Editor
* Steam/itch.io-artiger Discoverability
* AI Coding Agents
* AI Game Factory
* BYOK Multi-LLM Studio

vergleichbar.

**Wichtig:**

Es soll ausdrücklich **kein Roblox-Klon** entstehen.

Nicht Branding, UI, Geschäftsmodell, Netzwerkprotokolle oder proprietäre Roblox-Technologien kopieren.

Übernommen wird nur das grundlegende Plattformprinzip:

# Ein Client.

# Viele von Nutzern erschaffene Games.

# Ein integrierter Editor.

# Ein gemeinsames Ökosystem.

Die Plattform soll eine eigene Identität, Architektur und UX besitzen.

---

# 1. Neues übergeordnetes Zielbild

Das bisherige Ziel einer eigenständigen kleinen Game Engine wird erweitert.

Wir bauen nicht nur:

> eine Engine, mit der ein Nutzer sein eigenes Spiel entwickelt.

Wir bauen:

# Eine Plattform, in der Nutzer Games spielen UND selbst neue Games erschaffen können.

Der gleiche Desktop-Client besitzt zwei zentrale Rollen:

```text
PLAYER
+
CREATOR
```

Ein Nutzer kann:

```text
CLIENT STARTEN
↓
DISCOVER
↓
GAME AUSWÄHLEN
↓
PLAY

oder:

CLIENT STARTEN
↓
STUDIO
↓
NEW EXPERIENCE
↓
DRAG & DROP / AI / CODE
↓
PLAYTEST
↓
PUBLISH
↓
EXPERIENCE ERSCHEINT IN DER PLATFORM
↓
ANDERE NUTZER KÖNNEN SIE SPIELEN
```

Damit entsteht kein isoliertes Game-Development-Tool mehr.

Es entsteht:

# AI-NATIVE GAME CREATION ECOSYSTEM

---

# 2. Kernidee

Die Anwendung ist gleichzeitig:

```text
GAME CLIENT
+
GAME LAUNCHER
+
DISCOVERY PLATFORM
+
CREATOR HUB
+
WYSIWYG GAME EDITOR
+
AI GAME STUDIO
+
RUNTIME HOST
+
PUBLISHING SYSTEM
```

Ein Nutzer soll den Client installieren und anschließend grundsätzlich keinen externen Editor benötigen.

Normale Spieler sehen primär:

```text
Home
Discover
Library
Favorites
Recently Played
Game Pages
Play
```

Creator erhalten zusätzlich:

```text
Creator Hub
My Experiences
Create
Studio
Versions
Publishing
Analytics
AI
```

Es ist jedoch **dieselbe Anwendung und dasselbe Ökosystem**.

---

# 3. Entscheidender Paradigmenwechsel

Das Hauptobjekt der Plattform ist nicht mehr:

```text
GameProject
```

sondern:

```text
Experience
```

Eine Experience ist ein veröffentlichbares Game innerhalb des Ökosystems.

Beispiel:

```text
Experience
├── ExperienceId
├── Metadata
├── Creator
├── Project
├── RuntimeConfiguration
├── BuildManifest
├── Assets
├── Permissions
├── Versions
├── Releases
└── DistributionMetadata
```

Das interne GameProject bleibt bestehen.

Aber:

```text
Experience
    ↓
GameProject
    ↓
Scenes
Entities
Components
Assets
Scripts
UI
Audio
Animations
Settings
```

Dadurch wird aus der Engine eine Plattform.

---

# 4. Zentrale Produktphilosophie

Das Produkt soll folgende Aussage ermöglichen:

> Installiere den Client, spiele Games anderer Nutzer oder öffne Studio und erschaffe dein eigenes Game.

Für die Erstellung kann der Nutzer wählen zwischen:

```text
MANUAL
VISUAL
CODE
AI COPILOT
AI AUTOPILOT
```

Alle Methoden verändern dasselbe strukturierte GameProject.

Keine davon erzeugt eine separate Black Box.

---

# 5. Drei Produktschichten

Architektonisch klar zwischen drei Ebenen unterscheiden.

## Layer A – Platform

Verantwortlich für:

* Experiences
* Benutzer
* Creator
* Discover
* Library
* Publishing
* Versionen
* Installation
* Updates
* Metadaten
* Ratings später
* Tags
* Kategorien
* Suche
* Moderation später
* Analytics später

## Layer B – Studio

Verantwortlich für:

* WYSIWYG
* Scene Editor
* Inspector
* Assets
* Components
* Scripts
* AI
* Game Factory
* Tests
* Playtest
* Builds

## Layer C – Runtime

Verantwortlich für:

* Rendering
* Physics
* Audio
* Input
* Animation
* Game Execution
* Runtime APIs
* Platform APIs
* Sandbox
* Game Lifecycle

Diese drei Schichten dürfen nicht unkontrolliert ineinander wachsen.

---

# 6. Der Client ist das eigentliche Produkt

Der Nutzer startet nicht „den Editor“.

Er startet:

# den Game Platform Client.

Beispiel:

```text
┌──────────────────────────────────────────────────────────────┐
│ LOGO     Home   Discover   Library   Create        Profile   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                       FEATURED                               │
│                                                              │
│                [ PLAY EXPERIENCE ]                           │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Trending                                                     │
│ [Game] [Game] [Game] [Game] [Game]                          │
│                                                              │
│ Recently Played                                              │
│ [Game] [Game] [Game]                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Über:

```text
Create
```

wechselt der Nutzer in den Creator-Bereich.

---

# 7. Creator Hub

Der Client benötigt einen integrierten Creator Hub.

Beispiel:

```text
CREATOR HUB

My Experiences

┌──────────────────┐
│ Wizard Survivors │
│ Published        │
│ 1.4K Plays       │
│ [Edit] [Manage]  │
└──────────────────┘

┌──────────────────┐
│ Neon Racer       │
│ Draft            │
│ [Edit]            │
└──────────────────┘

[ + CREATE EXPERIENCE ]
```

Funktionen:

* neue Experience erstellen
* bestehende Experience öffnen
* lokale Projekte importieren
* Drafts anzeigen
* veröffentlichte Experiences anzeigen
* Versionen anzeigen
* Release verwalten
* Game Metadata ändern
* Thumbnail ändern
* Beschreibung ändern
* Tags ändern
* unterstützte Plattformen ändern
* Playtests starten
* Veröffentlichung durchführen

---

# 8. New Experience Flow

Beim Erstellen eines Games soll nicht sofort ein leerer technischer Editor erscheinen.

Beispiel:

```text
CREATE EXPERIENCE

Name:
_____________________

Creation Mode:

[ Empty Project ]
[ Template ]
[ Create with AI ]

Genre:
[ Platformer ]
[ Top Down ]
[ Roguelite ]
[ Puzzle ]
[ Casual ]
[ Custom ]

Target:
[x] Desktop
[x] Android
[ ] Web

AI Provider:
[ Configure BYOK ]

[ CREATE ]
```

---

# 9. BYOK ist ein Kernfeature

BYOK = Bring Your Own Key.

Die Plattform verkauft zunächst nicht zwingend eigene AI-Tokens.

Der Creator kann seine eigenen Provider verwenden.

Unterstützung architektonisch mindestens vorbereiten für:

```text
OpenAI
Anthropic
Google
OpenRouter
Ollama
OpenAI-compatible APIs
lokale Modelle
weitere Provider
```

Die Plattform benötigt eine einheitliche Provider-Abstraktion.

Beispiel:

```text
AIProvider

generate()
stream()
generate_structured()
tool_call()
vision()
embeddings()
capabilities()
```

---

# 10. BYOK UX

Unter:

```text
Settings
→ AI Providers
```

beispielsweise:

```text
AI PROVIDERS

OpenAI
Status: Connected
Model: [ ... ]

OpenRouter
Status: Not configured
[ Add API Key ]

Local Ollama
Status: Detected
Models:
- model-a
- model-b

Default Coding Model:
[ ...]

Default Vision Model:
[ ...]

Default Fast Model:
[ ...]
```

Nutzer können verschiedene Modelle verschiedenen Aufgaben zuweisen.

Beispiel:

```text
Game Director → Model A
Coding        → Model B
Vision        → Model C
Assets        → Provider D
Quick Edits   → Local Model
```

---

# 11. Sicherheit von BYOK

API Keys niemals:

* in veröffentlichten Games speichern
* in Game Packages aufnehmen
* in Experience Metadata speichern
* in Git committen
* an andere Spieler übertragen
* über Project Files exportieren

Credentials gehören ausschließlich in einen lokalen sicheren Credential Store.

Bevorzugt:

```text
OS Credential Manager
+
verschlüsselte lokale Settings
```

Project Files referenzieren nur:

```text
provider_profile_id
```

niemals den Key selbst.

---

# 12. Spieler benötigen keine AI Keys

Eine wichtige Trennung:

# BYOK gehört zum CREATION WORKFLOW.

Ein Spieler darf nicht den AI-Key des Creators benötigen, um ein veröffentlichtes Game zu spielen.

Das veröffentlichte Game muss grundsätzlich ohne Creator-LLM funktionieren.

Falls später Experiences AI zur Laufzeit verwenden dürfen, muss dafür eine völlig separate Runtime-AI-API mit:

* Permissions
* Quotas
* Billing
* Proxy
* Abuse Protection

entstehen.

Nicht mit dem Creator-BYOK-System vermischen.

---

# 13. Experience Model

Definiere ein eindeutiges Experience Model.

Beispiel:

```json
{
  "experienceId": "exp_01JXYZ...",
  "name": "Wizard Survivors",
  "slug": "wizard-survivors",
  "creatorId": "user_123",
  "description": "...",
  "visibility": "public",
  "status": "published",
  "tags": [
    "roguelite",
    "2d",
    "magic"
  ],
  "supportedPlatforms": [
    "windows",
    "android"
  ],
  "currentRelease": "1.2.0"
}
```

ExperienceId muss stabil und unabhängig von Name oder Dateipfad sein.

---

# 14. Experience ≠ Release

Eine Experience besitzt mehrere Versionen.

```text
Wizard Survivors
│
├── Draft
│
├── Version 1
├── Version 2
├── Version 3
│
└── Current Release → Version 3
```

Dadurch können Creator weiterentwickeln, ohne die aktive Version sofort zu überschreiben.

---

# 15. Versionierungsmodell

Beispiel:

```text
ExperienceVersion

versionId
experienceId
versionNumber
createdAt
creator
projectRevision
runtimeVersion
packageHash
status
```

Status:

```text
DRAFT
VALIDATING
READY
PUBLISHED
DEPRECATED
REJECTED
BROKEN
```

---

# 16. Publishing Pipeline

Ein Game wird nicht einfach als beliebiger Projektordner veröffentlicht.

Verwende eine kontrollierte Pipeline:

```text
PROJECT
↓
VALIDATE
↓
DEPENDENCY CHECK
↓
ASSET CHECK
↓
SCRIPT CHECK
↓
BUILD EXPERIENCE PACKAGE
↓
RUNTIME COMPATIBILITY CHECK
↓
PLAYTEST
↓
PACKAGE HASH
↓
SIGN
↓
PUBLISH VERSION
↓
REGISTER RELEASE
↓
AVAILABLE IN DISCOVER
```

Ein Publish ist damit ein reproduzierbarer Vorgang.

---

# 17. Experience Package

Definiere ein eigenes distributierbares Format.

Arbeitstitel beispielsweise:

```text
.gamepkg
```

oder intern:

```text
ExperiencePackage
```

Nicht zu früh auf eine Dateiendung festlegen.

Beispiel:

```text
experience-package/
├── manifest.json
├── game/
├── assets/
├── runtime/
├── metadata/
└── integrity.json
```

Das Package darf nur notwendige Laufzeitdaten enthalten.

Nicht:

* AI Memory
* Agent Logs
* API Keys
* Git History
* Editor Cache
* Source Thumbnails
* interne Debugdaten ohne Grund

---

# 18. Experience Manifest

Beispiel:

```json
{
  "formatVersion": 1,
  "experienceId": "exp_xyz",
  "versionId": "ver_xyz",
  "runtimeVersion": "0.1",
  "entryScene": "scene_main",
  "orientation": "landscape",
  "permissions": [],
  "dependencies": [],
  "contentHash": "..."
}
```

Der Client muss vor dem Start überprüfen können:

* Runtime kompatibel?
* Package vollständig?
* Hash korrekt?
* Assets vorhanden?
* benötigte Permissions zulässig?

---

# 19. Plattform-Environment

Experiences leben innerhalb einer gemeinsamen Environment.

Der Client besitzt beispielsweise:

```text
HOME
DISCOVER
SEARCH
LIBRARY
FAVORITES
RECENT
CREATOR HUB
STUDIO
PROFILE
SETTINGS
```

Damit wird die Plattform zum primären Einstiegspunkt.

---

# 20. Discover

Implementiere langfristig eine Experience Discovery Layer.

Kategorien beispielsweise:

```text
Featured
New
Trending
Popular
Friends Playing
Recommended
Top Rated
Recently Updated
2D
Mobile
Roguelite
Platformer
Puzzle
Casual
Experimental
AI Created
```

Für MVP dürfen Ranking und Recommendations simpel sein.

Keine komplexe Recommendation Engine bauen, bevor der grundlegende Plattform-Loop funktioniert.

---

# 21. Game Page

Jede veröffentlichte Experience erhält innerhalb des Clients eine Game Page.

Beispiel:

```text
WIZARD SURVIVORS

[ Thumbnail ]

Created by User123

A colorful 2D survival roguelite...

Tags:
Roguelite • Magic • 2D

[ PLAY ]

Version 1.2
Updated ...
```

Später:

* Screenshots
* Videos
* Ratings
* Favorites
* Player Count
* Creator Page
* Changelog
* Achievements
* Community

MVP:

* Name
* Creator
* Thumbnail
* Beschreibung
* Version
* Tags
* Play

---

# 22. Library

Der Client verwaltet:

```text
Installed
Owned/Created
Favorites
Recently Played
Updates
```

Eine Experience soll über eine stabile ExperienceId identifiziert werden.

Nicht über Installationspfade.

---

# 23. Installation

Beim Start einer Experience:

```text
PLAY
↓
CHECK LOCAL VERSION
↓
CHECK REQUIRED VERSION
↓
DOWNLOAD / UPDATE IF NECESSARY
↓
VERIFY PACKAGE
↓
PREPARE RUNTIME
↓
START EXPERIENCE
```

Im lokalen Entwicklungs-MVP kann dieser Ablauf zunächst über einen lokalen Registry-Service simuliert werden.

Aber:

# Keine Fake-Buttons.

Der Ablauf soll technisch tatsächlich funktionieren.

---

# 24. Runtime Host

Der Platform Client darf nicht einfach blind fremde Editorprojekte öffnen.

Veröffentlichte Experiences laufen über einen kontrollierten Runtime Host.

Konzeption:

```text
Platform Client
      ↓
Experience Manager
      ↓
Runtime Host
      ↓
Experience Package
      ↓
Godot Runtime
```

Editor-Code und Player-Runtime müssen sauber getrennt bleiben.

---

# 25. Game Sandbox

Da fremde Nutzer Games veröffentlichen können, ist Sandbox-Sicherheit zentral.

Eine Experience darf niemals automatisch uneingeschränkten Zugriff erhalten auf:

* gesamtes Dateisystem
* Credentials
* AI Keys
* Client-Daten
* andere Projekte
* Betriebssystem-Kommandos
* beliebige Prozesse
* Platform Tokens
* interne Platform APIs

Erstelle langfristig ein Capability-/Permission-Modell.

Beispiel:

```text
filesystem.game_save
network.http
platform.profile.read
platform.leaderboard
platform.storage
clipboard
microphone
camera
```

Default:

# DENY.

Capabilities müssen explizit erlaubt werden.

---

# 26. Kein beliebiger Native Code

Für UGC-Publishing darf nicht jeder Creator beliebigen nativen Code in ein Game Package legen können.

Das ist eine fundamentale Sicherheitsgrenze.

MVP bevorzugt:

* kontrolliertes GDScript
* Engine Behaviors
* deklarative Components
* freigegebene Runtime APIs

Später möglicherweise:

* Sandbox-Scripting
* WebAssembly
* Capability-basierte Runtime

Keine ungeprüften DLLs/EXEs innerhalb veröffentlichter Experiences.

---

# 27. Engine-Abstraktion bleibt zentral

Die wichtigste Architekturregel des ursprünglichen Konzepts bleibt bestehen.

Nicht:

```text
AI
↓
Godot .tscn
```

Sondern:

```text
USER
WYSIWYG
AI
CODE
      ↓
ENGINE COMMAND API
      ↓
GAME PROJECT MODEL
      ↓
RUNTIME ADAPTER
      ↓
GODOT
```

Das GameProject ist die Source of Truth des Creators.

Der Godot-Output ist Runtime-Artefakt.

---

# 28. Project Model

Beispiel:

```text
GameProject
├── ProjectSettings
├── Scenes
├── Entities
├── Components
├── Systems
├── Scripts
├── Assets
├── UI
├── Animations
├── Audio
├── InputActions
├── SaveSchema
└── BuildSettings
```

Darüber:

```text
Experience
└── GameProject
```

---

# 29. Stable IDs überall

Verwende IDs für:

```text
Experience
Version
Scene
Entity
Component
Asset
Prefab
Script
Animation
UI Element
Task
Creator
```

AI-Agenten und Runtime Adapter sollen IDs verwenden.

Keine fragile Architektur aus Dateipfad-Annahmen.

---

# 30. Der integrierte Studio-Modus

Studio wird innerhalb des Clients geöffnet.

Beispiel:

```text
┌──────────────────────────────────────────────────────────────────┐
│ ← Client   Experience: Wizard Survivors   ▶ Play   Publish   AI │
├───────────────┬─────────────────────────────┬────────────────────┤
│ HIERARCHY     │                             │ INSPECTOR          │
│               │                             │                    │
│ World         │        GAME VIEWPORT        │ Transform          │
│ ├ Player      │                             │ Components         │
│ ├ Enemy       │         WYSIWYG             │ Behavior           │
│ ├ Map         │                             │                    │
│ └ UI          │                             │                    │
├───────────────┴─────────────────────────────┴────────────────────┤
│ Assets | Code | Animation | Console | Tasks | AI | Versions     │
└──────────────────────────────────────────────────────────────────┘
```

---

# 31. Studio Workflow

Der Nutzer soll grundsätzlich:

```text
CREATE
↓
EDIT
↓
PLAYTEST
↓
EDIT
↓
VALIDATE
↓
PUBLISH
```

ohne die Anwendung zu verlassen.

Das ist eines der wichtigsten Produktziele.

---

# 32. WYSIWYG

Der Editor bleibt ein Kernfeature.

Mindestens:

* Objektselektion
* Drag & Drop
* Move
* Scale
* Rotate
* Bounding Boxes
* Grid
* Snapping
* Zoom
* Pan
* Multi Select
* Box Select
* Copy/Paste
* Duplicate
* Delete
* Parenting
* Layering
* Undo
* Redo

Was der Creator im Studio sieht, soll möglichst dem späteren Game entsprechen.

---

# 33. Hierarchy

Beispiel:

```text
MainLevel
├── Environment
├── Player
├── Enemies
│   ├── Slime01
│   └── Slime02
├── Pickups
└── UI
```

Funktionen:

* Reparent
* Rename
* Duplicate
* Delete
* Lock
* Visibility
* Group
* Search
* Add Component
* Create Prefab

---

# 34. Inspector

Nicht rohe Runtime-Interna zeigen.

Nicht primär:

```text
CharacterBody2D.velocity.x
```

Sondern:

```text
Movement

Speed       250
Acceleration 800
Jump Force  420
Gravity     980
```

Die Plattform besitzt ihre eigene öffentliche Engine-UX.

Godot bleibt Implementierungsdetail.

---

# 35. Component System

Beispiele:

```text
Transform
Sprite
AnimatedSprite
PhysicsBody
Collider
PlayerController
Health
Damage
Movement
EnemyAI
Camera
AudioSource
Interactable
Collectible
Spawner
Timer
Navigation
UIElement
Saveable
Networked
```

Ein Entity kombiniert Components.

AI und Mensch verwenden dieselben Components.

---

# 36. Behaviors statt nur Code

Um UGC-Erstellung zugänglicher und sicherer zu machen, soll die Engine langfristig vorgefertigte Behaviors unterstützen.

Beispiele:

```text
Follow Player
Patrol
Take Damage
Deal Damage
Collect Item
Open Door
Spawn Enemy
Shoot Projectile
Move Platform
Play Sound
Change Scene
Show Dialog
Save Value
```

Diese Behaviors können visuell konfigurierbar sein.

Das reduziert die Notwendigkeit für eigenes Coding erheblich.

---

# 37. Event System

Unterstütze ein verständliches Event-/Signal-System.

Beispiel:

```text
WHEN Player touches Coin
→ Add Score 1
→ Play Sound
→ Destroy Coin
```

oder:

```text
Enemy
OnHealthZero
→ Play Death Animation
→ Drop Loot
→ Destroy
```

Das Event-System muss ebenfalls über Commands manipulierbar sein.

Dadurch kann AI Gameplay bauen, ohne überall individuellen Code zu erzeugen.

---

# 38. Command API

Alle verändernden Editoraktionen laufen über strukturierte Commands.

Mindestens:

```text
CreateEntity
DeleteEntity
MoveEntity
RenameEntity
SetProperty
AddComponent
RemoveComponent
CreateScene
DeleteScene
InstantiatePrefab
ImportAsset
CreateAnimation
PaintTile
CreateUIElement
ConnectEvent
CreateBehavior
ConfigureBehavior
```

Beispiel:

```json
{
  "command": "SetProperty",
  "entityId": "entity_player",
  "componentId": "movement",
  "property": "speed",
  "value": 300
}
```

Der entscheidende Leitsatz:

# Mensch und AI benutzen dieselbe Command API.

---

# 39. Undo/Redo

Commands sollen soweit möglich invertierbar sein.

Dadurch entstehen:

* Undo
* Redo
* Change History
* AI History
* Conflict Detection
* reproduzierbare Veränderungen
* Change Review

---

# 40. AI Studio

AI ist kein Chatfenster neben dem Editor.

AI ist Teilnehmer des Editor-Modells.

Der Assistent kennt:

* Experience
* Project
* aktuelle Scene
* Selection
* Entities
* Components
* Assets
* Prefabs
* Events
* Behaviors
* Scripts
* Errors
* Build Target
* GDD
* offene Tasks
* letzte Änderungen

Beispiel:

Creator selektiert Slime und schreibt:

> Mach ihn langsamer, gib ihm 50 HP und lass ihn dem Spieler folgen.

Resultat:

```text
SetProperty Movement.speed → 60
AddComponent Health
SetProperty Health.max → 50
AddBehavior FollowTarget
SetProperty target → Player
```

Sofort sichtbar im Editor.

---

# 41. AI Modification Preview

Bei größeren AI-Operationen:

```text
AI proposes:

+ Add Health to Slime
+ Add FollowTarget
~ Movement Speed: 100 → 60
+ Add Collider

[ Preview ]
[ Apply ]
[ Reject ]
```

Optional:

```text
Auto Apply Safe Changes
```

---

# 42. AI Game Factory

Der Creator kann schreiben:

> Erstelle ein 2D Mobile Roguelite mit einem Magier. Gegner kommen in Wellen. Der Spieler sammelt XP und kann Feuer-, Eis- und Blitzzauber kombinieren.

Workflow:

```text
PROMPT
↓
GAME DIRECTOR
↓
GDD
↓
ARCHITECT
↓
TASK GRAPH
↓
PROJECT MODEL
↓
SCENES
↓
ENTITIES
↓
COMPONENTS
↓
BEHAVIORS
↓
ASSETS
↓
UI
↓
GAMEPLAY
↓
PLAYTEST
↓
VALIDATE
↓
REPAIR
↓
EDITABLE EXPERIENCE
```

Danach landet das Ergebnis nicht als Black Box irgendwo auf der Festplatte.

Es wird:

# im Studio geöffnet.

Der Creator kann alles weiterbearbeiten.

---

# 43. GDD

Speichere:

```text
.ai/game_design/GDD.md
.ai/game_design/GDD.json
```

Maschinenlesbare Struktur beispielsweise:

```json
{
  "genre": "2D Roguelite",
  "platforms": ["windows", "android"],
  "coreLoop": [],
  "mechanics": [],
  "entities": [],
  "scenes": [],
  "uiScreens": [],
  "assets": [],
  "levels": []
}
```

---

# 44. Multi-Agent Orchestrator

Für größere AI-Aufgaben existiert ein Orchestrator.

Rollen:

```text
GAME DIRECTOR
ARCHITECT
PLANNER
GAMEPLAY
SCENE
UI
ASSET
ANIMATION
LEVEL
AUDIO
CODE
TEST
VISION
REPAIR
BUILD
PUBLISH
```

Nicht jede Rolle benötigt ein eigenes Modell.

Agent = Verantwortungsbereich.

Der gleiche Provider kann mehrere Rollen ausführen.

---

# 45. Task Graph

Nicht nur Todo-Liste.

Task:

```text
id
title
description
agent
priority
dependencies
inputs
outputs
ownedResources
acceptanceCriteria
tests
status
```

Status:

```text
BACKLOG
READY
IN_PROGRESS
REVIEW
TESTING
BLOCKED
FAILED
DONE
```

---

# 46. Kanban im Studio

Creator kann AI-Arbeit beobachten:

```text
BACKLOG | READY | WORKING | REVIEW | TESTING | DONE
```

Task Card:

```text
Create Player Controller

Agent:
Gameplay

Changes:
Player
Movement
Input

Tests:
3/3 PASS
```

Keine Fake-Agentenanimation.

Nur echten Status anzeigen.

---

# 47. AI Resource Ownership

Mehrere Agenten dürfen nicht unkoordiniert dieselben Ressourcen verändern.

Task definiert beispielsweise:

```text
ownedResources:
- entity_player
- scene_level_01
- script_player_controller
```

Orchestrator verwaltet Locks.

---

# 48. Asset System

Asset Browser:

```text
Images
Sprites
Sprite Sheets
Tiles
Audio
Music
Fonts
Scenes
Prefabs
Scripts
Materials
Animations
Generated
```

Jedes Asset erhält eine stabile ID.

Beispiel:

```json
{
  "id": "asset_player_idle",
  "type": "sprite",
  "path": "assets/player/player_idle.png",
  "tags": ["player", "idle"],
  "generated": true
}
```

---

# 49. AI-generated Assets

AI kann später über austauschbare Asset Provider erzeugen:

* Sprites
* Icons
* Textures
* Backgrounds
* UI Assets
* Audio
* Music
* Voice

Generated Assets werden wie normale Assets behandelt.

Sie erhalten IDs und Metadaten.

Niemals Sonderpfade etablieren, die nur AI versteht.

---

# 50. Templates

Creator sollen schnell beginnen können.

Templates:

```text
Empty 2D
Platformer
Top Down
Roguelite
Puzzle
Mobile Portrait
Mobile Landscape
Clicker
Endless Runner
Arena
```

Templates sind normale GameProjects und dürfen weiterbearbeitet werden.

---

# 51. Fork / Remix langfristig vorbereiten

Eine für UGC-Plattformen interessante spätere Funktion:

```text
REMIX EXPERIENCE
```

Wenn ein Creator dies erlaubt:

```text
Experience A
↓
Create Remix
↓
Experience B
```

Dabei wird eine editierbare Kopie erzeugt.

Metadata speichert:

```text
derivedFromExperienceId
```

Lizenz-/Creator-Regeln müssen berücksichtigt werden.

Nicht MVP.

Architektonisch aber nicht verhindern.

---

# 52. Creator Attribution

Assets und Experiences sollten langfristig Attribution unterstützen.

Beispiel:

```text
creatorId
sourceExperienceId
originalAssetId
license
```

Damit kann später ein gemeinsames Creator-Ökosystem entstehen.

---

# 53. Marketplace langfristig

Nicht MVP.

Architektur aber offenhalten für:

```text
Templates
Prefabs
Components
Behaviors
Assets
Music
UI Kits
AI Agents
Plugins
```

Creator könnten solche Ressourcen veröffentlichen.

Das Plattformmodell darf nicht ausschließlich komplette Games kennen.

---

# 54. Plugin-/Extension-System

Langfristig:

* Components
* Behaviors
* Inspector Controls
* Importer
* Exporter
* AI Tools
* Agents
* Templates
* Runtime APIs

Plugins benötigen ebenfalls Permissions.

Keine beliebige Code-Ausführung innerhalb des Clients.

---

# 55. Platform API

Games sollen später kontrolliert Funktionen der Plattform verwenden können.

Beispiele:

```text
Platform.get_current_user()
Platform.save_data()
Platform.load_data()
Platform.unlock_achievement()
Platform.submit_score()
Platform.open_experience()
```

Die API ist stabil und unabhängig vom Godot Backend.

Nicht:

```text
GodotSingletonXYZ...
```

sondern:

```text
PlatformAPI
```

---

# 56. Save Data

Eine Experience benötigt einen standardisierten Save-Bereich.

Konzept:

```text
User
└── Experience
    └── SaveData
```

Game kann nicht auf Saves anderer Experiences zugreifen.

Lokales MVP:

```text
userdata/<experience-id>/
```

Später Cloud Save möglich.

---

# 57. Multiplayer

Multiplayer ist langfristig wichtig für eine UGC-Plattform.

Aber:

# Nicht MVP.

Architektur vorbereiten für:

```text
Session
Lobby
Player
Replication
Authority
Game Server
Matchmaking
```

Version 0.x konzentriert sich zunächst auf:

```text
Singleplayer
Local Runtime
```

Keine monatelange Multiplayer-Infrastruktur bauen, bevor der Creator→Publish→Play-Loop existiert.

---

# 58. Runtime Adapter

Godot wird technische Basis.

Klare Grenze:

```text
engine/runtime/
    RuntimeAdapter
    GodotAdapter
    SceneCompiler
    ResourceCompiler
    ScriptBridge
    InputBridge
    ProjectBuilder
    ExperiencePackager
```

Mapping:

```text
GameProject → Runtime Project
Entity → Godot Nodes
Components → Nodes / Resources / Scripts
Scene → PackedScene
Input → InputMap
BuildSettings → Runtime Configuration
```

Der Rest der Anwendung weiß möglichst wenig über Godot-Interna.

---

# 59. Kein Godot Editor als Produkt

Der offizielle Godot Editor ist kein Bestandteil des normalen Creator Workflows.

Der Nutzer soll:

* keinen Godot-Projektbaum verstehen müssen
* keine `.tscn`-Dateien editieren müssen
* keine Godot-Inspector-Interna lernen müssen

Godot ist:

```text
Rendering
Physics
Audio
Input
Runtime
Export
```

Unser Produkt ist:

```text
Platform
Studio
Project Model
Creator UX
AI
Publishing
Distribution
```

---

# 60. Play Modes

Im Studio:

```text
Play Experience
Play Current Scene
Pause
Stop
Restart
```

Zusätzlich:

```text
Test as Published
```

Dieser Modus soll möglichst exakt das Experience Package simulieren.

Damit erkennt man Fehler, die nur in der distributierten Version auftreten.

---

# 61. Local Platform Development Mode

Für die ersten Versionen muss noch kein großer Cloud-Backend-Service existieren.

Baue zunächst einen lokalen Platform Registry Service.

Beispiel:

```text
LocalExperienceRegistry
```

Er kann:

```text
register()
publish()
list()
search()
install()
update()
remove()
```

Dadurch kann der komplette Plattform-Loop lokal getestet werden:

```text
Creator A
↓
Publish
↓
Registry
↓
Discover
↓
Install
↓
Play
```

Erst danach Cloud-Infrastruktur ergänzen.

---

# 62. Backend-Abstraktion

Platform Services dürfen nicht fest an den lokalen Registry Service gekoppelt sein.

Interface beispielsweise:

```text
ExperienceRegistry
UserService
PublishingService
PackageStore
DiscoveryService
```

Implementierungen:

```text
LocalExperienceRegistry
RemoteExperienceRegistry
```

Damit lässt sich später ein echter Server anschließen.

---

# 63. Remote Platform später

Langfristig:

```text
CLIENT
   ↓
PLATFORM API
   ↓
AUTH SERVICE
EXPERIENCE REGISTRY
PACKAGE STORAGE
DISCOVERY
CREATOR SERVICE
ANALYTICS
MODERATION
```

Package Storage kann später beispielsweise objektbasierten Storage/CDN verwenden.

Noch nicht zu früh implementieren.

---

# 64. Accounts

Cloud-Plattform benötigt später Accounts.

Aber lokale Engine-Entwicklung darf nicht davon blockiert werden.

MVP:

```text
Local User
```

Später:

```text
Account
Profile
Creator Profile
Authentication
Sessions
```

Offline Studio soll möglichst weiterhin funktionieren.

---

# 65. Offline First für Creator

Ein Creator soll sein eigenes Projekt auch ohne aktive Plattformverbindung bearbeiten können.

Offline möglich:

* Studio
* WYSIWYG
* AI über lokale Provider
* Save
* Playtest
* Build
* Projektverwaltung

Online erforderlich:

* Remote Publish
* Discover
* Cloud Library
* Multiplayer
* Analytics
* Remote Assets

---

# 66. Publishing Permissions

Experience Visibility:

```text
PRIVATE
UNLISTED
PUBLIC
```

PRIVATE:

nur Creator.

UNLISTED:

nur über Experience ID/Link erreichbar.

PUBLIC:

Discover-fähig.

---

# 67. Moderation vorbereiten

Eine offene UGC-Plattform benötigt langfristig:

* Report Experience
* Report Creator
* Content Status
* Disable Release
* Takedown
* moderation metadata
* audit logs

Nicht vollständig im MVP implementieren.

Datenmodell aber so gestalten, dass Releases deaktiviert werden können, ohne komplette Experience-Daten zu zerstören.

---

# 68. Runtime Compatibility

Experience Manifest definiert:

```text
minimumRuntimeVersion
targetRuntimeVersion
```

Client prüft Kompatibilität.

Bei Runtime-Updates dürfen alte Experiences möglichst weiterlaufen.

Von Beginn an vermeiden, dass jedes Engine-Update alle veröffentlichten Games zerstört.

---

# 69. Build und Runtime Versioning

Trenne:

```text
Editor Version
Engine Model Version
Package Format Version
Runtime Version
Experience Version
```

Beispiel:

```text
clientVersion: 0.4.0
projectFormatVersion: 3
runtimeVersion: 0.3
packageFormatVersion: 2
experienceVersion: 1.7.0
```

Migrationspfade einplanen.

---

# 70. Android

Android bleibt First-Class Target.

Creator kann Experience für:

```text
Desktop
Android
Web später
```

markieren.

Unterstütze:

* Touch
* Multi Touch
* Portrait
* Landscape
* Safe Areas
* UI Scaling
* Mobile Preview
* Performance Profiles

Langfristig soll unterschieden werden zwischen:

```text
Experience läuft innerhalb unseres Android Clients

vs.

Standalone APK Export
```

Beides kann sinnvoll sein.

---

# 71. Standalone Export

Creator darf langfristig optional sein Game auch außerhalb der Plattform exportieren.

Beispiel:

```text
Publish to Platform
Export Windows
Export Android APK
Export Android AAB
Export Web
```

Damit bleibt das Produkt sowohl Plattform als auch Game Engine.

Platform Publishing ist jedoch der primäre Ecosystem-Workflow.

---

# 72. Experience Analytics später

Creator Hub kann später anzeigen:

```text
Plays
Unique Players
Average Session
Retention
Crash Rate
Version Distribution
Platform Distribution
```

Nicht MVP.

Events aber von Anfang an mit ExperienceId und VersionId strukturierbar machen.

---

# 73. Projektstruktur Creator

Beispiel:

```text
my-experience/

├── experience.json
├── game.project.json

├── scenes/
├── entities/
├── components/
├── prefabs/
├── scripts/
├── ui/
├── assets/
├── animations/
├── audio/
├── levels/

├── .ai/
│   ├── game_design/
│   ├── architecture/
│   ├── tasks/
│   ├── memory/
│   ├── reports/
│   ├── screenshots/
│   └── logs/

├── .runtime/
└── builds/
```

Runtime-Artefakte:

```text
.cache/runtime/
```

Publish-Artefakte:

```text
builds/packages/
```

---

# 74. Repository Struktur Plattform

Richtlinie:

```text
game-platform/

├── client/
│   ├── shell/
│   ├── home/
│   ├── discover/
│   ├── library/
│   ├── experience_page/
│   ├── creator_hub/
│   └── settings/

├── studio/
│   ├── editor/
│   ├── viewport/
│   ├── hierarchy/
│   ├── inspector/
│   ├── assets/
│   ├── animation/
│   ├── tilemap/
│   ├── ui_editor/
│   ├── console/
│   ├── kanban/
│   └── ai/

├── engine/
│   ├── project/
│   ├── scene/
│   ├── entities/
│   ├── components/
│   ├── behaviors/
│   ├── events/
│   ├── commands/
│   ├── serialization/
│   └── validation/

├── runtime/
│   ├── host/
│   ├── godot/
│   ├── sandbox/
│   └── platform_api/

├── platform/
│   ├── experiences/
│   ├── registry/
│   ├── publishing/
│   ├── packages/
│   ├── discovery/
│   ├── users/
│   └── storage/

├── ai/
│   ├── providers/
│   ├── orchestrator/
│   ├── agents/
│   ├── planner/
│   ├── tools/
│   └── memory/

├── tests/
├── templates/
├── examples/
└── docs/
```

Implementierender Agent darf verbessern.

Aber die Layer:

```text
CLIENT
STUDIO
ENGINE
RUNTIME
PLATFORM
AI
```

müssen konzeptionell klar bleiben.

---

# 75. Shared AI Memory

AI darf nicht vom Chatverlauf abhängig sein.

Beispiel:

```text
.ai/memory/
    decisions.json
    architecture.json
    conventions.md
    known_issues.json
    completed_tasks.json
```

Game-Entscheidungen persistieren.

---

# 76. Git Integration

Creator Projects:

* Init Repository
* Diff
* Checkpoint
* Commit
* Restore
* AI Change Diff

Große AI-Operation:

```text
Checkpoint
↓
AI Changes
↓
Validation
↓
Tests
↓
Accept / Rollback
```

---

# 77. Sicherheit bei AI

AI darf:

* Projekt Commands
* kontrollierte File Tools
* Build Tools
* Asset Tools

verwenden.

AI darf nicht ungefragt:

* außerhalb Projektordner schreiben
* Credentials lesen
* API Keys anzeigen
* Betriebssystemdateien verändern
* fremde Experiences verändern

Tool Permissions strikt definieren.

---

# 78. Performance

Vermeiden:

* komplettes Projekt bei jeder Änderung neu bauen
* Runtime permanent neu starten
* komplette Asset Registry neu scannen
* unnötige LLM Calls
* riesige globale States

Nutzen:

```text
incremental updates
dirty flags
events
caching
lazy loading
background import
incremental runtime sync
```

---

# 79. Keine Fake-Implementierungen

Strikt vermeiden:

* Discover Screen voller erfundener Fake-Games als vermeintlich echte Daten
* Publish Button ohne Pipeline
* Install Button ohne Installation
* AI Tasks mit Fake Progress
* Build Success ohne Build
* Fake Analytics
* Fake Multiplayer
* UI ohne Backend

Demo-Daten sind nur zulässig, wenn klar als Demo markiert.

---

# 80. MVP neu definieren

Der MVP ist jetzt nicht mehr nur:

> Sprite in Editor bewegen.

Er benötigt zwei Vertical Slices.

## Vertical Slice A – Creator

```text
CLIENT
↓
CREATE
↓
NEW EXPERIENCE
↓
STUDIO
↓
CREATE SCENE
↓
IMPORT SPRITE
↓
PLACE
↓
SAVE
↓
PLAYTEST
```

## Vertical Slice B – Platform

```text
STUDIO
↓
PUBLISH LOCAL
↓
CREATE EXPERIENCE PACKAGE
↓
REGISTER IN LOCAL REGISTRY
↓
RETURN TO CLIENT
↓
DISCOVER / LIBRARY
↓
OPEN GAME PAGE
↓
PLAY
↓
RUNTIME STARTS PUBLISHED PACKAGE
```

# Erst wenn beide Loops funktionieren, ist der echte Plattformkern vorhanden.

---

# 81. Version 0.1

Fokus:

```text
CLIENT SHELL
+
STUDIO
+
PROJECT MODEL
+
COMMANDS
+
GODOT RUNTIME
```

Definition of Done:

```text
Start Client
↓
Create Experience
↓
Studio
↓
Create Scene
↓
Import PNG
↓
Place Sprite
↓
Move / Scale
↓
Save
↓
Play
↓
Stop
↓
Reopen
```

---

# 82. Version 0.2

AI Copilot.

Zusätzlich:

```text
BYOK Provider Configuration
↓
AI Context
↓
Command API
```

Creator:

> Verschiebe das Objekt 200 Pixel nach rechts.

Resultat:

reale Editoränderung.

Danach:

> Mach daraus einen Gegner.

AI erzeugt Components/Behaviors.

---

# 83. Version 0.3

Lokale UGC Platform.

Zusätzlich:

```text
Experience Metadata
Experience Package
Local Registry
Publish
Discover
Library
Game Page
Install
Play Published Experience
```

Definition of Done:

Ein Creator erstellt ein Game und veröffentlicht es lokal.

Das Game erscheint anschließend im normalen Client wie eine installierbare/spielebare Experience.

---

# 84. Version 0.4

AI Game Factory.

Prompt:

> Create a small platformer with a player, three platforms, five coins and a goal.

System:

```text
DIRECTOR
↓
GDD
↓
ARCHITECT
↓
TASK GRAPH
↓
BUILD PROJECT
↓
PLAYTEST
↓
VALIDATE
↓
REPAIR
```

Ergebnis:

* spielbar
* editierbar
* speicherbar
* veröffentlichbar

---

# 85. Version 0.5

Remote Platform Prototype.

Ersetze:

```text
LocalExperienceRegistry
```

optional durch:

```text
RemoteExperienceRegistry
```

Implementiere minimal:

* Accounts
* Creator Identity
* Upload Package
* List Experiences
* Download Package
* Public/Private
* Search

Keine Recommendation Engine.

Keine Monetarisierung.

Keine komplexen sozialen Features.

---

# 86. Version 0.6+

Danach erst:

```text
Cloud Saves
Analytics
Ratings
Favorites
Creator Profiles
Asset Sharing
Remix
Marketplace
Multiplayer
Game Servers
Social
Moderation Automation
Monetization
```

---

# 87. Entwicklungsphasen Repository

## Phase 0 – Reconnaissance

Analysiere:

* Environment
* Godot Installation
* verfügbare SDKs
* Build Tools
* bestehende Repository-Struktur
* technische Risiken

Erstelle:

```text
docs/ARCHITECTURE.md
docs/PLATFORM_ARCHITECTURE.md
docs/SECURITY_MODEL.md
docs/ROADMAP.md
docs/DECISIONS.md
```

---

## Phase 1 – Client Shell

Baue reale Navigation:

```text
Home
Discover
Library
Create
Settings
```

Noch kein Cloud Backend erforderlich.

Definition of Done:

Client startet stabil und Navigation funktioniert real.

---

## Phase 2 – Experience Domain

Implementiere:

```text
Experience
ExperienceId
ExperienceMetadata
ExperienceVersion
ExperienceRepository
```

Definition of Done:

lokale Experiences können erstellt, gespeichert und wieder geladen werden.

---

## Phase 3 – Studio Shell

Baue:

* Viewport
* Hierarchy
* Inspector
* Assets
* Console
* Play Toolbar
* AI Panel

Definition of Done:

Experience kann aus Creator Hub im Studio geöffnet werden.

---

## Phase 4 – GameProject

Implementiere strukturiertes Game Project Model.

Definition of Done:

Save/Load exakt reproduzierbar.

---

## Phase 5 – Command System

Alle Editor-Mutationen über Commands.

Definition of Done:

Undo/Redo funktioniert.

---

## Phase 6 – WYSIWYG

Implementiere echten visuellen Editor.

Definition of Done:

kleine Szene vollständig visuell baubar.

---

## Phase 7 – Runtime Adapter

GameProject:

```text
→ Godot Runtime
→ Play
```

Definition of Done:

Studio-Szene läuft real.

---

## Phase 8 – BYOK AI

Implementiere:

* Provider Abstraction
* Credential Store
* Model Profiles
* AI Command Tools

Definition of Done:

AI verändert sichtbares Projekt.

---

## Phase 9 – Experience Packaging

Implementiere:

```text
Package Builder
Manifest
Validation
Hashing
Runtime Metadata
```

Definition of Done:

Experience Package reproduzierbar erzeugbar.

---

## Phase 10 – Local Registry

Implementiere:

```text
publish
list
search
install
update
launch
```

Definition of Done:

publiziertes Game erscheint im Client.

---

## Phase 11 – Platform Play

Game Page → Play → Runtime Host.

Definition of Done:

veröffentlichte Experience wird unabhängig vom Studio gestartet.

---

## Phase 12 – AI Game Factory

Director + Architect + Planner + Workers.

Definition of Done:

Prompt erzeugt kleines editierbares und publishbares Game.

---

## Phase 13 – Validation / Repair

Runtime Logs + Screenshots + Tests + Repair.

---

## Phase 14 – Android

Mobile Runtime + Preview + Export.

---

## Phase 15 – Remote Registry

Erst jetzt Online-Plattform beginnen.

---

# 88. Agentische Entwicklung des Repositorys

ORCHESTRATOR führt das Projekt.

Worker beispielsweise:

```text
PLATFORM-ARCHITECT
CLIENT-UI
STUDIO-UI
ENGINE-CORE
COMMAND-SYSTEM
RUNTIME
SECURITY
AI
PACKAGING
REGISTRY
TEST
BUILD
REVIEW
```

Tasks über Dependency Graph.

Unabhängige Tasks parallelisieren.

Keine unkoordinierten Dateiänderungen.

---

# 89. Entwicklungsregel

Nach jedem größeren Task:

```text
IMPLEMENT
↓
STATIC CHECK
↓
UNIT TEST
↓
INTEGRATION TEST
↓
RUN APPLICATION
↓
VERIFY REAL BEHAVIOR
↓
REVIEW
↓
COMMIT
```

Keine Feature-Waves aus 30 ungetesteten Subsystemen.

---

# 90. Architekturfragen

Vor jeder größeren Entscheidung prüfen:

### Frage 1

> Stärkt dies unsere eigene Plattform oder koppelt es uns unnötig an Godot?

### Frage 2

> Funktioniert dies sowohl für Human Editing als auch AI Editing?

### Frage 3

> Kann eine von einem fremden Creator erstellte Experience damit sicher ausgeführt werden?

### Frage 4

> Ist das Feature Teil des aktuellen Vertical Slice oder bauen wir zu früh Zukunftsinfrastruktur?

### Frage 5

> Bleibt eine AI-generierte Experience vollständig im Studio editierbar?

---

# 91. Wichtigste Architekturregeln

## Regel 1

# Experience ist das Plattformobjekt.

## Regel 2

# GameProject ist die Source of Truth des Editors.

## Regel 3

# Godot ist Runtime Backend, nicht öffentliche Produktarchitektur.

## Regel 4

# Mensch und AI verwenden dieselben Commands.

## Regel 5

# Veröffentlichte Games werden als kontrollierte Experience Packages ausgeführt.

## Regel 6

# Creator Credentials gelangen niemals in Experiences.

## Regel 7

# Studio und Player Runtime müssen getrennt sein.

## Regel 8

# Ein Game muss lokal funktionieren, bevor Cloud-Skalierung gebaut wird.

---

# 92. Entscheidender Product Loop

Der wichtigste Loop des gesamten Produkts lautet:

```text
DISCOVER
     ↓
   PLAY
     ↓
  CREATE
     ↓
  STUDIO
     ↓
AI / VISUAL / CODE
     ↓
 PLAYTEST
     ↓
 PUBLISH
     ↓
DISCOVER
     ↓
   PLAY
```

Dieser Kreislauf ist wichtiger als jedes einzelne Engine-Feature.

---

# 93. Das langfristige Zielbild

Ein neuer Nutzer installiert den Client.

Er sieht Games anderer Creator.

Er klickt:

```text
PLAY
```

und spielt.

Später klickt er:

```text
CREATE
```

und schreibt:

> Erstelle mir ein kleines 2D-Roguelite mit einem Fuchs als Spieler, drei Gegnertypen und kombinierbaren Zaubern.

Das Studio verwendet seinen konfigurierten BYOK-Provider.

AI erstellt:

```text
GDD
Scenes
Entities
Components
Behaviors
UI
Assets
Gameplay
Levels
```

Der Creator sieht alles im WYSIWYG Editor.

Er verändert per Drag & Drop einige Gegner.

Dann schreibt er:

> Die zweite Gegnerwelle ist zu schwer. Reduziere die Anzahl um 30 % und erhöhe dafür ihre HP leicht.

AI verändert das reale Projekt.

Creator drückt:

```text
PLAYTEST
```

Danach:

```text
PUBLISH
```

Die Plattform:

```text
VALIDATES
PACKAGES
VERSIONS
REGISTERS
DISTRIBUTES
```

und wenige Augenblicke später existiert:

```text
Wizard Fox Survivors
Created by Creator123

[ PLAY ]
```

als normale Experience innerhalb der Environment.

---

# 94. Endziel

Nicht:

# AI Game Generator

Nicht:

# Godot Wrapper

Nicht:

# WYSIWYG Editor mit Chatbot

Nicht:

# Game Launcher

Sondern die Kombination:

# GAME PLATFORM

*

# GAME CLIENT

*

# CREATOR STUDIO

*

# WYSIWYG ENGINE

*

# BYOK AI COPILOT

*

# AUTONOMOUS GAME FACTORY

*

# UGC PUBLISHING ECOSYSTEM

---

# 95. Der entscheidende Leitsatz

## Anyone can play.

## Anyone can create.

## Human and AI build the same project.

## Every project can become an Experience.

## Every Experience can become part of the platform.

---

# 96. Arbeitsauftrag an den implementierenden Agenten

Beginne ausdrücklich **nicht** mit Cloud, Multiplayer, Marketplace oder Social Features.

Beginne mit dem kleinsten realen End-to-End-System, das die Produktidee beweist:

```text
CLIENT
↓
CREATE EXPERIENCE
↓
STUDIO
↓
BUILD SMALL GAME
↓
PLAYTEST
↓
PUBLISH LOCAL
↓
EXPERIENCE PACKAGE
↓
LOCAL REGISTRY
↓
DISCOVER
↓
GAME PAGE
↓
PLAY PUBLISHED EXPERIENCE
```

Dieser Ablauf muss **real funktionieren**.

Danach:

```text
BYOK AI
↓
AI COPILOT
↓
AI GAME FACTORY
↓
REMOTE PLATFORM
```

Bei jeder Implementierung gilt:

> Lieber einen einzigen vollständigen Creator→Publish→Play-Loop als fünfzig halbfertige Plattformfeatures.

Das erste große technische Ziel ist deshalb nicht „eine Game Engine fertigstellen“.

Es lautet:

# Baue den ersten vollständigen, funktionsfähigen Mini-UGC-Platform-Loop, in dem ein Nutzer innerhalb desselben Clients eine Experience erstellen, bearbeiten, testen, veröffentlichen, wiederentdecken und anschließend als Spieler starten kann.
