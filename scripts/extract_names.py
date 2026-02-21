#!/usr/bin/env python3

import csv
import json
from pathlib import Path

GEOJSON_PATH = Path(__file__).resolve().parent.parent / "historical-basemaps" / "geojson"
CSV_PATH = Path(__file__).resolve().parent.parent / "translations.csv"


def extract_names(path: Path) -> set[str]:
    names = set()
    with path.open() as f:
        data = json.load(f)
        for feature in data["features"]:
            name = feature["properties"].get("NAME")
            subjecto = feature["properties"].get("SUBJECTO")
            if name and name.strip() and len(name.strip()) > 1:
                names.add(name.strip())
            if subjecto and subjecto.strip() and len(subjecto.strip()) > 1:
                names.add(subjecto.strip())
    return names


def load_existing() -> dict[str, str]:
    existing = {}
    if CSV_PATH.exists():
        with CSV_PATH.open() as f:
            reader = csv.DictReader(f, fieldnames=["original", "translation"])
            next(reader)
            for row in reader:
                existing[row["original"]] = row.get("translation") or ""
    return existing


def main():
    all_names = set()
    for path in GEOJSON_PATH.glob("world_*.geojson"):
        all_names |= extract_names(path)

    existing = load_existing()
    new_count = len(all_names - set(existing.keys()))

    with CSV_PATH.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["original", "translation"])
        for name in sorted(all_names):
            writer.writerow([name, existing.get(name, "")])

    print(f"Total: {len(all_names)} names ({new_count} new)")


if __name__ == "__main__":
    main()
