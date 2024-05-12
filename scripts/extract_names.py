#!/usr/bin/env python3
import csv
import json
from pathlib import Path

PATH = Path(__file__).resolve().parent.parent / "historical-basemaps" / "geojson"


def extract_names(path: Path) -> list[str]:
    names = []
    with path.open() as f:
        data = json.load(f)
        for feature in data["features"]:
            name = feature["properties"]["NAME"]
            if name:
                names.append(name)
    return names


def main():
    names = []
    for path in PATH.glob("world_*.geojson"):
        names.extend(extract_names(path))

    with open("translations.csv", "w") as f:
        writer = csv.writer(f)
        writer.writerow(["original", "translation"])

        for name in list(set(names)):
            writer.writerow([name])


if __name__ == "__main__":
    main()
