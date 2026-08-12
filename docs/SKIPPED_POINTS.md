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
| AP-7.1 | Godot ist nicht installiert und nicht im PATH (weder `godot` noch `godot4`; keine Scoop/Chocolatey/winget-Installation, keine Datei in typischen Pfaden). | 2026-08-12 | Godot 4.x installieren und in den PATH aufnehmen (`godot --version` muss eine Version liefern). Danach AP-7.1 sowie die von Godot abhängigen APs der Phase 7 (AP-7.3 bis AP-7.11) bearbeiten. |
| AP-7.3 … AP-7.11 | Alle GodotAdapter-/Compiler-/Bridge-/Builder-APs der Phase 7 benötigen eine installierte Godot-Runtime zur realen Verifikation ("Godot öffnet/lädt/zeigt/startet"). Ohne Godot (AP-7.1 übersprungen) ist keine reale Verifikation möglich. | 2026-08-12 | Godot 4.x installieren und in den PATH aufnehmen. Danach AP-7.3 bis AP-7.11 bearbeiten. |
| AP-8.2 … AP-8.6 | Die Provider-APs der Phase 8 benötigen eine externe Abhängigkeit zur realen Verifikation: API-Key (OpenAI/Anthropic/OpenRouter/OpenAI-kompatibel) bzw. einen laufenden lokalen Ollama-Server. Keine Keys gesetzt, kein Ollama-Server erreichbar (localhost:11434). | 2026-08-12 | API-Key in der Umgebung setzen (OPENAI_API_KEY/ANTHROPIC_API_KEY/OPENROUTER_API_KEY) bzw. lokalen Ollama-Server starten. Danach AP-8.2 bis AP-8.6 bearbeiten. |
