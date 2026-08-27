# Project 03 — Unified Web Evidence Production Manifest

Produced: 2026-08-27
Renderer: `render_unified.py` (deterministic Pillow, read-only source files)
Output directory: `C:\Users\Administrator\Desktop\作品集\Project03_Evidence_Production\Unified_Web`

Visual skin: **QingYan Studio native — Soft Glass Editorial Lab**
Tokens taken verbatim from `assets/css/v2.css` + `assets/css/case-study.css`:
`--c-page #F0F0F0`, `--c-ink #2D2D2D`, `--c-secondary #5E6470`, `--c-muted #8A9099`,
`--c-accent #5B7480`, `#A34A3F` (bad), `#4A7050` (good),
`--r-card-sm 12px`, `--shadow-1`.
Evidence cards mirror `.ev-col` (white-ish, subtle border, soft shadow).
**No dark IDE / terminal / yellow-highlight palette.**

---

## Asset Summary

| Asset | Status | Output Path | Source File(s) | Crop / Segments | Highlights (line: color) |
|---|---|---|---|---|---|
| E01 — Blueprint Review | READY FOR REVIEW | `E01_Blueprint_Review.png` | `青砚_AI_OS_架构审查报告.md` (WorkBuddy outputs) | L14–30 | 16 bad, 22 bad, 28/29/30 good |
| E02 — Blueprint → Runtime | READY FOR REVIEW | `E02_Blueprint_to_Runtime.png` | `策略迁移记录.md` (Codex dir) | Left L5–24; Right L54–62 | Left 14 bad, 23 good; Right 58–62 good |
| E03 — Directory Drift & Governance | READY FOR REVIEW | `E03_Directory_Drift_Governance.png` | `Project_Root_Migration_Log.md` + `PROJECT.md` | Left L11–17; Right L13–24 | Left 13/14 bad; Right 15 good |
| E04 — Task Brief Contract | READY FOR REVIEW | `E04_Task_Brief_Contract.png` | `00_V0.1_Task_Brief.md` | L1–20 (whole file) | 5/7/18/20 accent |
| E05 — Review Gate | READY FOR REVIEW | `E05_Review_Gate.png` | `PreExecution_Review.md` + `..._R2.md` | Left L10–18; Right L11–18 | Left 10 bad; Right 11 good |
| E06 — Bounded Execution | READY FOR REVIEW | `E06_Bounded_Execution.png` | `v0.2_execution_log.md` | Excerpt A L3–18; Excerpt B L103–107 | 6/7 bad; 107 accent |
| E07 — Execution Traceability | READY FOR REVIEW | `E07_Execution_Traceability.png` | `v0.2_execution_log.md` | Excerpt A L22–37; Excerpt B L97–101 | 24/32/37 accent; 101 bad |
| E08A — Final Gate (Hero) | READY FOR REVIEW | `E08A_Final_Gate_REVISE.png` | `WorkBuddy_v0.2_PostExecution_Review.md` | Excerpt A L1–18; Excerpt B L228 | 6/228 accent; 11/15 bad |
| E08B — Rewrite Evidence (Supporting) | READY FOR REVIEW | `E08B_Rewrite_Evidence.png` | `WorkBuddy_v0.2_PostExecution_Review.md` | L99–121 continuous | 109 bad; 119 bad |

Highlight colors: `bad` = `#A34A3F` soft band + red left bar; `good` = `#4A7050` soft band + green left bar;
`accent` = `--c-accent #5B7480` soft band + teal left bar.

---

## Claims Boundaries (already stated as legend inside each asset)

