# PRD: Intelligent Setup Recommender for Effectum

## Problem

Effectum entwickelt sich von einem einfachen Claude-Code-Installer zu einem vollständigen Konfigurator für autonome Entwicklungsumgebungen. Der aktuelle Stand ist dafür noch nicht ausreichend.

### Die eigentlichen Probleme

1. **Zu viele technische Entscheidungen zu früh.**
   Nutzer sollen heute implizit über Commands, Hooks, Agents, Guardrails, Notifications und Tooling entscheiden, obwohl sie eigentlich nur sagen wollen: _"Ich will eine Web-App bauen"_.

2. **Der richtige Setup-Zustand hängt nicht nur vom Stack ab, sondern vom Vorhaben.**
   Ein Next.js + Supabase CRM braucht andere Defaults als ein Next.js + Supabase Marketing-Site oder ein autonomes Agent-System. Der reine Stack reicht nicht als Konfigurationssignal.

3. **Nicht alles darf auswählbar sein.**
   Es gibt Foundation-Bausteine, die immer aktiv sein müssen: Safety, Logging, Context, Guardrails, Backup, Formatter. Diese dürfen nicht Teil des normalen Auswahlprozesses sein.

4. **Subagents sind Standard, Agent Teams sind optional.**
   Subagents gehören zum normalen Effectum-/Claude-Code-Workflow und sollten im empfohlenen Setup immer mitgedacht werden. Agent Teams sind ein separates, experimentelles Feature und dürfen nicht als Default-Konzept modelliert werden.

5. **Die Community-Perspektive fehlt noch in der UX.**
   Langfristig soll Effectum ein Community-System für Best-Practice-Konfigurationen, Skills, Hooks, Snippets und Spezialisierungen werden. Dafür braucht es eine Architektur, aber die Nutzeroberfläche muss trotzdem einfach bleiben.

6. **Die Sprachkonfiguration ist noch zu eng.**
   Der Konfigurator unterstützt aktuell nur sehr wenige Kommunikationssprachen. Für ein globales Tool muss die Sprache frei oder aus einer größeren Auswahl konfigurierbar sein.

## Goal

Baue einen **Intelligent Setup Recommender** für Effectum, der aus wenigen nutzerfreundlichen Eingaben automatisch ein empfohlenes Claude-Code-Setup berechnet.

Der Nutzer soll in natürlicher, einfacher Form angeben können:
- wo installiert wird
- wie das Projekt heißt
- was für eine Art von App gebaut wird
- welcher Stack genutzt wird
- wie kommuniziert werden soll
- wie autonom Claude arbeiten soll
- was grob gebaut werden soll

Darauf basierend berechnet Effectum:
- Foundation Hooks (immer aktiv)
- empfohlene Commands
- empfohlene Hooks
- empfohlene Skills
- empfohlene MCPs
- empfohlene Subagent-Spezialisierungen
- optionale Advanced Features

Die UX soll **Apple-like** sein:
- wenige Entscheidungen
- klare Sprache
- gute Defaults
- möglichst wenig technische Überforderung
- trotzdem mit tiefer manueller Kontrolle für Power User

## Core Product Principle

**User-facing UX:**
> "Describe what you want to build — Effectum configures Claude for it."

**System-facing architecture:**
> Foundation + Recommendation Engine + modular Skills/Commands/Hooks underneath.

## User Stories

- Als nicht-technischer Nutzer möchte ich nur App-Typ, Stack und eine kurze Beschreibung eingeben und dann ein gutes empfohlenes Setup übernehmen.
- Als Entwickler möchte ich zuerst ein empfohlenes Setup sehen und danach entscheiden, ob ich es übernehme, anpasse oder alles selbst auswähle.
- Als Nutzer eines bestimmten Stacks möchte ich automatisch die passenden Hooks, Formatter, Commands und Subagent-Spezialisierungen vorgeschlagen bekommen.
- Als Nutzer eines spezifischen Vorhabens (z. B. CRM, Dashboard, Mobile App, Agent-System) möchte ich Empfehlungen bekommen, die nicht nur stack-, sondern auch intent-basiert sind.
- Als Power User möchte ich nach dem empfohlenen Setup alle Details manuell anpassen können.
- Als internationaler Nutzer möchte ich meine bevorzugte Kommunikationssprache aus vielen Sprachen auswählen oder frei definieren können.
- Als fortgeschrittener Nutzer möchte ich Agent Teams nur dann aktivieren, wenn ich das bewusst als experimentelles Feature will.
- Als Community-Contributor möchte ich langfristig neue Skills und Konfigurationsbausteine einbringen können, ohne die einfache Standard-UX zu zerstören.

