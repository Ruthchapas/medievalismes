import { inject, Injectable } from '@angular/core';
import { Collection } from '../models/collection.model';
import { ContentStore } from './content.store';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly store = inject(ContentStore);

  getBySlug(slug: string): Collection | undefined {
    return this.store.collections().find((collection) => collection.slug === slug);
  }

  getAll(): Collection[] {
    return this.store.collections();
  }
}
