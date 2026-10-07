import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Place } from '../../core/models/place.model';
import { CollectionService } from '../../core/services/collection.service';
import { PlaceService } from '../../core/services/place.service';
import { Chip } from '../../shared/ui/chip/chip';

interface ComarcaGroup {
  comarca: string;
  places: Place[];
}

@Component({
  selector: 'app-discover',
  imports: [Chip, RouterLink],
  templateUrl: './discover.html',
  styleUrl: './discover.scss',
})
export class Discover {
  private readonly placeService = inject(PlaceService);
  private readonly collectionService = inject(CollectionService);

  protected readonly collections = this.collectionService.getAll();

  protected readonly groups = computed<ComarcaGroup[]>(() => {
    const byComarca = new Map<string, Place[]>();
    for (const place of this.placeService.getAll()) {
      const list = byComarca.get(place.comarca) ?? [];
      list.push(place);
      byComarca.set(place.comarca, list);
    }
    return [...byComarca.entries()].map(([comarca, places]) => ({ comarca, places }));
  });
}
