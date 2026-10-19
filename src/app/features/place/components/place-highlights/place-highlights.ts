import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlaceHighlight } from '../../../../core/models/place.model';
import { FilterService } from '../../../../core/services/filter.service';
import { PlaceIcon } from '../../../../shared/ui/place-icon/place-icon';

let uid = 0;

/**
 * "Punts destacats": a short list (drawing + name) where each row opens to its full description and,
 * when it has a location, a link that shows it on the map.
 */
@Component({
  selector: 'app-place-highlights',
  imports: [PlaceIcon, RouterLink],
  templateUrl: './place-highlights.html',
  styleUrl: './place-highlights.scss',
})
export class PlaceHighlights {
  highlights = input.required<PlaceHighlight[]>();
  placeSlug = input.required<string>();

  private readonly filters = inject(FilterService);
  protected readonly uid = uid++;
  private readonly openRows = signal<ReadonlySet<number>>(new Set());

  protected isOpen(index: number): boolean {
    return this.openRows().has(index);
  }

  protected toggle(index: number): void {
    const next = new Set(this.openRows());
    next.has(index) ? next.delete(index) : next.add(index);
    this.openRows.set(next);
  }

  protected hasLocation(highlight: PlaceHighlight): boolean {
    return highlight.lat !== undefined && highlight.lng !== undefined;
  }

  /** The person asked to see it on the map, so don't hide it behind a leftover search. */
  protected openMap(): void {
    this.filters.reset();
  }
}
