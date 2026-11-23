#!/bin/sh
# Writes web-sized copies of the Lightroom exports in public/photos/ to public/photos/web/.
# The originals are only read, never modified. Re-run after re-exporting; unchanged photos are skipped.
# Uses macOS `sips` (no npm dependency). Long edge: 1200px and 2400px.
set -eu
cd "$(dirname "$0")/.."
src=public/photos
out=public/photos/web
mkdir -p "$out"

for photo in "$src"/*.jpg; do
  name=$(basename "$photo" .jpg)
  for size in 1200 2400; do
    target="$out/$name-$size.jpg"
    if [ -f "$target" ] && [ "$target" -nt "$photo" ]; then continue; fi
    sips -Z "$size" -s format jpeg -s formatOptions 82 "$photo" --out "$target" >/dev/null
    echo "wrote $target"
  done
done
