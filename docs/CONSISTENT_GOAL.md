# Consistent Goal — Craftera

> Kurzes Zielbild für wiederkehrende autonome Runs.
> Jeder Run arbeitet genau **einen** Arbeitspunkt aus dem Entwicklungsplan ab.

## Ziel

Baue Craftera schrittweise fertig, indem jeder Run einen einzelnen Arbeitspunkt aus
[`docs/DEVELOPMENT_PLAN.md`](DEVELOPMENT_PLAN.md) real implementiert, verifiziert und
als nachvollziehbaren Commit auf GitHub pusht.

## Ablauf pro Run

1. **Stand prüfen** — `git log --oneline -5` und `docs/DEVELOPMENT_PLAN.md` lesen.
   Ermittle den nächsten noch nicht erledigten Arbeitspunkt (AP-x.y).
2. **Einen Punkt bearbeiten** — genau den nächsten offenen AP implementieren.
   - Nur dieser eine Punkt. Kein Scope-Creep, keine halbfertigen Nachbar-Features.
   - Befolge die Arbeitsweise aus dem Plan: IMPLEMENT → STATIC CHECK → UNIT TEST →
     INTEGRATION TEST → RUN → VERIFY REAL BEHAVIOR.
3. **Debug-Prüfung** — den eigenen Run prüfen: läuft es real? Fehler fixen, bis der
   Punkt verifiziert ist.
4. **Commit** — als nachvollziehbarer Punkt committen und pushen:
   - Commit-Message: `AP-x.y: <Kurzname des Arbeitspunkts>`
   - z.B. `AP-2.1: ID-Generator mit stabilen typ-präfixierten IDs`
5. **Nächsten Punkt** — im nächsten Run mit Schritt 1 fortfahren.

## Regeln

- **Ein Punkt pro Run.** Nicht mehrere APs in einem Run abarbeiten.
- **Keine Fake-Implementierungen** (Master Prompt §79): kein Button ohne Backend,
  kein Status ohne echten Zustand, kein Build ohne Build.
- **Verifikation vor Commit:** Der Punkt gilt erst als erledigt, wenn er real
  funktioniert (Test, Lauf, oder manuelle Prüfung).
- **Nicht bearbeitbare Punkte überspringen und notieren:**
  - Wenn ein AP nicht umsetzbar ist (z.B. fehlende externe Abhängigkeit wie Godot,
    fehlender API-Key, fehlendes SDK), **überspringen** und in
  [`docs/SKIPPED_POINTS.md`](SKIPPED_POINTS.md) notieren:
    - AP-Nummer, Grund, Datum, ggf. was nötig wäre, um ihn zu bearbeiten.
  - Danach mit dem nächsten bearbeitbaren Punkt fortfahren.
- **Abhängigkeiten beachten:** Ein AP, dessen Vorgänger übersprungen wurde, darf nur
  bearbeitet werden, wenn er ohne den Vorgänger sinnvoll funktioniert. Sonst ebenfalls
  überspringen und notieren.
- **Kein Cloud/Multiplayer/Marketplace** vor Phase 15 (Master Prompt §96).

## Fortschritt

- Erledigte APs: in `docs/DEVELOPMENT_PLAN.md` als ✅ markieren (Status-Spalte ergänzen).
- Übersprungene APs: in `docs/SKIPPED_POINTS.md` sammeln.
- Der nächste offene AP ist immer der niedrigste AP-x.y, der weder erledigt noch übersprungen ist.

## Ende

Wenn alle bearbeitbaren APs erledigt (oder übersprungen) sind, ist das Ziel erreicht.
Dann einen Abschluss-Commit mit Zusammenfassung erstellen.
