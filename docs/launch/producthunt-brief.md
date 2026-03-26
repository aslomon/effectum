# Product Hunt Launch Brief — Effectum

> **Timing:** Nach Erreichen von 100+ GitHub Stars (Phase 2)  
> **Status:** Planung / Asset-Liste  
> **Erstellt:** 2026-03-26 von Lumi

---

## Was Product Hunt braucht

### Pflicht-Assets

| Asset | Spezifikation | Status |
|-------|--------------|--------|
| **Maker-Profil** Jason | PH-Account eingerichtet, Bio, Twitter verlinkt | ⏳ Jason |
| **Thumbnail** | 240×240 px, PNG, Logo oder Icon | ⏳ Erstellen |
| **Gallery Images** | Min. 3 Bilder, 1270×952 px, PNG/JPG | ⏳ Erstellen |
| **Tagline** | Max. 60 Zeichen | ✅ (unten) |
| **Description** | Max. 260 Zeichen | ✅ (unten) |
| **Demo GIF/Video** | Optional aber empfohlen, < 50 MB | ⏳ |

---

## Copy (fertig)

### Tagline (60 Zeichen max)
```
Autonomous dev framework for Claude Code
```
(41 Zeichen ✅)

### Alternative Taglines
```
Claude Code + structured specs + quality gates = ship overnight
```
(62 — zu lang)

```
Describe it. Spec it. Ship it. Claude Code does the rest.
```
(57 ✅)

### Description (260 Zeichen max)
```
Effectum is an open-source Claude Code framework. Write a PRD, run /ralph-loop, and let Claude iterate until build passes, tests hit 80%, and 8 quality gates are green. Conservative to Full Autonomy modes. 7 stack presets. MIT.
```
(233 Zeichen ✅)

### Topics (Product Hunt Kategorien)
- Developer Tools
- Open Source
- Artificial Intelligence
- Productivity

---

## Gallery Images — Was zeigen?

**Slide 1: Hero**
- Effectum Logo + Tagline
- Terminal-Screenshot: `npx @aslomon/effectum`
- Dark background

**Slide 2: The Ralph Loop**
- Diagram: PRD → /plan → /ralph-loop → Quality Gates → Done
- Zeigt den autonomen Zyklus

**Slide 3: Quality Gates**
- Liste der 8 Gates: Build, Types, Lint, Tests (80%+), OWASP, No debug logs, No `any`, Max 300 lines/file
- Prägnant, keine Prosa

**Slide 4: Stack Presets**
- 7 Stacks als Cards: Next.js+Supabase, FastAPI, Django, Go+Echo, Rust+Actix, Swift, Generic
- "Auto-detected from your project"

**Slide 5: AGENTS.md Support**
- Split-View: CLAUDE.md vs AGENTS.md
- "--output-format both" Erklärung
- "Works with GSD, BMAD, Effectum"

---

## Maker-Kommentar (erster Comment nach Launch)

> Hey PH! I'm Jason, building Effectum because I wanted Claude Code to reliably build features overnight without me babysitting it.
>
> The core insight: the problem isn't Claude's capability — it's the feedback loop. Without quality gates that run every iteration, "done" is subjective. With them, it's measurable.
>
> Effectum adds structured PRDs (so Claude knows exactly what to build), the Ralph Loop (so it iterates until completion promises are satisfied), and 8 automated quality gates (so done means done).
>
> Happy to answer questions about the architecture, the workflow, or why I chose to build this instead of using BMAD/GSD (short answer: they didn't have the execution layer I needed).
>
> Source: github.com/aslomon/effectum

---

## Launch-Tag Checkliste

- [ ] Jason PH-Maker-Profil eingerichtet
- [ ] Assets erstellt (Thumbnail + 3 Gallery Images)
- [ ] Product Hunt Submission vorbereitet (Draft gespeichert)
- [ ] Launch-Tag: 12:01 AM Pacific (= 9:01 Uhr Berlin)
- [ ] Maker-Kommentar direkt nach Launch posten
- [ ] In allen relevanten PH-Collections bewerben
- [ ] Cross-Post auf Twitter/LinkedIn ("We're live on PH!")

---

## Timing-Empfehlung

**Reihenfolge:**
1. HN Show HN (diese Woche)
2. Reddit (gleichzeitig oder Tag danach)
3. GitHub Stars aufbauen (Woche 1-2)
4. Product Hunt (wenn 100+ Stars → Glaubwürdigkeit)

**Nicht gleichzeitig launchen** — jede Plattform braucht volle Aufmerksamkeit.
