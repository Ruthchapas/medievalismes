import { computed, inject, Injectable } from '@angular/core';
import { Place } from '../models/place.model';
import { ContentStore } from './content.store';

@Injectable({ providedIn: 'root' })
export class PlaceService {
  private readonly store = inject(ContentStore);
  private readonly bySlug = computed(() => new Map(this.store.places().map((place) => [place.slug, place])));

  getBySlug(slug: string): Place | undefined {
    return this.bySlug().get(slug);
  }

  getAll(): Place[] {
    return this.store.places();
  }
}
