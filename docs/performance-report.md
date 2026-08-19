# Performance report: unistyles v2 vs v3

How this repo measures and compares `react-native-unistyles` **v2** (branch `main`)
against **v3** (branch `v3-unistyles`) on Android with [Flashlight](https://docs.flashlight.dev),
driven by [Maestro](https://maestro.mobile.dev). This is the end-to-end runbook —
build, measure, summarize, and the pitfalls that will otherwise cost you an
afternoon.

## What we measure and why

The core difference between unistyles v2 and v3 is **where a style update happens**:

- **v2** — every `useStyles` consumer subscribes individually. A theme switch
  re-renders each consuming component in **JavaScript**.
- **v3** — style updates flow through the C++ ShadowTree (Nitro). A theme switch
  updates native shadow nodes with **~0 JS re-renders**.

So the headline metric is **JS-thread CPU during a theme toggle**. FPS, total CPU,
per-thread CPU, and RAM are collected alongside for context.

The workload is identical on both branches (same components, same `testID`s, same
Maestro flow), so any delta is attributable to the library version, not the app.

## Prerequisites

- Android SDK with `adb` and `emulator` on `PATH` (or under `~/Library/Android/sdk`).
- **Maestro** (`maestro`) — the E2E driver.
- **Flashlight** (`flashlight`, installed under `~/.flashlight/bin`) — OS-level FPS/CPU/RAM.
- Node + Yarn.
- An Android emulator or device. **See the page-size warning below.**

### ⚠️ Emulator must be 4 KB page size, not 16 KB

Flashlight ships a prebuilt native profiler (`BAMPerfProfiler`) that is **not
16 KB-page aligned**. On a 16 KB-page emulator image (e.g. `sdk_gphone16k_*`,
Android 15+/16 dev images) it **segfaults immediately**:

```
adb shell /data/local/tmp/BAMPerfProfiler printCpuClockTick
status: 139   (SIGSEGV)
```

Check the target before running:

```bash
adb shell getconf PAGE_SIZE     # must print 4096, not 16384
```

If it prints `16384`, use a standard 4 KB image (`sdk_gphone64_arm64`, etc.) or a
physical device. As of Flashlight **0.18.0** (latest) there is no released build
that works on 16 KB pages; the only way to run on 16 KB is to rebuild the profiler
from source with `-Wl,-z,max-page-size=16384` and inject it. Page size does **not**
affect the v2-vs-v3 JS-render delta, so a 4 KB target gives the same comparison.

## Step by step

### 1. Build a release APK per branch

Flashlight needs a **production** build (minified JS, no dev server). `build:apk`
runs `yarn` → `expo prebuild --clean` → `gradle assembleRelease` and copies the
result to `outputs/<branch>.apk`.

```bash
# on branch `main`
yarn build:apk            # -> outputs/main.apk

git checkout v3-unistyles
yarn build:apk            # -> outputs/v3-unistyles.apk
```

`/outputs` is gitignored. The APK is named after the current branch.

### 2. Boot a clean 4 KB emulator

A cold boot avoids the mid-run instability described in Troubleshooting.

```bash
adb -s emulator-5554 emu kill                     # if one is running
adb kill-server && adb start-server
~/Library/Android/sdk/emulator/emulator \
  -avd <AvdName> -no-snapshot-load -no-boot-anim &
adb wait-for-device
adb shell getconf PAGE_SIZE                        # confirm 4096
```

### 3. Warm the Maestro driver

On a fresh emulator Maestro's on-device driver isn't installed yet; the first
Flashlight iteration will otherwise fail with a gRPC `UNAVAILABLE`. Run the flow
once standalone to install/start the driver:

```bash
adb install -r outputs/main.apk
maestro test .maestro/toggle-theme.yaml           # should pass end-to-end
```

### 4. Measure both APKs

```bash
yarn measure main.apk v3-unistyles.apk
```

`measure` (see `scripts/measure.sh`) does, per APK:

1. `adb install -r outputs/<name>.apk`
2. `flashlight test` with the Maestro flow, `--iterationCount 10`,
   `--duration 8000`, `--resultsTitle <name>`, writing `outputs/<name>.json`.

Then it runs `scripts/summarize.js` to emit `outputs/summary.md`, and opens the
Flashlight comparison report (`flashlight report a.json b.json`).

### 5. Read the results

- **`outputs/summary.md`** — text table + auto findings (see Summarize below).
- **Flashlight web report** — interactive charts (opened automatically). Titled by
  the APK name because of `--resultsTitle`.
- **`outputs/<name>.json`** — raw per-sample data (fps, ram, per-thread cpu).

## The Maestro flow

`.maestro/toggle-theme.yaml` launches the app, then toggles the theme **10×** on
the Static screen and **10×** on the Nested screen, with a 300 ms delay between
taps. Key details:

- Uses `tapOn { repeat: 10, delay: 300 }`, **not** a flow-level `repeat`. A
  flow-level repeat re-locates the element before every tap — each lookup dumps the
  whole view hierarchy, which is ~6 s per tap on a large tree. `tapOn.repeat`
  resolves the element **once** and taps it N times, so it stays fast.
- `waitToSettleTimeoutMs: 0` — don't wait for the UI to go idle after a tap; on v2
  a toggle re-renders many components and the default settle-wait stalls.

Companion flows:

- `.maestro/fast-toggle.yaml` — same, 50 ms delay (stress rapid switches).
- `.maestro/toggle-theme-repeat-try.yaml` — deliberately uses the **old** flow-level
  `repeat` (re-find per tap) to demonstrate the per-tap hierarchy-dump cost.

## Summarize script

`scripts/summarize.js` reads two Flashlight result JSONs and writes a markdown
comparison:

```bash
node scripts/summarize.js outputs/main.json outputs/v3-unistyles.json outputs/summary.md
```

- First file = baseline, second = candidate; deltas are **candidate vs baseline**.
- Metrics are aggregated **per iteration first, then averaged across iterations**
  (matching how Flashlight's own report summarizes), while min/max are taken over
  raw samples so spikes survive.
- Labels come from each result file's **basename** (Flashlight hardcodes the JSON
  `name` to `"Results"`, so the field is useless).
- Reports: avg/min FPS, jank (% samples < 50 fps), total CPU, CPU peak, UI-thread
  CPU, JS-thread CPU (`mqt_v_js`), RenderThread CPU, avg/peak RAM, avg flow time,
  plus an auto Findings section.

## Sample result

From a clean 10-iteration run on a 4 KB arm64 emulator (`INSTANCE_COUNT = 100`):

| Metric                         | main (v2) | v3-unistyles | Δ          |
| ------------------------------ | --------- | ------------ | ---------- |
| Avg FPS                        | 58.4      | 58.9         | +0.8%      |
| Min FPS (worst sample)         | 37.2      | 39.6         | +6.7%      |
| Jank (% samples < 50 fps)      | 5.9%      | 5.9%         | 0.0%       |
| Total CPU                      | 38.0%     | 24.7%        | −35.1%     |
| CPU peak                       | 131.5%    | 99.8%        | −24.1%     |
| UI-thread CPU                  | 17.3%     | 16.4%        | −5.2%      |
| **JS-thread CPU (`mqt_v_js`)** | **15.1%** | **4.2%**     | **−72.2%** |
| RenderThread CPU               | 2.9%      | 2.3%         | −20.5%     |
| Avg RAM                        | 292.4 MB  | 274.2 MB     | −6.2%      |
| RAM peak                       | 332.6 MB  | 303.6 MB     | −8.7%      |

**Reading it:** JS-thread CPU drops ~72% — exactly the thesis. v2 re-renders every
`useStyles` consumer in JS on each toggle; v3 pushes the update through the C++
ShadowTree so the JS thread barely moves. Total CPU follows (−35%). UI-thread CPU
stays close because the on-screen change still has to be applied on both. FPS is
flat — neither is GPU-bound at this workload — and RAM is modestly lower on v3.

> CPU percentages are summed across threads, so total CPU can exceed 100% on a
> multi-core device. Exact absolutes may differ slightly from the Flashlight web
> report if it normalizes CPU differently; trends and magnitudes match.

## Troubleshooting

| Symptom                                                                                                           | Cause                                                         | Fix                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `BAMPerfProfiler ... status: 139` (SIGSEGV) at profiler install                                                   | 16 KB page-size emulator                                      | Use a 4 KB target (`getconf PAGE_SIZE` = 4096) or physical device                                                       |
| `io.grpc.StatusRuntimeException: UNAVAILABLE` on first iteration                                                  | Maestro driver not installed on a fresh emulator              | Run `maestro test .maestro/toggle-theme.yaml` once to warm the driver                                                   |
| `device offline` mid-run, `DeviceServerDiedException` during `viewHierarchy`; iterations fail after passing a few | Emulator tips over under render + profiler load               | Cold-boot the emulator (`-no-snapshot-load`), restart adb; if it persists, lower `INSTANCE_COUNT` or `--iterationCount` |
| Each tap takes ~6–10 s                                                                                            | Maestro re-locating the element per tap = full hierarchy dump | Use `tapOn { repeat, delay }` (already in `toggle-theme.yaml`), not flow-level `repeat`                                 |
| Report titled "Results" for both                                                                                  | Flashlight hardcodes JSON `name`                              | `--resultsTitle` (set in `measure.sh`); for old JSONs, patch the `name` field                                           |

## Reproducing from scratch (quick reference)

```bash
# 1. build both APKs
yarn build:apk                                  # on main
git checkout v3-unistyles && yarn build:apk     # on v3
git checkout main

# 2. cold-boot a 4 KB emulator, confirm page size
adb shell getconf PAGE_SIZE                      # 4096

# 3. warm the driver
adb install -r outputs/main.apk
maestro test .maestro/toggle-theme.yaml

# 4. measure + summarize + report
yarn measure main.apk v3-unistyles.apk

# 5. results
cat outputs/summary.md
```
