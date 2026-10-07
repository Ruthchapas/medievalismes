import { DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { CollectionService } from '../../core/services/collection.service';
import { PlaceService } from '../../core/services/place.service';

@Component({
  selector: 'app-collection',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './collection.html',
  styleUrl: './collection.scss',
})
export class Collection {
  private readonly route = inject(ActivatedRoute);
  private readonly collectionService = inject(CollectionService);
  private readonly placeService = inject(PlaceService);

  private readonly slug = toSignal(this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')), {
    initialValue: '',
  });

  protected readonly collection = computed(() => this.collectionService.getBySlug(this.slug()));

  protected readonly rows = computed(() => {
    const collection = this.collection();
    if (!collection) return [];
    return collection.items
      .map((item) => {
        const place = this.placeService.getBySlug(item.placeSlug);
        return place ? { place, highlight: item.highlight } : undefined;
      })
      .filter((row) => row !== undefined);
  });
}
