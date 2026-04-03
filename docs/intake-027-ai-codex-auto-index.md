# Feature Intake: ai-codex Auto-Index Integration

_Intake ID: #027_
_Erfasst: 2026-04-03 von Lumi (Heartbeat 14:42)_
_Quelle: https://www.npmjs.com/package/ai-codex (v1.0.1, released ~02.04.2026)_

---

## Was ist ai-codex?

`ai-codex` ist ein neues npm-Tool (v1.0.1, MIT, ~48 Stars):
- Generiert einen kompakten Codebase-Index für AI-Assistenten
- Verspricht: **50k+ Token-Einsparung** pro Claude Code Session
- Läuft einmalig, schreibt eine `AI_INDEX.md` oder ähnliche Datei
- `npx ai-codex` — zero config, analysiert das Repo

## Relevanz für Effectum

### Problem (bekannt)
Effectum's `/context:init` führt ein 7-Fragen-Interview und befüllt `CLAUDE.md`. Das dauert ~5 Minuten und erfordert Nutzer-Input.

Ein strukturierter Codebase-Index könnte:
1. `/context:init` mit weniger Nutzer-Input starten
2. Bei `/map-codebase` als Basis dienen (statt 4 parallel agents alle blind discovern)
3. Als Pre-Flight für den Ralph Loop dienen (Context Budget Monitor)

### Opportunity-Analyse

| Ansatz | Aufwand | Vorteil |
|--------|---------|---------|
| A) `effectum install` ruft `npx ai-codex` als optionalen Schritt auf | Niedrig (1-2h) | Sofortige 50k-Token-Einsparung für alle Nutzer |
| B) Eigener Mini-Indexer in Effectum (kein externen Dep) | Hoch (2+ Tage) | Vollständige Kontrolle, besser tailored |
| C) Ai-codex als optionales `/ai-index` Command anbieten | Mittel (3-4h) | Non-breaking, opt-in, einfach |

**Empfehlung: Option A + C kombiniert**
- `effectum install` → optional "Soll ich einen Codebase-Index generieren? (npx ai-codex)" 
- `/effectum:ai-index` als Command: läuft `npx ai-codex`, erklärt Output
- Non-breaking (wer's nicht will, überspringt)

---

## Technische Skizze

### Option A — Install-Step

In `bin/effectum-install.js` (oder vergleichbarer Installer-Logik):

```js
// Nach context:init, vor erstem PRD
const { execSync } = require('child_process');

async function offerAiCodex(projectDir) {
  const answer = await prompt(
    '→ Soll ich einen Codebase-Index generieren? (spart 50k Tokens/Session) [Y/n] '
  );
  if (answer.toLowerCase() !== 'n') {
    console.log('Running npx ai-codex...');
    execSync('npx ai-codex', { cwd: projectDir, stdio: 'inherit' });
    console.log('✓ AI_INDEX.md generated — Claude Code liest sie automatisch');
  }
}
```

### Option C — `/effectum:ai-index` Command

```markdown
---
name: effectum:ai-index
description: Generate a compact codebase index to save 50k+ tokens per Claude Code session
allowed-tools: [Bash, Read, Write]
---

Run `npx ai-codex` in the project root to generate a compact codebase index.
This file will be auto-loaded by Claude Code, saving 50k+ tokens per session.

Steps:
1. Run: `npx ai-codex`
2. Verify the output file was created (usually AI_INDEX.md or similar)
3. Add it to CLAUDE.md as a reference: "See AI_INDEX.md for codebase structure"
4. Commit the file to git
```

---

## Risiken

- **Externe Dependency:** `ai-codex` ist neu (1.0.1, 2 Tage alt). Könnte breaking changes haben oder maintenance-abandoniert werden.
- **Mitigation:** `npx` statt lokales Install → immer latest, kein lock-in
- **Output-Qualität unbekannt:** Muss getestet werden ob der Index gut genug für Effectum-Workflows ist

---

## Empfohlene Aktionen

### Jetzt (heute, 30 min)
1. `npx ai-codex` auf einem Effectum-Testprojekt ausführen → Output evaluieren
2. Prüfen ob Output mit Effectum's `/map-codebase` kompatibel ist

### Wenn Output gut: PR #23
3. `/effectum:ai-index` Command schreiben (Option C, simpler Start)
4. Install-Step optional erweitern (Option A)

### Wenn Output schwach:
5. Idee parken — Effectum's eigener `/map-codebase` bleibt Referenz

---

## Evaluation-Ergebnis (03.04.2026)

### Test 1: Einfaches TS-Projekt
- Output: 6 Zeilen `lib.md` mit fn-Index ✅
- Macht genau was es verspricht für Standard-Apps

### Test 2: Effectum selbst
- Output: **0 Zeilen** — alle Kategorien geskippt ❌
- Ursache: Effectum ist CLI + Markdown-heavy, kein typischer Framework-Stack
- ai-codex erkennt: keine `routes` (kein Next.js/Express), keine `components` (kein React), keine `schema` (kein Prisma/Drizzle), keine `lib.md` (keine exportierten TS-Funktionen)

### Fazit: **PARKEN**
ai-codex ist ein gutes Tool — aber für die falsche Zielgruppe von Effectum-Nutzern.

Effectum-Nutzer bauen typisch Next.js/Supabase Apps → dort würde ai-codex gut funktionieren.  
Aber Effectum selbst profitiert nicht, und der `/onboard`-Step wäre verwirrend wenn 0 Output kommt.

**Bessere Idee (für later):** In der Effectum-Doku als "nützliches Companion-Tool für App-Projekte" erwähnen — nicht als Effectum-Feature.

## Status
- [x] ai-codex Output-Qualität evaluiert
- [x] Entscheidung: **PARKEN** — falsche Zielgruppe für Effectum-intern
- [ ] Optional: In README als empfohlenes Companion-Tool erwähnen