## Acceptance Criteria

### 1. Install Scope & Project Basics

- [ ] AC1: Der Konfigurator fragt zuerst nach dem Install Scope: `Global` oder `Local`
- [ ] AC2: Bei `Local` wird der vollständige Konfigurationsflow ausgeführt
- [ ] AC3: Bei `Global` wird nur die globale Basis installiert; projektspezifische Konfiguration läuft später über `init`
- [ ] AC4: Bei lokalem Setup wird der Projektname aus dem Verzeichnis erkannt und bestätigbar gemacht
- [ ] AC5: Der Konfigurator erkennt den Stack automatisch, wenn möglich, und bietet ihn als Default an

### 2. App-Type & Intent-based Setup

- [ ] AC6: Der Konfigurator fragt nach dem App-Typ mit mindestens diesen Optionen: `Web App`, `API / Backend`, `Mobile App`, `Desktop App`, `CLI Tool`, `Automation / Agent System`, `Data / ML Tool`, `Library / SDK`, `Other`
- [ ] AC7: Der Konfigurator fragt nach einer freien Kurzbeschreibung: "What do you want to build?"
- [ ] AC8: Die Recommendation Engine nutzt App-Typ + Stack + Kurzbeschreibung gemeinsam für Empfehlungen
- [ ] AC9: Zwei Projekte mit gleichem Stack, aber unterschiedlicher Beschreibung, können unterschiedliche empfohlene Skills/Hooks/Commands bekommen

### 3. Language & Communication

- [ ] AC10: Der Konfigurator bietet eine größere Sprachliste an, mindestens: English, German, French, Spanish, Italian, Portuguese, Dutch, Polish, Turkish, Arabic, Hindi, Chinese, Japanese, Korean, Russian, Custom
- [ ] AC11: `Custom` erlaubt eine freie Kommunikationsinstruktion
- [ ] AC12: Die Sprachauswahl beeinflusst die Kommunikationsinstruktion in `CLAUDE.md`
- [ ] AC13: Sprachauswahl beeinflusst optionale UI-/Notification-Texte, wo sinnvoll

### 4. Operating Style / Autonomy

- [ ] AC14: Der Konfigurator fragt nach einem Arbeitsstil bzw. Autonomy Level
- [ ] AC15: Der Autonomy Level beeinflusst Permission Mode, Hook-Auswahl und empfohlene Automatisierungstiefe
- [ ] AC16: `Conservative`, `Standard`, `Full Autonomy` bleiben als technische Modi erhalten, auch wenn die UX nutzerfreundlicher formuliert wird

### 5. Foundation (immer aktiv, nicht auswählbar)

- [ ] AC17: File Protection Hook ist immer installiert
- [ ] AC18: Destructive Command Blocker ist immer installiert
- [ ] AC19: Git Context Loader ist immer installiert
- [ ] AC20: Guardrails Injection ist immer installiert
- [ ] AC21: Post-Compaction Context ist immer installiert
- [ ] AC22: Error Logger ist immer installiert
- [ ] AC23: Transcript Backup ist immer installiert
- [ ] AC24: Ein stack-korrekter Auto-Formatter ist immer installiert
- [ ] AC25: Foundation-Bausteine sind nicht Teil der normalen User-Auswahl und können nicht versehentlich abgewählt werden

### 6. Recommendation Engine

- [ ] AC26: Der Konfigurator berechnet ein `Recommended Setup` aus Stack + App-Typ + Kurzbeschreibung + Language + Autonomy
- [ ] AC27: Das empfohlene Setup zeigt mindestens: empfohlene Commands, Hooks, Skills, MCPs, Subagent-Spezialisierungen
- [ ] AC28: Der Nutzer bekommt drei Optionen: `Use Recommended`, `Customize`, `Manual Selection`
- [ ] AC29: `Customize` startet von den Empfehlungen aus und erlaubt gezielte Änderungen
- [ ] AC30: `Manual Selection` erlaubt vollständige manuelle Auswahl aller optionalen Bausteine

### 7. Subagents vs Agent Teams