### E01 — Blueprint Review
- **Proves:** Blueprint was independently challenged as over-engineered (complexity far beyond a personal system's actual needs; "too advanced to land"); reviewer explicitly preserved "separation of execution and review".
- **Does NOT prove:** The review report itself does not prove the Runtime has been built, nor that "worth keeping" equals "already implemented".

### E02 — Blueprint → Runtime
- **Proves:** Blueprint→Runtime contraction actually happened; modules without supporting data stay in Blueprint; Agent Registry / Lifecycle / Auto Router / Dashboard / APS are explicitly deferred to Blueprint.
- **Does NOT prove:** That Runtime has produced a verified value result; "experimental minimal loop" refers to v0.1's positioning, not a validated conclusion.

### E03 — Directory Drift & Governance
- **Proves:** Directory Drift occurred in real execution; later governance formalized a single Project Root and explicit project-state entry rules.
- **Does NOT prove:** That an independent reviewer "wrongly PASSed" the wrong reality; PROJECT.md is the 2026-08-27 later governance state, not the original snapshot.

### E04 — Task Brief Contract
- **Proves:** Task Brief turns chat intent into a structured contract (Human Intent explicit; Gate chain = Codex Execution → WorkBuddy Review → PASS/REVISE → next Gate; unified Project Root + asset boundary explicitly stated).
- **Does NOT prove:** That the contract has been executed or reviewed; only a static evidence of the contract itself.

### E05 — Review Gate
- **Proves:** First Pre-Execution Review said REVISE (5 Must Fix unmet); R2 said PASS after the fix, allowing Codex to proceed.
- **Does NOT prove:** The REVISE→R2 PASS ordering is proved by timestamps (both files have identical mtime); the ordering is supported by content, filenames, and citation relationships.

### E06 — Bounded Execution
- **Proves:** Executor acted within the reviewed scope (Step 1–7) and explicitly did not execute Step 8, v0.2 final PASS, v0.3, ASR optimization, or Agent/RAG/UI; current state = READY FOR POST-EXECUTION REVIEW.
- **Does NOT prove:** An automatic permission system, a program-level sandbox, or that the executor was technically unable to exceed the scope.

### E07 — Execution Traceability
- **Proves:** Executed artifact is reviewable: Raw Transcript registered with SHA-256 (`8B14…52BB3`); executor model OpenAI Codex (GPT-5); external API not called; network retrieval not used; no off-course materials; first-output save timestamp 2026-08-23 10:27:52; anomaly honestly recorded.
- **Does NOT prove:** Full-link observability; JIT inference time was not split due to environment limits — no fabricated numbers.

### E08A / E08B — Final Gate
- **Proves (E08A):** A later gate independently (read-only) reviewed the executed result, found two substantive manual rewrites, and returned REVISE.
- **Proves (E08B):** The two substantive rewrites (修正 1, 修正 2) of the three manual fixes: the minimum-permission suggestion was replaced with "select full permission per prompt"; the LLM-invented step was replaced with the course's actual step.
- **Does NOT prove:** A final loop PASS, prompt reliability, or guaranteed future reviewer correctness; Minimum Loop VALIDATED is not declared.

---

## Production Self-Check (per asset)

| # | Check | E01 | E02 | E03 | E04 | E05 | E06 | E07 | E08A | E08B |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Belongs to QingYan Studio (light/glass) | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 2 | Reuses real tokens (page/card/border/accent) | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 3 | No dark IDE / yellow-highlight residue | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 4 | 3-second readable main claim | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 5 | Original text byte-for-byte | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 6 | Line numbers are real source line numbers | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 7 | Timestamps are real (source mtime) | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 8 | Non-contiguous sections explicitly marked | n/a | n/a | n/a | n/a | n/a | Y | Y | Y | n/a (continuous) |
| 9 | No claim beyond evidence (legend states limits) | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 10 | Drop-into Case Study (width, readability) | Y | Y | Y | Y | Y | Y | Y | Y | Y |

All highlights, line numbers, and timestamps verified by `render_unified.py`'s `verify_anchors()` which
prints the raw source line of every highlighted line.

---

## Recommended Page Hierarchy

### Hero Evidence
- **E08A** — Final Gate REVISE (1280px wide, largest visual weight)

### Primary Evidence
- **E03** — Directory Drift & Governance (two-panel, 1568px wide)
- **E06** — Bounded Execution (single panel, 1180px)
- **E05** — Review Gate REVISE → R2 PASS (two-panel, 1240px)

### Supporting Evidence
- **E01** — Blueprint Review (single, 1160px)
- **E02** — Blueprint → Runtime (two-panel, 1240px)
- **E04** — Task Brief Contract (single, 1120px)
- **E07** — Execution Traceability (single, 1180px)
- **E08B** — Rewrite Evidence (single, 1100px)

---

## Notes

- Tier1 (`../Tier1/`) is **untouched** as historical assets.
- Website code (`C:\Users\Administrator\Desktop\作品集\`) is **not modified**.
- No GitHub push / no Case Study copy modification.
- Source mtimes (read-only):
  - `青砚_AI_OS_架构审查报告.md` → 2026-08-21 12:25:24
  - `策略迁移记录.md` → 2026-08-21 12:47:34
  - `Project_Root_Migration_Log.md` → 2026-08-23 10:20:49
  - `PROJECT.md` → 2026-08-27 16:31:06
  - `00_V0.1_Task_Brief.md` → 2026-08-22 16:48:00
  - `WorkBuddy_v0.2_PreExecution_Review.md` / `_R2.md` → 2026-08-23 10:18:08 (identical, see E05 legend)
  - `v0.2_execution_log.md` → 2026-08-23 10:29:58
  - `WorkBuddy_v0.2_PostExecution_Review.md` → 2026-08-23 10:37:16