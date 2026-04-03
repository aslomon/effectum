# Effectum Review Queue — 2026-04-03

_Erstellt: 2026-04-03 von Lumi_
_Zweck: Jason eine klare Merge-/Review-Reihenfolge geben statt 13 lose PRs._

---

## Snapshot

**Open PRs:** #6, #8–#20  
**Release-Blocker für v0.19:** #6, #9, #10, #11, #12  
**Post-v0.19 / Docs / Launch:** #13, #14, #16, #17, #18, #19, #20

---

## 1) Merge first — v0.19 critical path

### PR #6 — loop-worker preset
- **Why first:** explizit als P0 markiert; gehört in den v0.18/v0.19 Vorbereitungspfad
- **Risk:** mittel
- **Decision:** als erstes reviewen

### PR #9 — frontmatter schema spec
- **Why now:** starke Testbasis (+146), unabhängig, reduziert Command-Drift
- **Risk:** niedrig
- **Decision:** früher mergen, bevor weitere Docs/Command-Änderungen drauf aufbauen

### PR #10 — Headless CI Mode
- **Why now:** Kernfeature für v0.19
- **Risk:** mittel
- **Decision:** nach #9 reviewen

### PR #11 — permission-denied + compound command hooks
- **Why now:** erweitert Hook-System substanziell
- **Risk:** mittel bis hoch (mehr Shell-/Hook-Logik)
- **Decision:** nach #10 reviewen

### PR #12 — absolute file_path fix
- **Why now:** fixes Claude Code v2.1.88+ real behavior
- **Dependency:** logisch nach #10 (headless approver context)
- **Risk:** niedrig bis mittel
- **Decision:** direkt nach #11 oder parallel reviewen, aber nach #10 mergen

**Empfohlene Reihenfolge:**
`#6 → #9 → #10 → #11 → #12`

---

## 2) Ready after v0.19 — docs + compatibility layer

### PR #13 — hooks family / v0.17 docs bundle
- Wertvoll, aber nicht Release-blocking für v0.19
- Nach dem Kernpfad reviewen, damit Hooks-Doku auf stabilerer Basis landet

### PR #16 — showThinkingSummaries default
- Settings-default Änderung
- Sollte nach Kern-Release bewusst entschieden werden (Behavior change)

### PR #17 — intake #022 + #024 + Haiku3 deprecation
- Gute Doku-Aktualisierung, aber kein blocker

### PR #18 — exit-code-2 blocking docs
- Sehr nützlich, passt gut direkt nach Hook-Merges

### PR #19 — format-on-save / File content has changed
- Praktischer Fix, besonders relevant für Hook-heavy Workflows

### PR #20 — Claude Code v2.1.91 intake
- Wichtigster Punkt: `permissions.defaultMode`-Schema-Fix in CC dokumentiert
- Template-Check bereits erledigt: **kein Effectum-Fix nötig**
- Kann nach #18/#19 als Doku-Update gemerged werden

**Empfohlene Reihenfolge:**
`#13 → #18 → #19 → #20 → #17 → #16`

---

## 3) Separate lane — launch / housekeeping

### PR #14 — launch posts updated
- Kein Produkt-/Core-Release-Blocker
- Review zusammen mit HN/Reddit Posting-Fenster (Mo 06.04 oder Di 07.04)

### PR #8 — changelog backfill
- Housekeeping
- Kann irgendwann mit geringer Aufmerksamkeit gemerged werden

---

## 4) Jason-shortlist (wenn nur 30 Minuten Zeit)

Wenn Jason heute nur **eine kurze Review-Session** hat:

1. **#6**
2. **#9**
3. **#10**
4. **#11**
5. **#12**

Wenn danach noch 10 Minuten bleiben:
6. **#18**
7. **#19**
8. **#20**

---

## 5) Notes / gotchas

- In der lokalen Worktree liegen aktuell untracked hook files unter `.claude/hooks/`:
  - `compound-cmd-guard.sh`
  - `permission-denied-handler.sh`
  - `permission-denied.sh`
- Vor weiterem Branch-Hopping prüfen, ob diese Dateien absichtlich lokal bleiben oder in einen PR gehören.
- PR #20 ist **Info-/Docs-getrieben**: kein akuter Produktbug in Effectum selbst gefunden.

---

## Recommendation

**Ziel für heute:** v0.19 Review-Stau abbauen, nicht noch mehr PRs produzieren.  
**Bester Hebel:** #6/#9/#10/#11/#12 in genau dieser Reihenfolge.  
**Danach:** #18/#19/#20 als schnelle Docs-/Compatibility-Runde.
