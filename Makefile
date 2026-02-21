.PHONY: dev build translate build-maps build-tiles submodule install

install:
	cd frontend && npm install

dev:
	cd frontend && npm run dev

build:
	cd frontend && npm run build

translate:
	cd scripts && python translate_names.py

build-maps:
	cd scripts && python update_maps.py

build-tiles:
	bash scripts/build_tiles.sh

submodule:
	git submodule update --init --recursive
