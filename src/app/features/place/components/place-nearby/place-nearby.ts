import { afterNextRender, Component, computed, DestroyRef, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as maplibregl from 'maplibre-gl';
import { distanceKm, formatKm } from '../../../../core/geo';
import { Place } from '../../../../core/models/place.model';
import { FilterService } from '../../../../core/services/filter.service';
import { PlaceService } from '../../../../core/services/place.service';
import { createBrandMap, createPinElement } from '../../../../shared/map/brand-map';

@Component({
  selector: 'app-place-nearby',
  imports: [RouterLink],
  templateUrl: './place-nearby.html',
  styleUrl: './place-nearby.scss',
})
export class PlaceNearby {
  place = input.required<Place>();

  private readonly placeService = inject(PlaceService);
  private readonly filters = inject(FilterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mapContainer = viewChild.required<ElementRef<HTMLElement>>('miniMap');

  private map?: maplibregl.Map;
  private markers: maplibregl.Marker[] = [];

  protected readonly nearby = computed(() =>
    this.place()
      .nearby.map((slug) => this.placeService.getBySlug(slug))
      .filter((other) => other !== undefined)
      .map((other) => ({ place: other, distance: formatKm(distanceKm(this.place(), other)) })),
  );

  constructor() {
    afterNextRender(() => {
      // Not interactive: a tap on the preview opens the full map instead of panning this one.
      this.map = createBrandMap({
        container: this.mapContainer().nativeElement,
        interactive: false,
        attributionControl: { compact: true },
      });
      this.destroyRef.onDestroy(() => this.map?.remove());
      this.render(this.place(), this.nearby().map((entry) => entry.place));
    });

    // The fitxa component is reused when you go from one place to another.
    effect(() =>
      this.render(
        this.place(),
        this.nearby().map((entry) => entry.place),
      ),
    );
  }

  /** The user asked to see this place on the map, so don't hide it behind a leftover search. */
  protected openMap(): void {
    this.filters.reset();
  }

  private render(place: Place, others: Place[]): void {
    const map = this.map;
    if (!map) return;

    for (const marker of this.markers) marker.remove();
    this.markers = [];

    const bounds = new maplibregl.LngLatBounds();
    const all = [{ place, label: true }, ...others.map((other) => ({ place: other, label: false }))];

    for (const { place: item, label } of all) {
      const element = createPinElement(item.name, { label, interactive: false });
      this.markers.push(new maplibregl.Marker({ element, anchor: 'bottom' }).setLngLat([item.lng, item.lat]).addTo(map));
      bounds.extend([item.lng, item.lat]);
    }

    map.fitBounds(bounds, { padding: { top: 40, bottom: 60, left: 50, right: 50 }, maxZoom: 13, animate: false });
  }
}
