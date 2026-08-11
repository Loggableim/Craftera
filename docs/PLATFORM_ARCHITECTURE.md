# Plattform-Architektur — Craftera

> Status: **Phase 0 – Reconnaissance** (Entwurf)
> Quelle: `docs/MASTER_PROMPT.md`

## 1. Der entscheidende Product Loop (Master Prompt §92)

```
DISCOVER → PLAY → CREATE → STUDIO → AI/VISUAL/CODE → PLAYTEST → PUBLISH → DISCOVER → PLAY
```

Dieser Kreislauf ist wichtiger als jedes einzelne Engine-Feature.

## 2. MVP: Zwei Vertical Slices (Master Prompt §80)

### Vertical Slice A – Creator
```
CLIENT → CREATE → NEW EXPERIENCE → STUDIO → CREATE SCENE → IMPORT SPRITE → PLACE → SAVE → PLAYTEST
```

### Vertical Slice B – Platform
```
STUDIO → PUBLISH LOCAL → CREATE EXPERIENCE PACKAGE → REGISTER IN LOCAL REGISTRY
→ RETURN TO CLIENT → DISCOVER/LIBRARY → OPEN GAME PAGE → PLAY → RUNTIME STARTS PUBLISHED PACKAGE
```

**Erst wenn beide Loops funktionieren, ist der echte Plattformkern vorhanden.**

## 3. Experience-Modell (Master Prompt §13, §14, §15)

- **Experience** = Plattformobjekt, stabile `experienceId`, unabhängig von Name/Pfad.
- **Experience ≠ Release**: Eine Experience besitzt mehrere Versionen, eine ist `currentRelease`.
- **ExperienceVersion**: `versionId, experienceId, versionNumber, createdAt, creator, projectRevision, runtimeVersion, packageHash, status`.

Version-Status: `DRAFT, VALIDATING, READY, PUBLISHED, DEPRECATED, REJECTED, BROKEN`.

## 4. Publishing Pipeline (Master Prompt §16)

```
PROJECT → VALIDATE → DEPENDENCY CHECK → ASSET CHECK → SCRIPT CHECK
→ BUILD EXPERIENCE PACKAGE → RUNTIME COMPATIBILITY CHECK → PLAYTEST
→ PACKAGE HASH → SIGN → PUBLISH VERSION → REGISTER RELEASE → AVAILABLE IN DISCOVER
```

## 5. Experience Package (Master Prompt §17, §18)

```
experience-package/
├── manifest.json   → formatVersion, experienceId, versionId, runtimeVersion, entryScene, permissions, contentHash
├── game/           → game.project.json
├── assets/
├── runtime/
├── metadata/
└── integrity.json
```

Das Package enthält **nur Laufzeitdaten** — niemals AI-Memory, Agent-Logs, API-Keys, Git-History oder Editor-Cache.

## 6. Lokale Registry (Master Prompt §61, §62)

`LocalExperienceRegistry` simuliert den Plattform-Loop lokal:

```
register() publish() list() search() install() update() remove()
```

Abstrahiert über Interfaces (`ExperienceRegistry`, `UserService`, `PublishingService`, `PackageStore`, `DiscoveryService`), damit später ein `RemoteExperienceRegistry` angeschlossen werden kann.

## 7. Runtime Host (Master Prompt §24, §25, §26)

```
Platform Client → Experience Manager → Runtime Host → Experience Package → Godot Runtime
```

- **Sandbox**: Capability-/Permission-Modell, Default **DENY**.
- **Kein beliebiger Native Code**: MVP = kontrolliertes GDScript, Engine Behaviors, deklarative Components. Keine ungeprüften DLLs/EXEs.

## 8. Platform API (Master Prompt §55, §56)

Stabil und unabhängig vom Godot-Backend:

```
Platform.get_current_user()
Platform.save_data()
Platform.load_data()
Platform.unlock_achievement()
Platform.submit_score()
Platform.open_experience()
```

Save-Daten sind pro Experience isoliert: `userdata/<experience-id>/`.

## 9. Backend-Abstraktion (Master Prompt §62, §63)

Lokal zuerst, Remote später:

```
CLIENT → PLATFORM API → AUTH SERVICE / EXPERIENCE REGISTRY / PACKAGE STORAGE / DISCOVERY / CREATOR SERVICE / ANALYTICS / MODERATION
```

## 10. Sicherheit (Master Prompt §11, §12, §25, §77)

- BYOK-Keys nur im lokalen Credential Store (OS Credential Manager + verschlüsselte Settings).
- Project Files referenzieren nur `provider_profile_id`, niemals den Key.
- Spieler benötigen keine AI-Keys; veröffentlichte Games funktionieren ohne Creator-LLM.
- AI darf nur Projekt-Commands + kontrollierte Tools nutzen, nie Credentials lesen oder außerhalb des Projektordners schreiben.
