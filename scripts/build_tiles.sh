#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
INPUT_DIR="$ROOT_DIR/maps"
OUTPUT_DIR="$ROOT_DIR/maps_tiles"

rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

count=0
total=$(ls "$INPUT_DIR"/*.geojson 2>/dev/null | wc -l | tr -d ' ')

for f in "$INPUT_DIR"/*.geojson; do
  name=$(basename "$f" .geojson)
  count=$((count + 1))
  echo "[$count/$total] $name"
  tippecanoe \
    -o "$OUTPUT_DIR/$name.pmtiles" \
    --force \
    --no-feature-limit \
    --no-tile-size-limit \
    --no-tile-compression \
    --minimum-zoom=2 \
    --maximum-zoom=7 \
    --drop-rate=0 \
    --layer=borders \
    --simplification=10 \
    --detect-shared-borders \
    --generate-ids \
    "$f" 2>/dev/null
done

echo ""
echo "Done. Size comparison:"
du -sh "$INPUT_DIR" "$OUTPUT_DIR"
