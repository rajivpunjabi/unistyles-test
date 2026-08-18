#!/usr/bin/env bash
#
# Build a fresh release (production) APK for the current branch and drop it in
# ./outputs. Flashlight needs a production build (minified JS, no dev server).
#
# Runs yarn -> expo prebuild (clean) -> gradle assembleRelease every time, so the
# android/ project and the APK are always regenerated from the current branch.
#
# Usage: yarn build:apk
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
OUT_DIR="$ROOT/outputs"
BRANCH="$(git rev-parse --abbrev-ref HEAD | tr '/' '-')"
APK_SRC="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
APK_DEST="$OUT_DIR/${BRANCH}.apk"

mkdir -p "$OUT_DIR"

echo "==> [1/4] yarn install"
yarn install

echo "==> [2/4] expo prebuild --clean (android)"
npx expo prebuild --clean --platform android

echo "==> [3/4] gradle assembleRelease"
( cd android && ./gradlew :app:assembleRelease )

echo "==> [4/4] copy APK -> $APK_DEST"
cp "$APK_SRC" "$APK_DEST"

echo ""
echo "Done. APK for branch '$BRANCH':"
echo "  $APK_DEST"
