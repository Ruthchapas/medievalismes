import { afterNextRender, Component, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { Router } from '@angular/router';
import { PlaceService } from '../../core/services/place.service';
import { Chip } from '../../shared/ui/chip/chip';
import { applyBrandTint, MAP_STYLE_URL } from './map-style';

@Component({
  selector: 'app-map',
  imports: [Chip],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map {
  private readonly placeService = inject(PlaceService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly mapContainer = viewChild.required<ElementRef<HTMLElement>>('mapContainer');

  constructor() {
    afterNextRender(() => this.initMap());
  }

  private initMap(): void {
    // MapLibre's own `new Worker(new URL(...))` reference doesn't resolve
    // through Angular's build tooling, so it's pointed at the copy we serve
    // as a static asset instead (see angular.json's "assets").
    maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

    const map = new maplibregl.Map({
      container: this.mapContainer().nativeElement,
      style: MAP_STYLE_URL,
      center: [2.4658, 41.9192], // Rupit — Collsacabra
      zoom: 12.5,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.on('load', () => applyBrandTint(map));

    for (const place of this.placeService.getAll()) {
      const el = document.createElement('button');
      el.className = 'map-pin';
      el.type = 'button';
      el.setAttribute('aria-label', place.name);
      el.addEventListener('click', () => this.router.navigate(['/lloc', place.slug]));
      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([place.lng, place.lat])
        .addTo(map);
    }

    this.destroyRef.onDestroy(() => map.remove());
  }
}
