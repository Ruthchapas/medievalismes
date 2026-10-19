import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { distanceKm, formatKm } from '../../../../core/geo';
import { Place } from '../../../../core/models/place.model';
import { FilterService } from '../../../../core/services/filter.service';
import { PlaceService } from '../../../../core/services/place.service';

/** How many neighbours to show under "A prop teu". */
const MAX_NEARBY = 4;

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

  /** The closest places, worked out from the coordinates, so nobody has to list them in the Studio. */
  protected readonly nearby = computed(() =>
    this.placeService
      .getAll()
      .filter((other) => other.slug !== this.place().slug)
      .map((other) => ({ place: other, km: distanceKm(this.place(), other) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, MAX_NEARBY)
      .map(({ place, km }) => ({ place, distance: formatKm(km) })),
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
