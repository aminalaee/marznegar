# Scripts

Translation pipeline for converting English GeoJSON place names to Persian.

## Setup

```bash
pip install -r scripts/requirements.txt
```

## Pipeline

```
historical-basemaps/geojson/  →  extract_names.py  →  translations.csv  →  translate_names.py  →  translations.csv  →  update_maps.py  →  maps/
        (source)                   (extract)            (template)           (translate)             (filled)             (apply)          (output)
```

## Scripts

### `extract_names.py`

Extracts unique `NAME` and `SUBJECTO` values from source GeoJSON files into `translations.csv`. Preserves existing translations on re-run.

```bash
python scripts/extract_names.py
```

Requires the `historical-basemaps` submodule to be initialized:

```bash
git submodule update --init
```

### `translate_names.py`

Translates empty entries in `translations.csv`. Uses Wikipedia langlinks first (free), then falls back to OpenAI.

```bash
# Wikipedia + OpenAI fallback (default)
python scripts/translate_names.py

# Wikipedia only (free, no API key)
python scripts/translate_names.py --skip-openai

# OpenAI only (skip Wikipedia)
python scripts/translate_names.py --skip-wikipedia

# Translate a small batch
python scripts/translate_names.py --limit 20

# Preview without changes
python scripts/translate_names.py --dry-run
```

| Flag               | Description                              |
| ------------------ | ---------------------------------------- |
| `--model`          | OpenAI model (default: `gpt-4o-mini`)    |
| `--batch-size`     | Names per OpenAI call (default: 50)      |
| `--limit`          | Max names to translate (default: all)    |
| `--skip-wikipedia` | Skip Wikipedia, go straight to OpenAI    |
| `--skip-openai`    | Only use Wikipedia, skip OpenAI fallback |
| `--dry-run`        | Show what would be translated            |

Requires `OPENAI_API_KEY` environment variable (unless using `--skip-openai`).

**Cost optimization:** Names are translated in batches (default 50 per API call). The default model is `gpt-4o-mini` (cheapest). For the cheapest approach, run Wikipedia first (free), then OpenAI for the rest:

```bash
# Step 1: Wikipedia only (free)
python scripts/translate_names.py --skip-openai

# Step 2: OpenAI for the rest, large batches
python scripts/translate_names.py --skip-wikipedia --batch-size 100
```

### `update_maps.py`

Applies translations from `translations.csv` to source GeoJSON files, writing translated copies to `maps/`. Translates both `NAME` and `SUBJECTO` properties. Empty translations are skipped (original name kept).

```bash
python scripts/update_maps.py
```

Requires the `historical-basemaps` submodule to be initialized.
