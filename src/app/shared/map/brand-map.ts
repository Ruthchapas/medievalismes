import * as maplibregl from 'maplibre-gl';

type MapLibreMap = maplibregl.Map;

// Mirrors src/app/design/_tokens.scss — MapLibre paint properties can't read
// CSS custom properties, so the hex values are duplicated here on purpose.
const BRAND = {
  calc: '#f2ead9',
  ink: '#3b281e',
  inkDim: '#8b7f6d',
  terracota: '#c1602b',
  blau: '#2c5f73',
  oliva: '#6b7a45',
  groc: '#d9a441',
} as const;

/** Free OpenFreeMap "liberty" style, ready to use with no API key. */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

const ROAD_LAYER_PREFIXES = [
  'road_motorway',
  'road_trunk_primary',
  'road_secondary_tertiary',
  'road_minor',
  'road_link',
  'road_service_track',
];

/**
 * Retints the OpenFreeMap "liberty" style to the Medievalismes palette —
 * calç ground, blau water, oliva greenery, terracota buildings and roads
 * redrawn as warm ink lines instead of the default grey/yellow scheme.
 */
export function applyBrandTint(map: MapLibreMap): void {
  const style = map.getStyle();
  if (!style) return;

  for (const layer of style.layers) {
    const sourceLayer = 'source-layer' in layer ? layer['source-layer'] : undefined;

    if (layer.id === 'background') {
      map.setPaintProperty(layer.id, 'background-color', BRAND.calc);
      continue;
    }

    if (sourceLayer === 'water' && layer.type === 'fill') {
      map.setPaintProperty(layer.id, 'fill-color', BRAND.blau);
      continue;
    }

    if (sourceLayer === 'landcover' && layer.type === 'fill') {
      const color = layer.id === 'landcover_sand' ? BRAND.groc : BRAND.oliva;
      map.setPaintProperty(layer.id, 'fill-color', color);
      map.setPaintProperty(layer.id, 'fill-opacity', 0.3);
      continue;
    }

    if (sourceLayer === 'park') {
      const prop = layer.type === 'line' ? 'line-color' : 'fill-color';
      map.setPaintProperty(layer.id, prop, BRAND.oliva);
      if (layer.type === 'fill') map.setPaintProperty(layer.id, 'fill-opacity', 0.22);
      continue;
    }

    if (layer.id === 'landuse_residential') {
      map.setPaintProperty(layer.id, 'fill-color', BRAND.terracota);
      map.setPaintProperty(layer.id, 'fill-opacity', 0.06);
      continue;
    }

    if (sourceLayer === 'building') {
      const prop = layer.type === 'fill-extrusion' ? 'fill-extrusion-color' : 'fill-color';
      map.setPaintProperty(layer.id, prop, BRAND.terracota);
      map.setPaintProperty(layer.id, layer.type === 'fill-extrusion' ? 'fill-extrusion-opacity' : 'fill-opacity', 0.45);
      continue;
    }

    if (sourceLayer === 'boundary') {
      map.setPaintProperty(layer.id, 'line-color', BRAND.ink);
      continue;
    }

    if (sourceLayer === 'transportation' && layer.type === 'line') {
      if (layer.id.includes('path_pedestrian')) {
        map.setPaintProperty(layer.id, 'line-color', BRAND.oliva);
      } else if (ROAD_LAYER_PREFIXES.some((prefix) => layer.id.startsWith(prefix))) {
        map.setPaintProperty(layer.id, 'line-color', layer.id.endsWith('_casing') ? BRAND.ink : BRAND.inkDim);
      }
      continue;
    }

    if (layer.type === 'symbol') {
      // The base map's own shops/restaurants/schools in their stock colours would
      // compete with our highlighted spots, so only ours are drawn.
      if (sourceLayer === 'poi') {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
        continue;
      }
      // 'text-color' is valid on every symbol layer regardless of its layout.
      map.setPaintProperty(layer.id, 'text-color', BRAND.ink);
      map.setPaintProperty(layer.id, 'text-halo-color', BRAND.calc);
    }
  }
}

/** A MapLibre map on the brand style, ready to use. */
export function createBrandMap(options: Omit<maplibregl.MapOptions, 'style'>): maplibregl.Map {
  // MapLibre's own `new Worker(new URL(...))` reference doesn't resolve
  // through Angular's build tooling, so it's pointed at the copy we serve
  // as a static asset instead (see angular.json's "assets").
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

  const map = new maplibregl.Map({ ...options, style: MAP_STYLE_URL });
  map.on('load', () => applyBrandTint(map));
  return map;
}

/**
 * The orange pin for a place. The big map's pins are buttons; the preview map
 * in a fitxa sits inside a link, so its pins are plain (non-interactive) spans.
 */
export function createPinElement(name: string, options: { label: boolean; interactive: boolean }): HTMLElement {
  const element = document.createElement(options.interactive ? 'button' : 'span');
  element.className = 'map-pin';
  if (element instanceof HTMLButtonElement) element.type = 'button';
  element.setAttribute('aria-label', name);

  if (options.label) {
    const label = document.createElement('span');
    label.className = 'map-pin__label';
    label.textContent = name;
    element.append(label);
  }
  return element;
}
