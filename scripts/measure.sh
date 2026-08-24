#!/usr/bin/env bash
#
# Run Flashlight on N APKs with the toggle-theme Maestro flow, then summarize and
# open a comparison report. All APKs share the same bundleId, so they are
# measured sequentially (install -> measure -> install next). The FIRST APK is
# the baseline; every other is compared against it.
#
# Reports are named after each APK (see .json result files in ./outputs).
#
# Usage: yarn measure [--size-only] [--flow <name>|--bump] <apk1> <apk2> [apk3 ...]
#   e.g. yarn measure main.apk v3-unistyles.apk native-stylesheets.apk
#   e.g. yarn measure --bump main.apk v3-unistyles.apk
#   (names are resolved inside ./outputs; first APK is the baseline)
#
# --flow <name>: Maestro flow under .maestro/<name>.yaml (default: toggle-theme).
# --bump:        shorthand for --flow bump (drives the root-state bump instead
#                of the theme toggle).
# --size-only:   skip adb/Flashlight/Maestro entirely and produce ONLY the
#                APK-based size comparison (native libs + JS bundle) as markdown.
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
OUT_DIR="$ROOT/outputs"
APP_ID="$(node -e "console.log(require('./app.json').expo.android.package)")"
ITERATION_COUNT=10
DURATION_MS=8000
# ABI to diff native libs for. The release APK is "fat" (ships every ABI), but a
# device installs only one — arm64-v8a on modern hardware — so that single set is
# the real per-device native footprint. Override with ABI=... if needed.
ABI="${ABI:-arm64-v8a}"

SIZE_ONLY=0
# Maestro flow to drive (file under .maestro/, without extension). Default drives
# the theme toggle; --bump / --flow bump drives the root-state bump instead.
FLOW_NAME="toggle-theme"
ARGS=()
while [ "$#" -gt 0 ]; do
  case "$1" in
    --size-only|--apk-only) SIZE_ONLY=1 ;;
    --bump) FLOW_NAME="bump" ;;
    --flow) shift; FLOW_NAME="${1:-}" ;;
    --flow=*) FLOW_NAME="${1#*=}" ;;
    *) ARGS+=("$1") ;;
  esac
  shift
done
set -- ${ARGS[@]+"${ARGS[@]}"}

FLOW="$ROOT/.maestro/${FLOW_NAME}.yaml"
if [ ! -f "$FLOW" ]; then
  echo "ERROR: flow '$FLOW_NAME' not found at $FLOW"
  exit 1
fi

if [ "$#" -lt 2 ]; then
  echo "usage: yarn measure [--size-only] [--flow <name>|--bump] <apk1> <apk2> [apk3 ...]"
  exit 1
fi

APKS=("$@")

require_apk() {
  if [ ! -f "$OUT_DIR/$1" ]; then
    echo "ERROR: $OUT_DIR/$1 not found. Build it first with 'yarn build:apk'."
    exit 1
  fi
}

run_one() {
  local apk_name="$1"
  local apk_path="$OUT_DIR/$apk_name"
  local result_name; result_name="$(basename "$apk_name" .apk)"

  require_apk "$apk_name"

  echo "==> install $apk_name"
  adb install -r "$apk_path"

  echo "==> flashlight test ($result_name), $ITERATION_COUNT iterations"
  flashlight test \
    --bundleId "$APP_ID" \
    --testCommand "maestro test $FLOW" \
    --iterationCount "$ITERATION_COUNT" \
    --resultsTitle "$result_name" \
    --resultsFilePath "$OUT_DIR/${result_name}.json"
}

# Per-ABI uncompressed .so sizes from an APK, as "<lib-name>\t<bytes>", sorted.
lib_sizes() {
  unzip -v "$1" "lib/$ABI/*.so" 2>/dev/null \
    | awk -v OFS='\t' '$NF ~ /\.so$/ { n = $NF; sub(/.*\//, "", n); print n, $1 }' \
    | sort
}

# Uncompressed size (bytes) of the embedded Hermes JS bundle in an APK.
bundle_size() {
  unzip -v "$1" "assets/index.android.bundle" 2>/dev/null \
    | awk '$NF == "assets/index.android.bundle" { print $1 }'
}

