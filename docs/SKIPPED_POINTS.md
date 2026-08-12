# Übersprungene Arbeitspunkte — Craftera

> Hier werden Arbeitspunkte aus `docs/DEVELOPMENT_PLAN.md` notiert, die nicht bearbeitbar
> waren (fehlende externe Abhängigkeit, fehlender Key, fehlendes SDK, o.ä.).
> Siehe `docs/CONSISTENT_GOAL.md` für den Ablauf.

## Format

| AP | Grund | Datum | Nötig für Bearbeitung |
|----|-------|-------|------------------------|
| — | — | — | — |

## Einträge

| AP | Grund | Datum | Nötig für Bearbeitung |
|----|-------|-------|------------------------|
| AP-7.9 … AP-7.11 | Die Play-/Builder-APs der Phase 7 (außer AP-7.3 bis AP-7.8, die erledigt sind) benötigen eine installierte Godot-Runtime zur realen Verifikation ("Szene läuft real", "Buttons wirken", "Package läuft"). Ohne Godot (AP-7.1 übersprungen) ist keine reale Verifikation möglich. | 2026-08-12 | Godot 4.x installieren und in den PATH aufnehmen. Danach AP-7.9 bis AP-7.11 bearbeiten. |
| AP-8.2 … AP-8.6 | Die Provider-APs der Phase 8 benötigen eine externe Abhängigkeit zur realen Verifikation: API-Key (OpenAI/Anthropic/OpenRouter/OpenAI-kompatibel) bzw. einen laufenden lokalen Ollama-Server. Keine Keys gesetzt, kein Ollama-Server erreichbar (localhost:11434). | 2026-08-12 | API-Key in der Umgebung setzen (OPENAI_API_KEY/ANTHROPIC_API_KEY/OPENROUTER_API_KEY) bzw. lokalen Ollama-Server starten. Danach AP-8.2 bis AP-8.6 bearbeiten. |
| AP-10.8 | `launch(experienceId)` startet die installierte Experience über die Runtime. Die Runtime ist Godot, das nicht installiert ist (AP-7.1 übersprungen). "Runtime startet" ist ohne Godot nicht real verifizierbar. | 2026-08-12 | Godot 4.x installieren und in den PATH aufnehmen. Danach AP-10.8 bearbeiten. |
| AP-11.7 … AP-11.9 | Die Play-/Viewport-APs der Phase 11 benötigen die Runtime zum realen Rendern/Spielen ("Game läuft im Client", "Play startet", "Play"). Ohne Godot (AP-7.1 übersprungen) ist kein Game im Client spielbar. | 2026-08-12 | Godot 4.x installieren und in den PATH aufnehmen. Danach AP-11.7 bis AP-11.9 bearbeiten. |
| AP-12.2 … AP-12.4 | Game Director (Prompt → GDD), Architect (GDD → Architektur), Planner (Architektur → Task Graph) benötigen einen realen AI-Provider zur Verifikation ("Director erzeugt GDD", "Architektur erzeugt", "Task Graph erzeugt"). Kein konkreter AI-Provider verfügbar (AP-8.2 bis AP-8.6 übersprungen); die vorhandenen OLLAMA_FREE_KEY_*-Variablen sind keine nutzbaren Keys (Auth-Fehler gegen Cloudflare Workers AI, nirgends im Code referenziert). | 2026-08-12 | Einen funktionierenden AI-Provider einrichten (API-Key in OPENAI_API_KEY/ANTHROPIC_API_KEY/OPENROUTER_API_KEY setzen oder lokalen Ollama-Server starten) und die Provider-Implementierung (AP-8.2 bis AP-8.6) abschließen. Danach AP-12.2 bis AP-12.4 bearbeiten. |
| AP-12.7 | Worker-Agents (Gameplay, Scene, UI, Asset, Code, Test) sind AI-Agenten, die Tasks wie "Create Player Controller" real ausführen (Master Prompt §44). Ohne AI-Provider (AP-8.2 bis AP-8.6 übersprungen) können Worker Tasks nicht real ausführen; ein deterministischer Worker ohne AI wäre eine Fake-Implementierung. | 2026-08-12 | Einen funktionierenden AI-Provider einrichten und die Provider-Implementierung abschließen. Danach AP-12.7 bearbeiten. |
| AP-12.10 … AP-12.11 | AI Game Factory-Flow (Prompt → editierbares Game) und "Ergebnis im Studio öffnen" benötigen einen realen AI-Provider, der aus einem Prompt ein Game erzeugt (Master Prompt §42–§47). Ohne AI-Provider (AP-8.2 bis AP-8.6 übersprungen) kann kein Game erzeugt werden; AP-12.11 hängt direkt von AP-12.10 ab. | 2026-08-12 | Einen funktionierenden AI-Provider einrichten und die Provider-Implementierung abschließen. Danach AP-12.10 und AP-12.11 bearbeiten. |
| AP-13.1 … AP-13.6 | Die Phase-13-APs (Runtime-Log-Erfassung, Screenshot, Playtest-Skripte, Fehler-Erkennung, Repair-Agent, Validation-Pipeline) benötigen eine laufende Runtime (Godot, AP-7.1 übersprungen) für Logs/Screenshots/Playtests sowie einen AI-Provider (AP-8.2 bis AP-8.6 übersprungen) für den Repair-Agent. Ohne diese Abhängigkeiten ist keine reale Verifikation möglich. | 2026-08-12 | Godot 4.x installieren und einen funktionierenden AI-Provider einrichten. Danach AP-13.1 bis AP-13.6 bearbeiten. |
| AP-14.1 … AP-14.8 | AP-14.1 (Android-SDK/Toolchain prüfen/installieren) ist nicht erfüllbar: `flutter doctor` meldet "Unable to locate Android SDK" und Android Studio ist nicht installiert — das Android SDK fehlt. Die Folge-APs (Touch-Input, Orientierung, UI-Scaling, Performance, Experience auf Android, Export) benötigen zusätzlich die Runtime (Godot, AP-7.1 übersprungen) zum realen Testen auf Gerät. | 2026-08-12 | Android SDK/Android Studio installieren und Godot 4.x einrichten. Danach AP-14.1 bis AP-14.8 bearbeiten. |