- [ ] AC31: Subagents werden als normaler Standard des Systems modelliert und nicht als optionales Spezialfeature
- [ ] AC32: Je nach Projektart werden passende Subagent-Spezialisierungen empfohlen
- [ ] AC33: Agent Teams werden klar als `experimental` und `advanced` markiert
- [ ] AC34: Agent Teams sind standardmäßig deaktiviert
- [ ] AC35: Agent Teams können optional aktiviert werden und setzen `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- [ ] AC36: Ohne explizite Aktivierung bleibt das System vollständig im Standard-Subagent-Modell

### 8. Skills, Commands, Hooks, MCPs

- [ ] AC37: Empfohlene Commands werden stack- und intent-basiert gewählt
- [ ] AC38: Empfohlene Hooks werden stack- und intent-basiert gewählt
- [ ] AC39: Empfohlene MCP Server werden stack- und intent-basiert gewählt
- [ ] AC40: Empfohlene Skills werden stack- und intent-basiert gewählt
- [ ] AC41: Bestimmte essentielle Skills können als Pflicht-Bausteine pro Stack markiert werden (z. B. Frontend-Design-Skill für bestimmte UI-Stacks)

### 9. Persistence & Reconfigure

- [ ] AC42: Alle Eingaben und berechneten Empfehlungen werden in `.effectum.json` gespeichert
- [ ] AC43: `reconfigure` kann das Setup reproduzierbar neu erzeugen
- [ ] AC44: Getaggte Blöcke in generierten Dateien schützen User-Edits außerhalb der Effectum-Blöcke

### 10. Future Extensibility

- [ ] AC45: Die Recommendation Engine arbeitet auf einer modularen Skill-/Hook-/Command-Architektur
- [ ] AC46: Zukünftige Community-Skills können in die Recommendation Engine eingebunden werden
- [ ] AC47: Zusätzliche Notification-Mechanismen (z. B. mobile push, Telegram, Slack) können später als optionale Bausteine ergänzt werden
- [ ] AC48: Neue App-Typen, neue Stacks und neue Regelsets können hinzugefügt werden, ohne die Grund-UX zu brechen

## Scope

### In Scope

- Install Scope UX
- Project basics
- App-Type Selection
- Intent Description
- größere Sprach-Auswahl
- Recommendation Engine v1 (regelbasiert)
- Foundation-Bausteine
- Recommended / Customize / Manual UX
- klare Trennung Subagents vs Agent Teams
- `.effectum.json` Erweiterung
- tagged block generation

### Out of Scope

- Vollständig LLM-basierte Intent-Klassifikation in v1
- Vollständige Community Registry in der ersten Implementierungsphase
- Marketplace-UI außerhalb des CLI
- Remote Notification Services in v1
- automatische Telemetrie- oder Ranking-Systeme für Skills in v1

## Data Model

### `.effectum.json`

```json
{
  "version": "0.4.0",
  "projectName": "my-project",
  "installScope": "local",
  "appType": "web-app",
  "stack": "nextjs-supabase",
  "description": "I want to build an internal CRM dashboard",
  "language": "english",
  "autonomyLevel": "standard",
  "recommended": {
    "commands": ["plan", "tdd", "verify", "code-review", "update-docs"],
    "hooks": ["auto-formatter", "commit-gate", "completion-verifier"],
    "skills": ["frontend-design", "security", "docs"],
    "mcps": ["context7", "playwright"],
    "subagents": ["frontend-developer", "backend-developer", "postgres-pro", "security-engineer", "test-automator"],
    "agentTeams": false
  },
  "mode": "recommended"
}
```

### Recommendation Inputs

- install scope
- project name
- app type
- stack
- package manager
- language
- autonomy level
- free-text description
- optional advanced toggles

### Recommendation Outputs

- foundation set (implicit)
- recommended hooks
- recommended commands
- recommended skills
- recommended MCPs
- recommended subagent specializations
- advanced experimental toggles

## Technical Design

## Architecture Principle

**UX simple, system modular.**

Die Nutzeroberfläche soll wie ein geführter Setup-Assistent funktionieren.
Darunter bleibt das System modular aufgebaut:
- foundation modules
- hook modules
- command modules
- skill modules
- specialization modules
- recommendation rules

## Installation Flow

### Step 1 — Install Scope
- Global
- Local

### Step 2 — Project Basics
- Project name
- Stack (auto-detect + confirm)
- Package manager (auto-detect + override)

### Step 3 — App Type
- Auswahl aus vordefinierten App-Kategorien

### Step 4 — Describe What You Want to Build
- Freitextfeld

### Step 5 — Communication
- Sprache auswählen
- optional custom language instruction

### Step 6 — Autonomy / Working Style
- Conservative / Standard / Full
- später optional freundlicher formuliert

### Step 7 — Recommended Setup Preview
Effectum zeigt:
- Foundation (fixed)
- Recommended Commands
- Recommended Hooks
- Recommended Skills
- Recommended MCPs
- Recommended Subagent Specializations
- Optional Advanced Experimental Features

### Step 8 — Decision
- Use Recommended
- Customize
- Manual Selection

### Step 9 — Install
Schreibt:
- `CLAUDE.md`
- `settings.json`
- `guardrails.md`
- `commands/`
- ggf. Spezialisierungen / Skills
- `.effectum.json`

## Recommendation Engine v1

Die erste Version ist **regelbasiert**, nicht LLM-first.

### Rule Inputs
- stack
- app type
- keywords from description
- autonomy level
- platform

### Example Tags
Beschreibung:
> "I want to build an internal CRM dashboard"

Erzeugte Tags:
- internal-tool
- dashboard
- crm
- auth-needed
- db-needed
- frontend-heavy
- multi-user

Diese Tags steuern:
- commands
- hooks
- skills
- subagent recommendations
- MCP recommendations

## Subagent Logic

Subagents sind **immer Standard**.

Die Recommendation Engine empfiehlt deshalb pro Projekttyp passende Spezialisierungen.

### Beispiele

#### Web App + Next.js + Supabase
- frontend-developer
- backend-developer
- postgres-pro
- security-engineer
- test-automator

#### Python API
- backend-developer
- debugger
- security-engineer
- test-automator
- api-designer

#### Swift App
- ui-designer
- typescript-pro (nicht relevant → nicht empfehlen)
- swift-spezifische Spezialisierungen sobald vorhanden

## Agent Teams

Agent Teams sind **nicht Teil des normalen Defaults**.

Sie erscheinen nur unter `Advanced / Experimental`.

Wenn aktiviert:
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- zusätzliche Commands / Team-Profile / Teammate-Hooks können aktiviert werden
- UX klar als experimentell markieren

## Foundation Modules

Immer aktiv:
- file protection
- destructive blocker
- git context loader
- guardrails injection
- post-compaction context
- error logger
- transcript backup
- stack-aware formatter

Zusätzlich können pro Stack Pflicht-Bausteine gesetzt werden.

## Language Design

Sprachen werden nicht auf 2-3 Optionen begrenzt.
Mindestens:
- English
- German
- French
- Spanish
- Italian
- Portuguese
- Dutch
- Polish
- Turkish
- Arabic
- Hindi
- Chinese
- Japanese
- Korean
- Russian
- Custom

## Quality Gates

- Der Setup-Flow funktioniert interaktiv vollständig von Scope bis Recommendation Preview
- Zwei Projekte mit gleichem Stack, aber unterschiedlicher Beschreibung, erzeugen unterschiedliche Empfehlungen
- Foundation ist immer aktiv und nicht deaktivierbar
- Subagents werden immer empfohlen, Agent Teams nie standardmäßig aktiviert
- `reconfigure` reproduziert das empfohlene Setup korrekt
- getaggte Blöcke beschädigen keine User-Edits außerhalb der Effectum-Sektionen
- Sprachkonfiguration funktioniert für alle angebotenen Sprachen
- Stack-spezifische Pflicht-Skills und Formatter werden korrekt gesetzt

## Rollout Recommendation

### Phase 1
- Recommendation Engine v1 (regelbasiert)
- App-Type + Description + Language + Recommended Preview
- Foundation sauber explizit machen
- Recommended / Customize / Manual UX

### Phase 2
- modulare Skill-/Hook-Architektur unter der Haube ausbauen
- bessere stack-/intent-rules
- optionale advanced toggles

### Phase 3
- Community Registry
- community skills
- external notification channels
- richer intent parsing

## Completion Promise

"Effectum can derive a clean recommended Claude setup from scope, stack, app type, language, autonomy, and project intent — with foundation always on, subagents as default, and agent teams clearly separated as optional experimental advanced mode"
