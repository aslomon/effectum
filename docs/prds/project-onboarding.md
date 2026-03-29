# PRD: Project Onboarding — Reverse-Engineering bestehender Projekte

## Problem

Effectum funktioniert aktuell nur für neue Projekte. Die meisten Entwickler haben aber bereits laufende Projekte die sie mit Claude Code autonom weiterentwickeln wollen. Es gibt keinen Weg, ein bestehendes Projekt in das Effectum-System einzuführen.

Zusätzlich: Selbst wenn ein User die PRDs manuell schreiben würde, kann er die Komplexität eines bestehenden Projekts nicht vollständig überblicken — es fehlen immer Features, Tabellen, Endpoints oder Verbindungen.

## Goal

Ein `/effectum:onboard` Command der:
1. Ein bestehendes Projekt tiefgehend analysiert (6 parallele Agenten)
2. Sich selbst testet bis alles konsistent ist (Self-Test Loop)
3. Eine Konsistenz-Review durchführt (`/effectum:onboard:review`)
4. Erst dann dem User ein verifiziertes, sauberes Ergebnis präsentiert
5. PRDs pro Feature-Bereich generiert (nicht eine Riesen-PRD)
6. Nahtlos in den bestehenden PRD Workshop + Lifecycle übergeht

## Design Decisions

- Self-Tests vor User-Präsentation — User muss nicht die Komplexität prüfen
- PRDs pro Feature-Bereich — ein großes Projekt bekommt 5-10 PRDs, nicht eine
- Alle bestehenden Features = ✅ DONE — Protection Rules für neue Entwicklung
- Confidence Scoring — Feature wird nur erkannt wenn ≥2 Quellen es bestätigen
- Onboarding Review als separater Schritt — Konsistenz, Doppelungen, Best Practices

## Acceptance Criteria

### Phase 1: Parallele Analyse (6 Agenten)

- [ ] AC1: `/effectum:onboard` startet 6 spezialisierte Analyse-Subagenten parallel
- [ ] AC2: Stack-Analyst erkennt Framework, DB, Auth, Deploy aus Config-Dateien
- [ ] AC3: Architektur-Analyst erkennt Projektstruktur, Module, Patterns (MVC, Clean Architecture, Feature-Based)
- [ ] AC4: API-Analyst scannt alle Route-Dateien und erstellt Endpoint-Map mit HTTP-Methoden, Paths, Auth-Status
- [ ] AC5: Datenbank-Analyst parst Schema-Dateien (Prisma, Supabase Migrations, Django Models) und erstellt Data Model
- [ ] AC6: Frontend-Analyst scannt Components, Pages, extrahiert Feature-Map und Design-Tokens
- [ ] AC7: Test-Analyst erstellt Coverage-Map: was ist getestet, was nicht, welches Framework

### Phase 2: Zusammenführung + Feature-Extraktion

- [ ] AC8: Alle Agenten-Ergebnisse werden zu einer Feature-Liste zusammengeführt
- [ ] AC9: Jedes Feature bekommt einen Confidence Score basierend auf Anzahl bestätigender Quellen
- [ ] AC10: Features mit Confidence < 2 Quellen werden als "uncertain" markiert
- [ ] AC11: Dependency Graph zwischen Features wird erstellt
- [ ] AC12: Lücken werden identifiziert: Features ohne Tests, Routes ohne Auth, Tabellen ohne PRD

### Phase 3: Self-Test Loop (automatisch, kein User-Input)

- [ ] AC13: Test: Jede DB-Tabelle hat eine PRD-Referenz
- [ ] AC14: Test: Jeder API-Endpoint ist in einer PRD dokumentiert
- [ ] AC15: Test: Jede Page/Component ist im Feature-Tree
- [ ] AC16: Test: Jedes Feature im Network Map existiert im Code (kein Phantom)
- [ ] AC17: Test: Jede PRD hat mindestens 3 Acceptance Criteria
- [ ] AC18: Test: Dependencies sind bidirektional konsistent
- [ ] AC19: Test: Ordnerstruktur passt zur dokumentierten Architektur
- [ ] AC20: Wenn Tests NICHT grün → gezielt nachscannen → Tests wiederholen
- [ ] AC21: Loop endet erst wenn ALLE Self-Tests grün sind

### Phase 4: PRD-Generierung

