# Effectum Feature Intake

> Laufender Backlog für externe Feature-Signale (Claude Code / Anthropic / Community).  
> Quelle: Claude Code Changelog Monitor (06:00 Cron) + Effectum Product Intake (07:30 Cron).  
> Letzte Aktualisierung: 2026-03-27

---

## Workflow

1. **06:00 Cron** liefert Fakten: was neu ist, was geändert wurde, was deprecated.
2. **07:30 Cron** bewertet: Relevanz für Effectum, Produktentscheidung, Roadmap-Slot.
3. Relevante Findings landen hier.
4. Nur `implement-now` oder `spec` mit Priorität P0/P1 werden zu TASKS.md-Einträgen.

**Felder:**

| Feld | Beschreibung |
| ---- | ------------ |
| Datum | Wann erkannt |
| Signal | Was wurde beobachtet |
| Quelle | Claude Code / Anthropic / GitHub / Community |
| Bereich | Welcher Teil von Effectum |
| Entscheidung | `docs-only` / `spec` / `implement-now` / `watchlist` / `skip` |
| Priorität | P0 / P1 / P2 / skip |
| Aktion | Konkrete Aktion oder Nächster Schritt |
| Roadmap | `v0.16` / `v0.17` / `later` / `none` |
| Confidence | hoch / mittel / niedrig |
| Status | ⏳ offen / 🔄 in Arbeit / ✅ erledigt / ❌ verworfen |

---

## Intake-Einträge

### 2026-03-27 — Batch 1 (aus 07:30 Cron + Jason-Session)

---

#### #001 — Conditional Hooks (`if` field)

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-27 |
| **Signal** | Claude Code Hooks unterstützen bedingtes `if` via Permission-Rule-Syntax |
| **Quelle** | Claude Code Changelog (06:00 Cron) |
| **Bereich** | Hooks, `/setup`, `/onboard`, Hook-Templates |
| **Entscheidung** | `implement-now` |
| **Priorität** | P1 |
| **Aktion** | Hook-Templates in `system/hooks/` + Doku um optionales `if`-Feld erweitern |
| **Roadmap** | `v0.16` |
| **Confidence** | hoch |
| **Status** | ⏳ offen |

---

#### #002 — TaskCreated Hook

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-27 |
| **Signal** | Neuer Hook-Lifecycle-Event `TaskCreated` in Claude Code |
| **Quelle** | Claude Code Changelog (06:00 Cron) |
| **Bereich** | `/orchestrate`, Agent Teams, Auto-Task-Tracking |
| **Entscheidung** | `spec` |
| **Priorität** | P1 |
| **Aktion** | Spec: wie wird `TaskCreated` in `/orchestrate` / Team-Architektur eingehängt? |
| **Roadmap** | `v0.17` |
| **Confidence** | mittel-hoch |
| **Status** | ⏳ offen |

---

#### #003 — Multi-glob Rules/Skills paths (YAML-Listen)

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-27 |
| **Signal** | YAML erlaubt mehrere Glob-Patterns als Liste für Rules/Skills-Pfade |
| **Quelle** | Claude Code Changelog (06:00 Cron) |
| **Bereich** | generierte CLAUDE.md-Templates, Skill-Templates, Agent-Context-Steuerung |
| **Entscheidung** | `implement-now` |
| **Priorität** | P1 |
| **Aktion** | CLAUDE.md-/Skill-Templates auf Multi-Glob-Support prüfen + aktualisieren |
| **Roadmap** | `v0.16` |
| **Confidence** | hoch |
| **Status** | ⏳ offen |

---

#### #004 — Timestamps in Loop-Transkripten

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-27 |
| **Signal** | Transkripte in `/loop`/Cron-Sessions enthalten Timestamps |
| **Quelle** | Claude Code Changelog (06:00 Cron) |
| **Bereich** | `/ralph-loop` Docs, Forensics/Handoff |
| **Entscheidung** | `docs-only` |
| **Priorität** | skip |
| **Aktion** | Kurze Erwähnung in `/ralph-loop`-Doku |
| **Roadmap** | `none` |
| **Confidence** | hoch |
| **Status** | ⏳ offen |

---

