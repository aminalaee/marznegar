#!/usr/bin/env python3

import argparse
import csv
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

CSV_PATH = Path(__file__).resolve().parent.parent / "translations.csv"

SYSTEM_PROMPT = """\
You are a translator specializing in historical geography and political entities.
Translate the given English place names to Persian (Farsi).
These are names of historical countries, empires, civilizations, tribes, and geographical regions.

Rules:
- Use the most common Persian name if one exists (e.g. "Ottoman Empire" -> "امپراتوری عثمانی")
- For well-known places, use the established Persian transliteration (e.g. "France" -> "فرانسه")
- For indigenous/tribal names with no known Persian equivalent, transliterate to Persian script
- Do NOT leave any name in Latin script
- Return a JSON object: {"translations": ["translated1", "translated2", ...]}
"""


def load_csv() -> list[dict[str, str]]:
    with CSV_PATH.open() as f:
        reader = csv.DictReader(f, fieldnames=["original", "translation"])
        next(reader)
        return list(reader)


def save_csv(rows: list[dict[str, str]]) -> None:
    with CSV_PATH.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["original", "translation"])
        for row in rows:
            writer.writerow([row["original"], row["translation"]])


def get_untranslated(rows: list[dict[str, str]]) -> list[int]:
    indices = []
    for i, row in enumerate(rows):
        translation = row.get("translation") or ""
        if not translation.strip():
            indices.append(i)
    return indices


def wikipedia_lookup(name: str) -> str | None:
    encoded = urllib.parse.quote(name)
    url = (
        f"https://en.wikipedia.org/w/api.php?"
        f"action=query&titles={encoded}&prop=langlinks&lllang=fa"
        f"&format=json&redirects=1"
    )
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Marznegar/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
        pages = data.get("query", {}).get("pages", {})
        for page in pages.values():
            langlinks = page.get("langlinks", [])
            if langlinks:
                return langlinks[0]["*"]
    except Exception:
        pass
    return None


def wikipedia_batch(names: list[str]) -> dict[str, str]:
    results = {}
    total = len(names)
    for i, name in enumerate(names, 1):
        print(f"  [{i}/{total}] Looking up: {name}", end="")
        persian = wikipedia_lookup(name)
        if persian:
            results[name] = persian
            print(f" -> {persian}")
        else:
            print(f" -> not found")
        time.sleep(0.1)
    return results


def translate_batch_openai(names: list[str], model: str) -> list[str]:
    from openai import OpenAI

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY environment variable is required")

    client = OpenAI(api_key=api_key)
    user_message = json.dumps(names, ensure_ascii=False)

    response = client.chat.completions.create(
        model=model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Translate these names to Persian:\n\n{user_message}"},
        ],
        temperature=0.3,
    )

    result = json.loads(response.choices[0].message.content)
    translations = result["translations"]
    if len(translations) != len(names):
        raise ValueError(f"Expected {len(names)} translations, got {len(translations)}")
    return translations


def main():
    parser = argparse.ArgumentParser(description="Translate place names to Persian")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be translated")
    parser.add_argument("--batch-size", type=int, default=50, help="Names per LLM API call (default: 50)")
    parser.add_argument("--limit", type=int, default=0, help="Max names to translate (0 = all)")
    parser.add_argument("--model", type=str, default="gpt-4o-mini", help="OpenAI model (default: gpt-4o-mini)")
    parser.add_argument("--skip-wikipedia", action="store_true", help="Skip Wikipedia lookup, go straight to OpenAI")
    parser.add_argument("--skip-openai", action="store_true", help="Only use Wikipedia, skip OpenAI fallback")
    args = parser.parse_args()

    rows = load_csv()
    untranslated_indices = get_untranslated(rows)

    if args.limit > 0:
        untranslated_indices = untranslated_indices[: args.limit]

    print(f"Total entries: {len(rows)}")
    print(f"Untranslated: {len(untranslated_indices)}")

    if not untranslated_indices:
        print("Nothing to translate!")
        return

    if args.dry_run:
        print(f"\n[Dry run] Would translate {len(untranslated_indices)} names")
        print(f"[Dry run] Provider: {args.provider}")
        print(f"[Dry run] Sample names:")
        for idx in untranslated_indices[:10]:
            print(f"  - {rows[idx]['original']}")
        return

    translated_count = 0
    remaining_indices = list(untranslated_indices)

    if not args.skip_wikipedia:
        print(f"\n--- Wikipedia lookup ---")
        names_to_lookup = [rows[i]["original"] for i in remaining_indices]
        wiki_results = wikipedia_batch(names_to_lookup)
        print(f"  Found {len(wiki_results)}/{len(names_to_lookup)} on Wikipedia")

        still_remaining = []
        for idx in remaining_indices:
            name = rows[idx]["original"]
            if name in wiki_results:
                rows[idx]["translation"] = wiki_results[name]
                translated_count += 1
            else:
                still_remaining.append(idx)
        remaining_indices = still_remaining

    if remaining_indices and not args.skip_openai:
        print(f"\n--- OpenAI fallback ({len(remaining_indices)} remaining) ---")

        for batch_start in range(0, len(remaining_indices), args.batch_size):
            batch_indices = remaining_indices[batch_start : batch_start + args.batch_size]
            batch_names = [rows[i]["original"] for i in batch_indices]

            batch_num = batch_start // args.batch_size + 1
            total_batches = (len(remaining_indices) + args.batch_size - 1) // args.batch_size
            print(f"  Batch {batch_num}/{total_batches} ({len(batch_names)} names)...")

            try:
                translations = translate_batch_openai(batch_names, args.model)
                for idx, translation in zip(batch_indices, translations):
                    rows[idx]["translation"] = translation
                    translated_count += 1
                    print(f"    {rows[idx]['original']} -> {translation}")
            except Exception as e:
                print(f"  Error: {e}", file=sys.stderr)
                print(f"  Saving progress ({translated_count} translations)...")
                break

    save_csv(rows)
    print(f"\nDone! Translated {translated_count} names. Saved to {CSV_PATH}")


if __name__ == "__main__":
    main()
