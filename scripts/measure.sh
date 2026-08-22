#!/usr/bin/env bash
#
# Run Flashlight on two APKs with the toggle-theme Maestro flow, then open a
# comparison report. Both APKs share the same bundleId, so they are measured
# sequentially (install -> measure -> install next).
#
# Reports are named after each APK (see .json result files in ./outputs).
#
# Usage: yarn measure [--size-only] <apk1> <apk2>
#   e.g. yarn measure main.apk v3-unistyles.apk
#   (names are resolved inside ./outputs)
#
# --size-only: skip adb/Flashlight/Maestro entirely and produce ONLY the
#   APK-based size comparison (native libs + JS bundle) as its own markdown.
#   No emulator, no install, no perf run — just the two .apk files.
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
OUT_DIR="$ROOT/outputs"
FLOW="$ROOT/.maestro/toggle-theme.yaml"
APP_ID="$(node -e "console.log(require('./app.json').expo.android.package)")"
ITERATION_COUNT=10
DURATION_MS=8000
# ABI to diff native libs for. The release APK is "fat" (ships every ABI), but a
# device installs only one — arm64-v8a on modern hardware — so that single set is
# the real per-device native footprint. Override with ABI=... if needed.
ABI="${ABI:-arm64-v8a}"

SIZE_ONLY=0
ARGS=()
for a in "$@"; do
  case "$a" in
    --size-only|--apk-only) SIZE_ONLY=1 ;;
    *) ARGS+=("$a") ;;
  esac
done
set -- "${ARGS[@]}"

if [ "$#" -ne 2 ]; then
  echo "usage: yarn measure [--size-only] <apk1> <apk2>  (names inside ./outputs)"
  exit 1
fi

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

  if [ ! -f "$apk_path" ]; then
    echo "ERROR: $apk_path not found. Build it first with 'yarn build:apk'."
    exit 1
  fi

  echo "==> install $apk_name"
  adb install -r "$apk_path"

  echo "==> flashlight test ($result_name), $ITERATION_COUNT iterations"
  flashlight test \
    --bundleId "$APP_ID" \
    --testCommand "maestro test $FLOW" \
    --duration "$DURATION_MS" \
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

# Append a "values + diffs" size report (native libs + JS bundle) to the markdown.
append_size_report() {
  local apk1="$OUT_DIR/$1" apk2="$OUT_DIR/$2" out="$3"
  local l1 l2; l1="$(basename "$1" .apk)"; l2="$(basename "$2" .apk)"
  local tmp; tmp="$(mktemp -d)"

  lib_sizes "$apk1" > "$tmp/a"
  lib_sizes "$apk2" > "$tmp/b"

  {
    echo ""
    echo "## Native libraries ($ABI)"
    echo ""
    echo "Uncompressed \`.so\` sizes in KB (the APK is fat; $ABI is the per-device set). Δ is $l2 − $l1."
    echo ""
    echo "| Library | $l1 | $l2 | Δ |"
    echo "|---|--:|--:|--:|"
    join -a1 -a2 -e 0 -o '0,1.2,2.2' -t"$(printf '\t')" "$tmp/a" "$tmp/b" \
      | awk -F'\t' '
          function kb(b) { return sprintf("%.1f", b / 1024) }
          { d = $3 - $2; s = (d > 0 ? "+" : "");
            printf "| %s | %s | %s | %s%s |\n", $1, kb($2), kb($3), s, kb(d);
            t2 += $2; t3 += $3 }
          END { d = t3 - t2; s = (d > 0 ? "+" : "");
            printf "| **total** | **%s** | **%s** | **%s%s** |\n", kb(t2), kb(t3), s, kb(d) }'

    local b1 b2; b1="$(bundle_size "$apk1")"; b2="$(bundle_size "$apk2")"
    b1="${b1:-0}"; b2="${b2:-0}"
    echo ""
    echo "## JS bundle (assets/index.android.bundle)"
    echo ""
    echo "Uncompressed Hermes bytecode in KB — the JS that actually ships. Δ is $l2 − $l1."
    echo ""
    echo "| | $l1 | $l2 | Δ |"
    echo "|---|--:|--:|--:|"
    awk -v a="$b1" -v c="$b2" '
      function kb(b) { return sprintf("%.1f", b / 1024) }
      BEGIN { d = c - a; s = (d > 0 ? "+" : "");
        printf "| Hermes bytecode | %s | %s | %s%s |\n", kb(a), kb(c), s, kb(d) }'
  } >> "$out"

  rm -rf "$tmp"
}

if [ "$SIZE_ONLY" -eq 1 ]; then
  require_apk "$1"
  require_apk "$2"

  L1="$(basename "$1" .apk)"
  L2="$(basename "$2" .apk)"
  SIZE_MD="$OUT_DIR/size-summary.md"

  {
    echo "# APK size comparison: $L1 vs $L2"
    echo ""
    echo "APK-only measurement (no Flashlight/Maestro). Δ is $L2 − $L1."
  } > "$SIZE_MD"

  echo "==> size report (native libs + JS bundle -> $SIZE_MD)"
  append_size_report "$1" "$2" "$SIZE_MD"
  echo "==> wrote $SIZE_MD"
  exit 0
fi

run_one "$1"
run_one "$2"

R1="$OUT_DIR/$(basename "$1" .apk).json"
R2="$OUT_DIR/$(basename "$2" .apk).json"

SUMMARY="$OUT_DIR/summary.md"
echo "==> summarize (markdown -> $SUMMARY)"
node "$ROOT/scripts/summarize.js" "$R1" "$R2" "$SUMMARY"

echo "==> size report (native libs + JS bundle -> $SUMMARY)"
append_size_report "$1" "$2" "$SUMMARY"

echo "==> flashlight report (comparison)"
flashlight report "$R1" "$R2"
