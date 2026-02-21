#!/usr/bin/env python3
import csv
import json
from pathlib import Path

ORIGINAL_PATH = Path(__file__).resolve().parent.parent / "historical-basemaps" / "geojson"
DESTINATION_PATH = Path(__file__).resolve().parent.parent / "maps"


def create_new_geojson(path: Path, words: dict[str, str]) -> None:
    with path.open() as f:
        geojson = json.load(f)

    output = {k: v for k, v in geojson.items() if k != "features"}
    output["features"] = []
    for feature in geojson["features"]:
        name = feature["properties"]["NAME"]
        feature["properties"]["NAME"] = words.get(name, name)
        subjecto = feature["properties"].get("SUBJECTO")
        if subjecto:
            feature["properties"]["SUBJECTO"] = words.get(subjecto, subjecto)
        output["features"].append(feature)

    with (DESTINATION_PATH / path.name).open("w") as f:
        json.dump(output, f, ensure_ascii=False)


def main():
    words = {}
    with open("translations.csv") as f:
        reader = csv.DictReader(f, fieldnames=["original", "translation"])
        for row in reader:
            translation = (row.get("translation") or "").strip()
            if translation:
                words[row["original"]] = translation

    for original_path in ORIGINAL_PATH.glob("world_*.geojson"):
        create_new_geojson(original_path, words)


if __name__ == "__main__":
    main()
