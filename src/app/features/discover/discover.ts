import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Place } from '../../core/models/place.model';
import { CollectionService } from '../../core/services/collection.service';
import { FilterService } from '../../core/services/filter.service';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';

interface ComarcaGroup {
  comarca: string;
  places: Place[];
}

@Component({
  selector: 'app-discover',
  imports: [FilterBar, RouterLink],
  templateUrl: './discover.html',
  styleUrl: './discover.scss',
})
export class Discover {
  private readonly collectionService = inject(CollectionService);
  protected readonly filters = inject(FilterService);

  protected readonly collections = this.collectionService.getAll();

  protected readonly groups = computed<ComarcaGroup[]>(() => {
    const byComarca = new globalThis.Map<string, Place[]>();
    for (const place of this.filters.places()) {
      const list = byComarca.get(place.comarca) ?? [];
      list.push(place);
      byComarca.set(place.comarca, list);
    }
    return [...byComarca.entries()].map(([comarca, places]) => ({ comarca, places }));
  });
}
