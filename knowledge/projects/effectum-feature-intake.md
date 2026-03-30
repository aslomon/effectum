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

### 2026-03-30 — Batch 4 (aus 07:30 Cron)

> **Externe Signale:** Keine neuen Claude Code Releases seit v2.1.86 (2026-03-27) — vollständig in Batch 2+3 abgedeckt.  
> **Interne Signale:** Effectum [Unreleased] (2026-03-28) enthält Namespace-Reorganisation mit 35+ umbenannten Commands. Drei Findings:

---

#### #014 — Migrations-Guide fehlt für v0.16 Namespace-Reorganisation

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-30 |
| **Signal** | v0.16 + Unreleased: 35+ Commands umbenannt (`/setup` → `effectum:setup`, `/tdd` → `effect:dev:tdd` etc.). Deprecated-Aliases bis v0.20 aktiv — aber kein `MIGRATION.md` oder Upgrade-Guide für bestehende Nutzer |
| **Quelle** | Repo (CHANGELOG.md Unreleased + system/commands/README.md Deprecation Table) |
| **Bereich** | Docs, Setup |
| **Entscheidung** | `spec` |
| **Priorität** | P1 |
| **Aktion** | `MIGRATION.md` in Repo-Root erstellen: Alte → neue Command-Namen, wann Aliases weg sind, warum der Wechsel passiert ist. Ggf. auch in README.md prominent verlinken |
| **Roadmap** | `v0.17` |
| **Confidence** | hoch |
| **Status** | ⏳ offen |

---

#### #015 — Deprecation-Timeline Inkonsistenz: v0.19 vs. v0.20

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-30 |
| **Signal** | CHANGELOG Unreleased erwähnt Removal-Notice für v0.19, README Deprecation-Table sagt v0.20 — Widerspruch in derselben Release |
| **Quelle** | Repo (CHANGELOG.md Unreleased vs. system/commands/README.md) |
| **Bereich** | Docs |
| **Entscheidung** | `docs-only` |
| **Priorität** | P2 |
| **Aktion** | Beide Dateien angleichen — CHANGELOG-Unreleased-Text auf v0.20 korrigieren (oder README auf v0.19 falls das die echte Entscheidung ist) |
| **Roadmap** | `none` |
| **Confidence** | hoch |
| **Status** | ⏳ offen |

---

#### #016 — `effort`-Feld in Command-Frontmatter nicht in Frontmatter-Tests abgedeckt

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-30 |
| **Signal** | Unreleased: `effort: "high"` als optionales Feld zu `/ralph-loop` und `/orchestrate` hinzugefügt — `test/frontmatter.test.js` (389 Tests) validiert nur `name`, `description`, `allowed-tools`. Unbekannte Felder könnten Warnings oder false positives erzeugen |
| **Quelle** | Repo (CHANGELOG.md Unreleased + test/frontmatter.test.js implied) |
| **Bereich** | Config, Docs |
| **Entscheidung** | `docs-only` |
| **Priorität** | P2 |
| **Aktion** | Frontmatter-Schema-Spec um optionale Felder (`effort`, ggf. `tags`) ergänzen; Frontmatter-Tests auf "erlaubte optionale Felder"-Whitelist prüfen |
| **Roadmap** | `none` |
| **Confidence** | mittel |
| **Status** | ⏳ offen |

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


---

### 2026-03-29 — Batch 3 (aus 07:30 Cron, Claude Code v2.1.85–v2.1.86)

---

#### #010 — MCP Multi-Server headersHelper Env Vars

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-29 |
| **Signal** | v2.1.85: Neue Env-Vars `CLAUDE_CODE_MCP_SERVER_NAME` + `CLAUDE_CODE_MCP_SERVER_URL` in MCP-`headersHelper`-Scripts — ein Helper kann jetzt mehrere MCP-Server bedienen |
| **Quelle** | Claude Code Changelog v2.1.85 |
| **Bereich** | MCP, Setup-Templates |
| **Entscheidung** | `spec` |
| **Priorität** | P2 |
| **Aktion** | MCP-Setup-Templates in `system/stacks/` auf Multi-Server-Auth-Pattern prüfen; Env-Vars dokumentieren und als Best-Practice in `/setup`-Doku aufnehmen |
| **Roadmap** | `v0.17` |
| **Confidence** | mittel |
| **Status** | ⏳ offen |

---

#### #011 — File-Access-Fix außerhalb Project Root (v2.1.86)

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-29 |
| **Signal** | v2.1.86 Bugfix: Write/Edit/Read funktioniert jetzt auf Dateien außerhalb des Project Root (z.B. `~/.claude/CLAUDE.md`) wenn conditional Skills/Rules konfiguriert sind — betrifft Effectum-Workflows die CLAUDE.md global beschreiben |
| **Quelle** | Claude Code Changelog v2.1.86 |
| **Bereich** | Setup, Hooks |
| **Entscheidung** | `docs-only` |
| **Priorität** | skip |
| **Aktion** | Minimum-Version-Hinweis in Effectum-README (`v2.1.86+` empfohlen) |
| **Roadmap** | `none` |
| **Confidence** | hoch |
| **Status** | ⏳ offen |

---

#### #012 — PreToolUse kann AskUserQuestion headless beantworten (v2.1.85)

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-29 |
| **Signal** | v2.1.85: `PreToolUse`-Hook kann `AskUserQuestion` durch Rückgabe von `updatedInput` + `permissionDecision: "allow"` headless beantworten — ermöglicht GUI-/CI-Integrationen ohne interaktive User-Approval-Prompts |
| **Quelle** | Claude Code Changelog v2.1.85 |
| **Bereich** | Hooks, Headless-Flows, `/ralph-loop`, CI-Integration |
| **Entscheidung** | `spec` |
| **Priorität** | P1 |
| **Aktion** | Spec: `/ralph-loop`-Headless-Mode mit PreToolUse-Pattern für vollautomatische CI-Runs ohne User-Approve-Unterbrechung; Hook-Template-Beispiel erstellen |
| **Roadmap** | `v0.19` |
| **Confidence** | mittel-hoch |
| **Status** | 🔄 Spec erstellt: `docs/prds/intake-012-headless-ci-mode.md` (2026-03-30) |

---

#### #013 — Prompt-Cache-Hit-Rate für Proxy-Anbieter verbessert (v2.1.86)

| Feld | Inhalt |
| ---- | ------ |
| **Datum** | 2026-03-29 |
| **Signal** | v2.1.86: Dynamischer Content aus Tool-Descriptions entfernt → bessere Cache-Hit-Rate für Bedrock/Vertex/Foundry-User |
| **Quelle** | Claude Code Changelog v2.1.86 |
| **Bereich** | keine direkte Effectum-Aktion |
| **Entscheidung** | `watchlist` |
| **Priorität** | P2 |
| **Aktion** | Im Enterprise-/Proxy-Kontext beachten: Effectum-Tool-Descriptions statisch halten, keine dynamischen Werte einbauen |
| **Roadmap** | `later` |
| **Confidence** | mittel |
| **Status** | ⏳ offen |

---
