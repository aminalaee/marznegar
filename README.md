# Marznegar (مرزنگار)

**مرزنگار** ابزاری تعاملی برای مشاهده مرزهای تاریخی جهان از ۱۲۳٬۰۰۰ سال پیش از میلاد تا امروز است.

**Marznegar** is an interactive historical world map viewer — explore how borders have changed from 123,000 BC to the present day.

## منبع داده / Data Source

داده‌های جغرافیایی از پروژه [Historical Basemaps](https://github.com/aourednik/historical-basemaps) گردآوری‌شده توسط [Anouk Ourednik](https://ourednik.info/) برگرفته شده و نام‌ها به فارسی ترجمه شده‌اند.

Geographic boundary data is sourced from [Historical Basemaps](https://github.com/aourednik/historical-basemaps) by [Anouk Ourednik](https://ourednik.info/). Place names are translated to Persian using Wikipedia and OpenAI APIs.

## فناوری / Technology

نقشه‌ها با استفاده از [MapLibre GL](https://maplibre.org/) و فرمت [PMTiles](https://protomaps.com/docs/pmtiles) نمایش داده می‌شوند.

Maps are rendered using [MapLibre GL](https://maplibre.org/) with [PMTiles](https://protomaps.com/docs/pmtiles) vector tiles.

## Development

```bash
make install      # Install dependencies
make submodule    # Initialize source data submodule
make build-tiles  # Build vector tiles (requires tippecanoe)
make dev          # Start dev server
```

## License

GPL-3.0