#### #005 — PreToolUse kann AskUserQuestion via `updatedInput` beantworten

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-27 |
| **Signal** | `PreToolUse`-Hook kann `updatedInput` setzen, um User-Approval headless zu beantworten |
| **Quelle** | Claude Code Changelog (06:00 Cron) |
| **Bereich** | Headless-Flows, `bypassPermissions`, GUI-Integration |
| **Entscheidung** | `watchlist` |
| **Priorität** | P2 |
| **Aktion** | Architekturhinweis in Hook-/Autonomy-Level-Spec festhalten |
| **Roadmap** | `later` |
| **Confidence** | mittel |
| **Status** | ⏳ offen |

---

## Offene P1 Implementierungen (v0.16-Kandidaten)

| # | Signal | Aktion | Status |
| - | ------ | ------ | ------ |
| 001 | Conditional Hooks `if` | Hook-Templates erweitern | ⏳ |
| 003 | Multi-glob Paths | CLAUDE.md-Templates prüfen + updaten | ⏳ |

## Offene Specs (v0.17-Kandidaten)

| # | Signal | Aktion | Status |
| - | ------ | ------ | ------ |
| 002 | TaskCreated Hook | Spec für `/orchestrate`-Integration | ⏳ |

---

*Dieses File wird automatisch durch den 07:30-Cron ergänzt. Einträge hier sind nicht automatisch in TASKS.md — nur P0/P1 `implement-now`/`spec` werden manuell promoted.*

---

### 2026-03-28 — Batch 2 (aus 07:30 Cron, Claude Code v2.1.86)

---

#### #006 — Skill-Descriptions auf 250 Zeichen gecappt

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-28 |
| **Signal** | Claude Code v2.1.86: `/skills`-Listing cappt Descriptions auf 250 Zeichen — längere werden abgeschnitten und erhöhen unnötig Context |
| **Quelle** | Claude Code Changelog v2.1.86 |
| **Bereich** | YAML-Frontmatter, generierte Command-Files, `/setup`, Frontmatter-Tests |
| **Entscheidung** | `implement-now` |
| **Priorität** | P1 |
| **Aktion** | `test/frontmatter.test.js` um ≤250-Zeichen-Assertion erweitern; alle 28 Command-Descriptions prüfen und ggf. kürzen |
| **Roadmap** | `v0.16` |
| **Confidence** | hoch |
| **Status** | ⏳ offen |

---

#### #007 — X-Claude-Code-Session-Id Header (API-Proxy-Support)

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-28 |
| **Signal** | Neuer HTTP-Header `X-Claude-Code-Session-Id` in API-Requests — Proxies können Requests session-übergreifend aggregieren |
| **Quelle** | Claude Code Changelog v2.1.86 |
| **Bereich** | `/orchestrate`, Agent Teams, Monitoring |
| **Entscheidung** | `watchlist` |
| **Priorität** | P2 |
| **Aktion** | Im Agent-Teams-Kontext bewerten: Könnten wir Session-IDs für Logging/Tracing nutzen? |
| **Roadmap** | `later` |
| **Confidence** | mittel |
| **Status** | ⏳ offen |

---

#### #008 — /skills-Listing alphabetisch sortiert

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-28 |
| **Signal** | `/skills`-Menü jetzt alphabetisch sortiert — UX-Verbesserung, keine Effectum-Aktion nötig |
| **Quelle** | Claude Code Changelog v2.1.86 |
| **Bereich** | Docs |
| **Entscheidung** | `docs-only` |
| **Priorität** | skip |
| **Aktion** | Ggf. kurze Erwähnung in Skill-Naming-Conventions-Doku |
| **Roadmap** | `none` |
| **Confidence** | hoch |
| **Status** | ⏳ offen |

---

#### #009 — Read-Tool: Kompaktes Zeilenformat + Deduplizierung

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-28 |
| **Signal** | Read-Tool nutzt kompaktes Zeilennummernformat und dedupliziert unveränderte Re-Reads → passiv weniger Token-Verbrauch in allen Effectum-Workflows |
| **Quelle** | Claude Code Changelog v2.1.86 |
| **Bereich** | alle Workflows passiv |
| **Entscheidung** | `skip` |
| **Priorität** | skip |
| **Aktion** | keine |
| **Roadmap** | `none` |
| **Confidence** | hoch |
| **Status** | ✅ kein Handlungsbedarf |

---