- [ ] AC22: Eine PRD pro Feature-Bereich (nicht eine für alles)
- [ ] AC23: PRDs haben Frontmatter (id, version, status: implemented, onboarded: true)
- [ ] AC24: Alle ACs sind als ✅ DONE markiert (bestehende Features)
- [ ] AC25: PRDs enthalten Data Model, API Design, Scope — alles aus der Analyse
- [ ] AC26: Task Registry (tasks.md) mit allen Tasks als ✅ DONE
- [ ] AC27: Network Map (network-map.mmd) mit allen Features und Verbindungen

### Phase 5: Onboarding Review (`/effectum:onboard:review`)

- [ ] AC28: Separater Review-Schritt NACH Self-Tests, VOR User-Präsentation
- [ ] AC29: Konsistenz-Check: Sind PRDs untereinander konsistent? (gleiche Entitäten, gleiche Namenskonventionen)
- [ ] AC30: Doppelungs-Check: Gibt es Features die in mehreren PRDs beschrieben sind?
- [ ] AC31: Vereinfachungs-Check: Können PRDs zusammengeführt werden? (z.B. Auth + User Management → ein PRD)
- [ ] AC32: Best Practice Check: Haben PRDs klare Scope-Grenzen? Sind Out-of-Scope Sections sinnvoll?
- [ ] AC33: Naming Convention Check: Sind Feature-IDs, Tabellennamen, Endpoint-Paths konsistent?
- [ ] AC34: Coverage Check: Ist jeder Code-Bereich durch mindestens eine PRD abgedeckt?
- [ ] AC35: Review generiert Verbesserungsvorschläge die automatisch angewendet werden
- [ ] AC36: Nur wenn Review grün → weiter zu User-Präsentation

### Phase 6: User-Präsentation

- [ ] AC37: User bekommt eine Summary: "X Features erkannt, Y Tabellen, Z Endpoints, W PRDs generiert"
- [ ] AC38: User kann PRDs einzeln ansehen
- [ ] AC39: User kann korrigieren: "Feature X fehlt" oder "Das ist kein Feature, das ist ein Utility"
- [ ] AC40: Korrekturen triggern Nachanalyse + Self-Tests erneut
- [ ] AC41: Erst bei User-Bestätigung → Dateien schreiben

### Phase 7: Output

- [ ] AC42: CLAUDE.md wird korrekt für den erkannten Stack generiert
- [ ] AC43: .effectum.json wird geschrieben
- [ ] AC44: workshop/projects/{slug}/PROJECT.md
- [ ] AC45: workshop/projects/{slug}/prds/001-*.md bis N-*.md
- [ ] AC46: workshop/projects/{slug}/tasks.md (alle DONE)
- [ ] AC47: workshop/projects/{slug}/network-map.mmd
- [ ] AC48: DESIGN.md mit extrahierten Design-Tokens (wenn UI-Projekt)

### Integration

- [ ] AC49: Nach Onboarding kann `/effect:prd:new` für neue Features genutzt werden
- [ ] AC50: Nach Onboarding kann `/effect:prd:update` für Änderungen genutzt werden
- [ ] AC51: Bestehende Features haben Protection Rules — neue Entwicklung darf sie nicht brechen
- [ ] AC52: `/effectum:onboard:review` kann auch nachträglich aufgerufen werden (nicht nur beim Onboarding)

## Scope

### In Scope
- `/effectum:onboard` Command (system/commands/effectum:onboard.md)
- `/effectum:onboard:review` Command (system/commands/effectum:onboard/review.md)
- 6 Analyse-Agent Definitionen
- Self-Test Suite für Onboarding-Verifikation
- PRD-Generierung pro Feature-Bereich
- Task Registry + Network Map Generierung
- CLAUDE.md + DESIGN.md + .effectum.json Generierung
- Verifikations-Loop mit automatischer Nachanalyse

### Out of Scope
- Automatische Code-Migration oder Refactoring
- Performance-Analyse des bestehenden Codes
- Security-Audit (das macht `/security-audit`)
- Git-History-Analyse (wer hat was wann gemacht)
- Automatische Deployment-Konfiguration

## Technical Design

### Command Flow

