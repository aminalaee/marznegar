import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";

const isDev = import.meta.env.DEV;
const STORAGE_BASE = isDev ? "" : "https://marznegar.s3.ir-thr-at1.arvanstorage.ir";
const TILES_BASE = "https://marznegar.s3.ir-thr-at1.arvanstorage.ir";

const FADE_MS = 600;

const MAP_PALETTE = [
  "#e6194b", "#3cb44b", "#4363d8", "#f58231",
  "#42d4f4", "#f032e6", "#bfef45", "#fabed4",
  "#469990", "#dcbeff", "#9A6324", "#800000",
  "#aaffc3", "#808000", "#000075", "#a9a9a9",
];

function buildColorExpression(): maplibregl.ExpressionSpecification {
  const expr: unknown[] = ["match", ["%", ["id"], MAP_PALETTE.length]];
  for (let i = 0; i < MAP_PALETTE.length; i++) {
    expr.push(i, MAP_PALETTE[i]);
  }
  expr.push(MAP_PALETTE[0]);
  return expr as maplibregl.ExpressionSpecification;
}

const colorExpression = buildColorExpression();

interface MapViewProps {
  year: string;
}

const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);
maplibregl.setRTLTextPlugin(
  "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js",
  true,
);

function removeSlot(map: maplibregl.Map, slot: string) {
  if (map.getLayer(`${slot}-fill`)) map.removeLayer(`${slot}-fill`);
  if (map.getLayer(`${slot}-label`)) map.removeLayer(`${slot}-label`);
  if (map.getSource(slot)) map.removeSource(slot);
}

function addSlot(map: maplibregl.Map, slot: string, sourceUrl: string, opacity: number) {
  map.addSource(slot, { type: "vector", url: sourceUrl });

  map.addLayer({
    id: `${slot}-fill`,
    type: "fill",
    source: slot,
    "source-layer": "borders",
    paint: {
      "fill-color": colorExpression,
      "fill-opacity": opacity,
      "fill-opacity-transition": { duration: FADE_MS, delay: 0 },
    },
  });

  map.addLayer({
    id: `${slot}-label`,
    type: "symbol",
    source: slot,
    "source-layer": "borders",
    layout: {
      "text-field": ["coalesce", ["get", "NAME"], ["get", "SUBJECTO"]],
      "text-font": ["Noto Sans Regular"],
      "text-size": [
        "interpolate", ["linear"], ["zoom"],
        2, 8,
        4, 11,
        7, 14,
      ],
      "text-allow-overlap": false,
      "text-ignore-placement": false,
      "text-optional": true,
    },
    paint: {
      "text-color": "#333",
      "text-halo-color": "#fff",
      "text-halo-width": 1.5,
      "text-opacity": opacity > 0 ? 1 : 0,
      "text-opacity-transition": { duration: FADE_MS, delay: 0 },
    },
  });
}

export function MapView({ year }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const slotRef = useRef<"a" | "b">("a");
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSlot, setActiveSlot] = useState<"a" | "b">("a");

  const sourceUrl = `pmtiles://${STORAGE_BASE}/maps/${year}.pmtiles`;

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      center: [53.0, 32.0],
      zoom: 4,
      maxZoom: 7,
      style: {
        version: 8,
        glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
        sources: {
          basemap: {
            type: "raster",
            tiles: [`${TILES_BASE}/tiles/{z}/{x}/{y}.png`],
            maxzoom: 7,
            tileSize: 256,
          },
        },
        layers: [
          { id: "basemap", type: "raster", source: "basemap" },
        ],
      },
    });

    map.on("load", () => {
      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    clearTimeout(cleanupTimerRef.current);

    const newSlot = slotRef.current === "a" ? "b" : "a";
    const oldSlot = slotRef.current;
    slotRef.current = newSlot;

    setLoading(true);

    removeSlot(map, newSlot);
    addSlot(map, newSlot, sourceUrl, 0);

    const onData = () => {
      if (!map.isSourceLoaded(newSlot)) return;
      map.off("data", onData);
      setLoading(false);

      map.setPaintProperty(`${newSlot}-fill`, "fill-opacity", 0.5);
      map.setPaintProperty(`${newSlot}-label`, "text-opacity", 1);

      if (map.getLayer(`${oldSlot}-fill`)) {
        map.setPaintProperty(`${oldSlot}-fill`, "fill-opacity", 0);
        map.setPaintProperty(`${oldSlot}-label`, "text-opacity", 0);
      }

      setActiveSlot(newSlot);

      cleanupTimerRef.current = setTimeout(() => {
        removeSlot(map, oldSlot);
      }, FADE_MS + 100);
    };
    map.on("data", onData);

    return () => {
      map.off("data", onData);
    };
  }, [sourceUrl, mapReady]);

  const handleClick = useCallback((name: string, lngLat: maplibregl.LngLat) => {
    const map = mapRef.current;
    if (!map) return;

    if (popupRef.current) {
      popupRef.current.remove();
    }

    const popup = new maplibregl.Popup({ maxWidth: "300px" })
      .setLngLat(lngLat)
      .setHTML(`<div class="popup-content"><strong>${name}</strong><div class="popup-body">در حال بارگذاری...</div></div>`)
      .addTo(map);

    popupRef.current = popup;

    if (!/[a-zA-Z]/.test(name)) {
      const wikiBase = "https://fa.wikipedia.org/w/api.php?format=json&action=query&redirects=1";
      fetch(`${wikiBase}&list=search&srsearch=${name}&srlimit=50&origin=*`)
        .then((res) => res.json())
        .then((data) => {
          if (data.query.search.length > 0) {
            const pageId = data.query.search[0].pageid;
            return fetch(`${wikiBase}&pageids=${pageId}&explaintext=1&exintro=1&prop=extracts&origin=*`);
          }
        })
        .then((res) => res?.json())
        .then((data) => {
          if (data) {
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            const el = popup.getElement()?.querySelector(".popup-body");
            if (el) el.textContent = pages[pageId].extract;
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const fillLayer = `${activeSlot}-fill`;

    const onClick = (e: maplibregl.MapMouseEvent) => {
      if (!map.getLayer(fillLayer)) return;
      const features = map.queryRenderedFeatures(e.point, { layers: [fillLayer] });
      if (features.length > 0) {
        const name = (features[0].properties.NAME || features[0].properties.SUBJECTO) as string;
        if (name) handleClick(name, e.lngLat);
      }
    };

    const onMouseEnter = () => { map.getCanvas().style.cursor = "pointer"; };
    const onMouseLeave = () => { map.getCanvas().style.cursor = ""; };

    map.on("click", fillLayer, onClick);
    map.on("mouseenter", fillLayer, onMouseEnter);
    map.on("mouseleave", fillLayer, onMouseLeave);

    return () => {
      map.off("click", fillLayer, onClick);
      map.off("mouseenter", fillLayer, onMouseEnter);
      map.off("mouseleave", fillLayer, onMouseLeave);
    };
  }, [handleClick, activeSlot]);

  return (
    <div className="map-container">
      {loading && <div className="loading"><div className="spinner" /></div>}
      <div ref={containerRef} id="map" />
    </div>
  );
}
