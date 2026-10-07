import { Injectable } from '@angular/core';
import { Collection } from '../models/collection.model';
import { MOCK_COLLECTIONS } from '../data/mock-collections';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  getBySlug(slug: string): Collection | undefined {
    return MOCK_COLLECTIONS[slug];
  }

  getAll(): Collection[] {
    return Object.values(MOCK_COLLECTIONS);
  }
}