```
/effectum:onboard [project-path]
    ↓
Phase 1: 6 Agenten parallel (Subagents via Task Tool)
    ├── Stack-Analyst
    ├── Architektur-Analyst
    ├── API-Analyst
    ├── Datenbank-Analyst
    ├── Frontend-Analyst (nur bei UI)
    └── Test-Analyst
    ↓
Phase 2: Zusammenführung
    → Feature-Liste mit Confidence Scores
    → Dependency Graph
    → Lücken-Report
    ↓
Phase 3: Self-Test Loop
    → 7 automatische Tests
    → Fehler? → gezielt nachscannen → Tests wiederholen
    → Alle grün? → weiter
    ↓
Phase 4: PRD-Generierung
    → PRD pro Feature-Bereich
    → tasks.md (alle DONE)
    → network-map.mmd
    ↓
Phase 5: /effectum:onboard:review
    → Konsistenz
    → Doppelungen
    → Vereinfachung
    → Best Practices
    → Naming Conventions
    → Coverage
    → Verbesserungen auto-anwenden
    ↓
Phase 6: User sieht Ergebnis
    → Summary
    → Kann korrigieren
    → Bestätigung
    ↓
Phase 7: Dateien schreiben
    → CLAUDE.md, PRDs, tasks.md, network-map.mmd, DESIGN.md, .effectum.json
```

### Self-Test Definitions

```javascript
const ONBOARD_SELF_TESTS = [
  {
    id: "db-coverage",
    name: "Every DB table has a PRD reference",
    check: "For each table in schema → find matching PRD with data model section",
    fix: "Add missing table to nearest matching PRD's data model"
  },
  {
    id: "api-coverage",
    name: "Every API endpoint is documented",
    check: "For each route file → find matching PRD with API design section",
    fix: "Add missing endpoint to nearest matching PRD's API section"
  },
  {
    id: "component-coverage",
    name: "Every page/component is in feature tree",
    check: "For each page in app/ → find matching feature in Feature-Liste",
    fix: "Create new feature entry or assign to existing feature"
  },
  {
    id: "no-phantom",
    name: "No phantom features (documented but not in code)",
    check: "For each feature in PRDs → verify code evidence exists",
    fix: "Remove phantom feature from PRD or mark as planned"
  },
  {
    id: "min-acs",
    name: "Every PRD has at least 3 ACs",
    check: "Count ACs per PRD",
    fix: "Generate additional ACs from code analysis"
  },
  {
    id: "dependency-consistency",
    name: "Dependencies are bidirectionally consistent",
    check: "If A depends on B, B should know about A",
    fix: "Add missing dependency references"
  },
  {
    id: "structure-match",
    name: "Documented architecture matches actual folder structure",
    check: "Compare PROJECT_STRUCTURE in PRD with actual directories",
    fix: "Update documentation to match reality"
  }
];
```

### Review Checks

```javascript
const ONBOARD_REVIEW_CHECKS = [
  {
    id: "consistency",
    name: "Cross-PRD consistency",
    check: "Same entities use same names across all PRDs"
  },
  {
    id: "duplicates",
    name: "No duplicate features across PRDs",
    check: "Feature X described in only one PRD"
  },
  {
    id: "simplification",
    name: "PRDs can be merged if too small",
    check: "PRDs with < 3 features should be merged with related PRD"
  },
  {
    id: "scope-clarity",
    name: "Each PRD has clear scope boundaries",
    check: "In Scope and Out of Scope are explicit and non-overlapping"
  },
  {
    id: "naming",
    name: "Naming conventions are consistent",
    check: "Feature IDs, table names, endpoint paths follow same pattern"
  },
  {
    id: "full-coverage",
    name: "Every code area is covered by at least one PRD",
    check: "No orphan directories or files without PRD assignment"
  }
];
```

## Quality Gates

- `/effectum:onboard` on a Next.js + Supabase project produces correct PRDs
- Self-Tests catch a deliberately missing table and fix it
- Self-Tests catch a phantom feature and remove it
- `/effectum:onboard:review` detects duplicate features across PRDs
- `/effectum:onboard:review` suggests merging small PRDs
- All generated PRDs have valid frontmatter
- Network Map is consistent with PRDs
- tasks.md has all features as DONE
- After onboarding, `/effect:prd:new` works for adding new features

## Completion Promise

"Project onboarding with 6 parallel analysis agents, self-test loop, consistency review, and verified output generation — producing PRDs, task registry, network map, and CLAUDE.md for any existing project"