# Append an N-column "values + deltas" size report (native libs + JS bundle) to
# the markdown. First arg is the out file; the rest are APK names. The first APK
# is the baseline; candidate cells show KB and (Δ vs baseline).
append_size_report() {
  local out="$1"; shift
  local apks=("$@")
  local n=${#apks[@]}
  local tmp; tmp="$(mktemp -d)"

  local labels=() libfiles=()
  local i
  for i in "${!apks[@]}"; do
    labels+=("$(basename "${apks[$i]}" .apk)")
    lib_sizes "$OUT_DIR/${apks[$i]}" > "$tmp/lib.$i"
    libfiles+=("$tmp/lib.$i")
  done

  {
    echo ""
    echo "## Native libraries ($ABI)"
    echo ""
    echo "Uncompressed \`.so\` sizes in KB (the APK is fat; $ABI is the per-device set). Δ is vs baseline **${labels[0]}**."
    echo ""
    printf '| Library'
    for l in "${labels[@]}"; do printf ' | %s' "$l"; done
    printf ' |\n'
    printf '|---'
    for _ in "${labels[@]}"; do printf '|--:'; done
    printf '|\n'

    awk -v ncol="$n" '
      FNR == 1 { idx++ }
      { size[$1 SUBSEP idx] = $2; names[$1] = 1 }
      END {
        k = 0
        for (nm in names) { sorted[k++] = nm }
        for (a = 0; a < k; a++) {
          for (b = a + 1; b < k; b++) {
            if (sorted[b] < sorted[a]) { t = sorted[a]; sorted[a] = sorted[b]; sorted[b] = t }
          }
        }
        for (a = 0; a < k; a++) {
          nm = sorted[a]
          base = size[nm SUBSEP 1] + 0
          line = "| " nm
          for (c = 1; c <= ncol; c++) {
            v = size[nm SUBSEP c] + 0
            cell = sprintf("%.1f", v / 1024)
            if (c > 1) { d = v - base; s = (d > 0 ? "+" : ""); cell = cell " (" s sprintf("%.1f", d / 1024) ")" }
            line = line " | " cell
            tot[c] += v
          }
          print line " |"
        }
        line = "| **total**"
        for (c = 1; c <= ncol; c++) {
          v = tot[c]
          if (c == 1) { cell = sprintf("**%.1f**", v / 1024) }
          else { d = v - tot[1]; s = (d > 0 ? "+" : ""); cell = "**" sprintf("%.1f", v / 1024) " (" s sprintf("%.1f", d / 1024) ")**" }
          line = line " | " cell
        }
        print line " |"
      }
    ' "${libfiles[@]}"

    echo ""
    echo "## JS bundle (assets/index.android.bundle)"
    echo ""
    echo "Uncompressed Hermes bytecode in KB — the JS that actually ships. Δ is vs baseline **${labels[0]}**."
    echo ""
    printf '|'
    for l in "${labels[@]}"; do printf ' %s |' "$l"; done
    printf '\n|'
    for _ in "${labels[@]}"; do printf '%s' '--:|'; done
    printf '\n'

    local base_bundle; base_bundle="$(bundle_size "$OUT_DIR/${apks[0]}")"; base_bundle="${base_bundle:-0}"
    printf '|'
    for i in "${!apks[@]}"; do
      local bs; bs="$(bundle_size "$OUT_DIR/${apks[$i]}")"; bs="${bs:-0}"
      awk -v v="$bs" -v base="$base_bundle" -v first="$i" '
        function kb(b) { return sprintf("%.1f", b / 1024) }
        BEGIN {
          if (first == 0) { printf " %s |", kb(v) }
          else { d = v - base; s = (d > 0 ? "+" : ""); printf " %s (%s%s) |", kb(v), s, kb(d) }
        }'
    done
    printf '\n'
  } >> "$out"

  rm -rf "$tmp"
}

if [ "$SIZE_ONLY" -eq 1 ]; then
  for apk in "${APKS[@]}"; do require_apk "$apk"; done

  SIZE_MD="$OUT_DIR/size-summary.md"
  BASE_LABEL="$(basename "${APKS[0]}" .apk)"
  {
    echo "# APK size comparison (${#APKS[@]} builds)"
    echo ""
    echo "APK-only measurement (no Flashlight/Maestro). Baseline is **$BASE_LABEL**; Δ is vs baseline."
  } > "$SIZE_MD"

  echo "==> size report (native libs + JS bundle -> $SIZE_MD)"
  append_size_report "$SIZE_MD" "${APKS[@]}"
  echo "==> wrote $SIZE_MD"
  exit 0
fi

echo "==> flow: $FLOW_NAME ($FLOW)"
for apk in "${APKS[@]}"; do
  run_one "$apk"
done

RESULTS=()
for apk in "${APKS[@]}"; do
  RESULTS+=("$OUT_DIR/$(basename "$apk" .apk).json")
done

SUMMARY="$OUT_DIR/summary.md"
echo "==> summarize (markdown -> $SUMMARY)"
node "$ROOT/scripts/summarize.js" "$SUMMARY" "${RESULTS[@]}"

echo "==> size report (native libs + JS bundle -> $SUMMARY)"
append_size_report "$SUMMARY" "${APKS[@]}"

echo "==> flashlight report (comparison)"
flashlight report "${RESULTS[@]}"
