import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { distanceKm, formatKm } from '../../../../core/geo';
import { Place } from '../../../../core/models/place.model';
import { FilterService } from '../../../../core/services/filter.service';
import { PlaceService } from '../../../../core/services/place.service';

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

  protected readonly nearby = computed(() =>
    this.place()
      .nearby.map((slug) => this.placeService.getBySlug(slug))
      .filter((other) => other !== undefined)
      .map((other) => ({ place: other, distance: formatKm(distanceKm(this.place(), other)) })),
  );

  /** Highlights that have a location, i.e. the ones you'll find drawn on the map. */
  protected readonly locatedHighlights = computed(
    () => this.place().highlights.filter((highlight) => highlight.lat !== undefined && highlight.lng !== undefined).length,
  );

  /** The user asked to see this place on the map, so don't hide it behind a leftover search. */
  protected openMap(): void {
    this.filters.reset();
  }
}
