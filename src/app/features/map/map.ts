import {
  afterNextRender,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { Router } from '@angular/router';
import { FilterService } from '../../core/services/filter.service';
import { PlaceService } from '../../core/services/place.service';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { applyBrandTint, MAP_STYLE_URL } from './map-style';

const LABELS_MIN_ZOOM = 10.5;

@Component({
  selector: 'app-map',
  imports: [FilterBar],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map {
  private readonly placeService = inject(PlaceService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly filters = inject(FilterService);

  private readonly mapContainer = viewChild.required<ElementRef<HTMLElement>>('mapContainer');

  private map?: maplibregl.Map;
  private readonly pins = new globalThis.Map<string, { element: HTMLElement; lngLat: [number, number] }>();

  constructor() {
    afterNextRender(() => this.initMap());
    effect(() => this.syncPins(this.filters.places().map((place) => place.slug)));
  }

  private initMap(): void {
    // MapLibre's own `new Worker(new URL(...))` reference doesn't resolve
    // through Angular's build tooling, so it's pointed at the copy we serve
    // as a static asset instead (see angular.json's "assets").
    maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

    const map = new maplibregl.Map({
      container: this.mapContainer().nativeElement,
      style: MAP_STYLE_URL,
      // Open framing every place, with room at the sides for the names under the pins.
      bounds: this.placeBounds(),
      fitBoundsOptions: { padding: { top: 150, bottom: 130, left: 110, right: 110 }, maxZoom: 13 },
      attributionControl: { compact: true },
    });
    this.map = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.on('load', () => applyBrandTint(map));

    // Names sit under the pins; far enough out they'd overlap, so they hide.
    const updateLabels = () => map.getContainer().classList.toggle('hide-pin-labels', map.getZoom() < LABELS_MIN_ZOOM);
    map.on('zoom', updateLabels);
    updateLabels();

    for (const place of this.placeService.getAll()) {
      const element = document.createElement('button');
      element.className = 'map-pin';
      element.type = 'button';
      element.setAttribute('aria-label', place.name);
      element.addEventListener('click', () => this.router.navigate(['/lloc', place.slug]));

      const label = document.createElement('span');
      label.className = 'map-pin__label';
      label.textContent = place.name;
      element.append(label);

      new maplibregl.Marker({ element, anchor: 'bottom' }).setLngLat([place.lng, place.lat]).addTo(map);
      this.pins.set(place.slug, { element, lngLat: [place.lng, place.lat] });
    }

    this.syncPins(this.filters.places().map((place) => place.slug));
    this.destroyRef.onDestroy(() => map.remove());
  }

  private placeBounds(): maplibregl.LngLatBounds {
    const bounds = new maplibregl.LngLatBounds();
    for (const place of this.placeService.getAll()) bounds.extend([place.lng, place.lat]);
    return bounds;
  }

  /** Shows only the pins that match the current filter and frames them. */
  private syncPins(visibleSlugs: string[]): void {
    if (!this.map) return;

    const visible = new Set(visibleSlugs);
    const bounds = new maplibregl.LngLatBounds();

    for (const [slug, pin] of this.pins) {
      const isVisible = visible.has(slug);
      pin.element.style.display = isVisible ? '' : 'none';
      if (isVisible) bounds.extend(pin.lngLat);
    }

    if (this.filters.isActive() && !bounds.isEmpty()) {
      this.map.fitBounds(bounds, {
        padding: { top: 150, bottom: 130, left: 60, right: 60 },
        maxZoom: 13.5,
        duration: 600,
      });
    }
  }
}
