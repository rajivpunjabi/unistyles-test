# Discussion summary: performance measurement

A brief narrative of how the unistyles v2-vs-v3 performance measurement came
together, for anyone picking this up later. For the runbook see
[`performance-report.md`](./performance-report.md); for the gotchas see
[`observations.md`](./observations.md).

## Goal

Measure and compare `react-native-unistyles` **v2** (branch `main`) against **v3**
(branch `v3-unistyles`) on Android, to quantify v3's headline claim: style updates
flow through the C++ ShadowTree, so a theme switch causes ~0 JS re-renders — where
v2 re-renders every `useStyles` consumer in JS.

## How we got here

1. **Harness.** A perf app with a `testID`-driven Static grid (`INSTANCE_COUNT`
   copies of each style category) and a Nested tree screen, plus a non-reactive
   metrics store and an isolated dashboard. Identical components/`testID`s on both
   branches so only the library version differs.

2. **Automation.** `scripts/build-apk.sh` (`yarn build:apk`) produces a release APK
   per branch into `/outputs`. `scripts/measure.sh` (`yarn measure a.apk b.apk`)
   installs each, runs `flashlight test` driving a Maestro flow for 10 iterations,
   then summarizes and opens a comparison report.

3. **Maestro flow.** `.maestro/toggle-theme.yaml` toggles the theme 10× on Static
   and 10× on Nested. We iterated on pacing (200 → 500 → 300 ms) and, crucially,
   switched from a flow-level `repeat` to `tapOn { repeat, delay }` after
   discovering each tap took ~6 s — Maestro was re-locating the element (a full
   view-hierarchy dump) before every tap. Companion flows `fast-toggle.yaml`
   (50 ms) and `toggle-theme-repeat-try.yaml` (the slow old approach, kept for
   contrast) were added.

4. **Getting Flashlight to run.** Three real blockers, in order:
   - **16 KB page-size emulator** → Flashlight's prebuilt profiler segfaulted
     (`status: 139`). Switched to a 4 KB image.
   - **Fresh emulator** → Maestro's on-device driver wasn't installed → gRPC
     `UNAVAILABLE`. Fixed by warming the driver with one standalone flow run.
   - **Emulator went `device offline`** under render + profiler load → a cold boot
     (`-no-snapshot-load`) + adb restart gave a clean 20/20-iteration run.

5. **Summarizing.** `scripts/summarize.js` aggregates the two result JSONs into a
   markdown table (per-iteration-first averaging to match Flashlight's report) with
   candidate-vs-baseline deltas and an auto findings section. `measure.sh` also
   passes `--resultsTitle` so the web report is titled by APK name instead of the
   hardcoded "Results".

## Result

Clean 10-iteration run, `INSTANCE_COUNT = 100`, 4 KB arm64 emulator:

- **JS-thread CPU: 15.1% → 4.2% (−72%)** — the headline, exactly as predicted.
- Total CPU −35%, RAM −6%, FPS essentially flat (~58–59, not GPU-bound).
- UI-thread CPU roughly equal (−5%): both still apply the on-screen change.

The measurement validates v3's model — the win is JS-thread headroom on theme
updates, not raw frame rate at this workload.

## Where things live

- Flows: `.maestro/*.yaml`
- Build/measure/summarize: `scripts/build-apk.sh`, `scripts/measure.sh`,
  `scripts/summarize.js`
- Raw + summarized results: `/outputs` (gitignored, regenerated each run)
- Docs: `docs/performance-report.md`, `docs/observations.md`, this file
