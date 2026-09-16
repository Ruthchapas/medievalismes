import { Injectable } from '@angular/core';
import { Place } from '../models/place.model';
import { MOCK_PLACES } from '../data/mock-places';

// Thin seam over the content source. Today it reads the in-memory mock;
// swapping in the real CMS client later means changing only this file.
@Injectable({ providedIn: 'root' })
export class PlaceService {
  getBySlug(slug: string): Place | undefined {
    return MOCK_PLACES[slug];
  }

  getAll(): Place[] {
    return Object.values(MOCK_PLACES);
  }
}
