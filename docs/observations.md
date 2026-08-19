# Observations: learnings & issues faced

Field notes from building and running the unistyles v2-vs-v3 Flashlight harness.
These are the non-obvious things that cost real time — kept separate from the
runbook (`performance-report.md`) so the how-to stays clean.

## Tooling gotchas

### Flashlight profiler segfaults on 16 KB-page emulators
The single biggest time sink. Flashlight 0.18.0 (the latest release, Jul 2024)
ships a prebuilt `BAMPerfProfiler` that isn't 16 KB-ELF-aligned. On a
`sdk_gphone16k_arm64` image it dies with `status: 139` at
`printCpuClockTick`, before any measurement. No release fixes it.

- **Tell early:** `adb shell getconf PAGE_SIZE` → `16384` is the red flag.
- Only real path to run *on* 16 KB is rebuilding the profiler from source with
  `-Wl,-z,max-page-size=16384` and injecting it (Flashlight re-pushes its embedded
  4 KB binary every run, so a manual `adb push` gets clobbered — you must build
  Flashlight's monorepo). Not worth it unless page size is the variable under test.
- Lesson: verify the profiler agent loads on the target **before** trusting any
  measurement toolchain — the app was never the problem.

### Maestro has no `sleep`, and pacing ≠ tap cost
- There is no fixed-delay command. `waitForAnimationToEnd: timeout: N` is a **cap**,
  not a sleep, and a `runScript` busy-wait is the only true fixed delay.
- But the right answer here was `tapOn { repeat, delay }`, which both paces the taps
  **and** avoids re-locating the element each time.
- Watching the actual inter-tap timing (a `runScript` that appended `Date.now()` to
  Maestro's persistent `output` object) is what revealed each tap cost ~6 s — the
  delay was noise next to that.

### The ~6 s-per-tap was element re-location, not rendering
Initially misattributed the slowness to "v2 re-render cost," then to the
accessibility-tree dump. Both wrong. The cost was **Maestro re-finding the element
before every tap** in a flow-level `repeat`, and each find dumps the whole view
hierarchy (~600 boxes at `INSTANCE_COUNT = 100`). Switching to `tapOn.repeat`
(resolve once, tap N) fixed it — the `importantForAccessibility` /
`accessibilityElementsHidden` props we'd added turned out to be unnecessary and
were removed.

- Lesson: measure before attributing. The user was right that manual toggles were
  instant; the slowness lived entirely in the test driver, not the app.

### Fresh emulator = dead Maestro driver
A cold-booted emulator has no Maestro instrumentation installed, so the first
Flashlight iteration fails with `io.grpc.StatusRuntimeException: UNAVAILABLE`
(`MaestroDriverGrpc.deviceInfo`). Running the flow once standalone installs/starts
the driver and makes the subsequent `flashlight test` clean.

### Emulator goes `device offline` under combined load
Release build rendering ~600 unistyles boxes + full hierarchy dumps + Flashlight's
atrace profiling pushed the arm64 emulator offline mid-run
(`DeviceServerDiedException` during `viewHierarchy`, `device offline` in adb). It
recovered on its own but the iteration failed. A **cold boot** (`-no-snapshot-load`)
plus adb restart gave a clean 20/20-iteration run with 0 retries. If it recurs, the
levers are lower `INSTANCE_COUNT`, fewer iterations, or more emulator RAM.

### Flashlight hardcodes the report name
Result JSONs always carry `name: "Results"`, so both sides of a comparison render
with the same title. Fixed with `--resultsTitle` at test time; for already-written
JSONs, patch the `name` field before `flashlight report`.

## Method notes

- **Aggregation choice matters.** Pooling every sample flat vs averaging
  per-iteration-then-across-iterations gives slightly different absolutes. We chose
  per-iteration-first to line up with Flashlight's own report. Min/max stay over raw
  samples so spikes aren't averaged away.
- **CPU is summed across threads**, so total CPU can exceed 100% on multi-core. The
  meaningful number for this comparison is the **JS thread** (`mqt_v_js`), not total.
- **Identical workload is the whole point.** Same components, `testID`s, and Maestro
  flow on both branches; only the unistyles API differs (v2 `createStyleSheet` +
  `useStyles` vs v3 `StyleSheet.create` + babel/Nitro). Any delta is the library.

## Result that validated the setup

JS-thread CPU **15.1% → 4.2% (−72%)** on theme toggles, total CPU −35%, FPS flat,
RAM −6%. This is exactly the predicted v2-vs-v3 shape: v3 moves style updates off
the JS thread into the C++ ShadowTree. A flat FPS with a large JS-CPU drop is the
expected signature — the win is headroom/energy, not frame rate at this workload.

## If continuing

- A stronger signal would come from a heavier or more frequent update path (higher
  `INSTANCE_COUNT`, or a sustained-update screen) — but that also stresses the
  emulator, so pair it with more RAM or a physical device.
- Consider committing a small `reports/` (tracked) location for `summary.md` if the
  markdown should live in history — currently everything under `/outputs` is
  gitignored and regenerated each run.
