import { Injectable, signal } from '@angular/core';
import { fetchContent } from '../cms/sanity-content';
import { MOCK_COLLECTIONS } from '../data/mock-collections';
import { MOCK_PLACES } from '../data/mock-places';
import { Collection } from '../models/collection.model';
import { Place } from '../models/place.model';

/**
 * All the content, loaded once before the app starts (see app.config.ts) so
 * the rest of the app can keep reading it synchronously.
 *
 * If the CMS can't be reached, or has nothing published yet, the bundled sample
 * content is used instead so the app still works — `source` says which one it is.
 */
@Injectable({ providedIn: 'root' })
export class ContentStore {
  private readonly _places = signal<Place[]>([]);
  private readonly _collections = signal<Collection[]>([]);

  readonly places = this._places.asReadonly();
  readonly collections = this._collections.asReadonly();
  readonly source = signal<'cms' | 'sample'>('sample');

  async load(): Promise<void> {
    try {
      const content = await fetchContent();
      if (content.places.length === 0) throw new Error('Nothing published in the CMS yet.');

      this._places.set(content.places);
      this._collections.set(content.collections);
      this.source.set('cms');
    } catch (error) {
      console.warn('[CMS] Showing the bundled sample content instead:', error);
      this._places.set(Object.values(MOCK_PLACES));
      this._collections.set(Object.values(MOCK_COLLECTIONS));
      this.source.set('sample');
    }
  }
}
