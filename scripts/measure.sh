#!/usr/bin/env bash
#
# Run Flashlight on two APKs with the toggle-theme Maestro flow, then open a
# comparison report. Both APKs share the same bundleId, so they are measured
# sequentially (install -> measure -> install next).
#
# Reports are named after each APK (see .json result files in ./outputs).
#
# Usage: yarn measure <apk1> <apk2>
#   e.g. yarn measure main.apk v3-unistyles.apk
#   (names are resolved inside ./outputs)
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
OUT_DIR="$ROOT/outputs"
FLOW="$ROOT/.maestro/toggle-theme.yaml"
APP_ID="$(node -e "console.log(require('./app.json').expo.android.package)")"
ITERATION_COUNT=10
DURATION_MS=20000

if [ "$#" -ne 2 ]; then
  echo "usage: yarn measure <apk1> <apk2>  (names inside ./outputs)"
  exit 1
fi

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
    --resultsFilePath "$OUT_DIR/${result_name}.json"
}

run_one "$1"
run_one "$2"

R1="$OUT_DIR/$(basename "$1" .apk).json"
R2="$OUT_DIR/$(basename "$2" .apk).json"

echo "==> flashlight report (comparison)"
flashlight report "$R1" "$R2"
