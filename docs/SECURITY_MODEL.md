# Sicherheitsmodell — Craftera

> Status: **Phase 0 – Reconnaissance** (Entwurf)
> Quelle: `docs/MASTER_PROMPT.md`

## 1. Grundprinzipien

1. **BYOK-Credentials gehören ausschließlich in den lokalen Credential Store.**
   - OS Credential Manager + verschlüsselte lokale Settings.
   - Project Files referenzieren nur `provider_profile_id`, niemals den Key selbst.
   - Keys werden **nie** in: veröffentlichte Games, Game Packages, Experience Metadata, Git, Project Files, oder an andere Spieler übertragen.

2. **Spieler benötigen keine AI-Keys.**
   - BYOK gehört zum Creation Workflow.
   - Veröffentlichte Games funktionieren ohne Creator-LLM.
   - Falls Experiences später AI zur Laufzeit nutzen: separate Runtime-AI-API mit Permissions, Quotas, Billing, Proxy, Abuse Protection — **nicht** mit Creator-BYOK vermischen.

3. **Sandbox für fremde Experiences (Default: DENY).**
   - Eine Experience erhält nie automatisch Zugriff auf: gesamtes Dateisystem, Credentials, AI-Keys, Client-Daten, andere Projekte, OS-Kommandos, beliebige Prozesse, Platform-Tokens, interne Platform-APIs.
   - Capability-/Permission-Modell, explizit erlaubt:
     ```
     filesystem.game_save
     network.http
     platform.profile.read
     platform.leaderboard
     platform.storage
     clipboard
     microphone
     camera
     ```

4. **Kein beliebiger Native Code in UGC-Packages.**
   - MVP: kontrolliertes GDScript, Engine Behaviors, deklarative Components, freigegebene Runtime-APIs.
   - Später: Sandbox-Scripting, WebAssembly, Capability-basierte Runtime.
   - **Keine ungeprüften DLLs/EXEs** in veröffentlichten Experiences.

## 2. AI-Sicherheit (Master Prompt §77)

**AI darf:**
- Projekt-Commands
- kontrollierte File-Tools
- Build-Tools
- Asset-Tools

**AI darf NICHT ungefragt:**
- außerhalb des Projektordners schreiben
- Credentials lesen
- API-Keys anzeigen
- Betriebssystemdateien verändern
- fremde Experiences verändern

Tool-Permissions strikt definieren.

## 3. Package-Integrität (Master Prompt §18)

Vor dem Start prüft der Client:
- Runtime kompatibel? (`minimumRuntimeVersion`, `targetRuntimeVersion`)
- Package vollständig?
- Hash korrekt? (`contentHash`)
- Assets vorhanden?
- benötigte Permissions zulässig?

## 4. Moderation (Master Prompt §67)

Datenmodell so gestalten, dass Releases deaktiviert werden können (Takedown, Disable Release), ohne komplette Experience-Daten zu zerstören. Audit-Logs vorsehen.

## 5. Credential Store (Master Prompt §11)

Bevorzugt:
```
OS Credential Manager
+
verschlüsselte lokale Settings
```

Project Files referenzieren nur `provider_profile_id`.
