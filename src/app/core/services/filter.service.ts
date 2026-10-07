import { computed, inject, Injectable, signal } from '@angular/core';
import { Place, PlaceCategory } from '../models/place.model';
import { PlaceService } from './place.service';

export type CategoryFilter = 'tots' | PlaceCategory;

export const CATEGORY_OPTIONS: { id: CategoryFilter; label: string }[] = [
  { id: 'tots', label: 'Tots' },
  { id: 'patrimoni', label: 'Patrimoni' },
  { id: 'natura', label: 'Natura' },
];

export interface Suggestion {
  id: string;
  kind: 'place' | 'comarca';
  detail: string;
  /** The label split around the typed letters, so the UI can emphasise them. */
  before: string;
  match: string;
  after: string;
  /** Only for kind === 'place'. */
  slug?: string;
}

const MAX_SUGGESTIONS = 6;

/**
 * Lower-cases, drops accents and turns anything that isn't a letter or digit
 * into a space — one character in, one character out, so match offsets in the
 * folded text are valid offsets in the original label.
 */
const fold = (text: string) =>
  [...text]
    .map((char) => {
      const base = char.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()[0] ?? '';
      return /[a-z0-9]/.test(base) ? base : ' ';
    })
    .join('');

const prepareQuery = (text: string) => fold(text).replace(/\s+/g, ' ').trim();

/** 0 = starts with the query, 1 = a word starts with it, 2 = contains it, -1 = no match. */
function matchTier(text: string, query: string): number {
  const folded = fold(text);
  if (folded.startsWith(query)) return 0;
  if ((' ' + folded).includes(' ' + query)) return 1;
  if (folded.includes(query)) return 2;
  return -1;
}

function splitAroundMatch(label: string, query: string, tier: number) {
  const folded = fold(label);
  // Tier 1: in the space-padded text the match sits one character later than in the label.
  const start = tier === 0 ? 0 : tier === 1 ? (' ' + folded).indexOf(' ' + query) : folded.indexOf(query);
  const chars = [...label];
  return {
    before: chars.slice(0, start).join(''),
    match: chars.slice(start, start + query.length).join(''),
    after: chars.slice(start + query.length).join(''),
  };
}

/** Search + category state shared by Mapa and Descobreix, so both always agree. */
@Injectable({ providedIn: 'root' })
export class FilterService {
  private readonly placeService = inject(PlaceService);

  readonly query = signal('');
  readonly category = signal<CategoryFilter>('tots');

  readonly isActive = computed(() => this.query().trim() !== '' || this.category() !== 'tots');

  private inCategory(place: Place): boolean {
    const category = this.category();
    return category === 'tots' || place.categories.includes(category);
  }

  /** Places for the map and the list: matched by name, or by the start of their comarca/region/route. */
  readonly places = computed<Place[]>(() => {
    const query = prepareQuery(this.query());

    return this.placeService.getAll().filter((place) => {
      if (!this.inCategory(place)) return false;
      if (!query) return true;
      if (matchTier(place.name, query) >= 0) return true;
      return [place.comarca, place.regio, place.routeTag ?? ''].some((field) => {
        const tier = matchTier(field, query);
        return tier >= 0 && tier <= 1;
      });
    });
  });

  /** Autocomplete: only things whose name relates to the letters typed so far. */
  readonly suggestions = computed<Suggestion[]>(() => {
    const query = prepareQuery(this.query());
    if (!query) return [];

    const candidates = this.placeService.getAll().filter((place) => this.inCategory(place));
    const ranked: { tier: number; order: number; suggestion: Suggestion; sortLabel: string }[] = [];

    for (const comarca of new Set(candidates.map((place) => place.comarca))) {
      const tier = matchTier(comarca, query);
      if (tier < 0 || tier > 1) continue;
      ranked.push({
        tier,
        order: 0,
        sortLabel: comarca,
        suggestion: { id: `comarca:${comarca}`, kind: 'comarca', detail: 'Comarca', ...splitAroundMatch(comarca, query, tier) },
      });
    }

    for (const place of candidates) {
      const tier = matchTier(place.name, query);
      if (tier < 0) continue;
      ranked.push({
        tier,
        order: 1,
        sortLabel: place.name,
        suggestion: {
          id: `place:${place.slug}`,
          kind: 'place',
          detail: place.comarca,
          slug: place.slug,
          ...splitAroundMatch(place.name, query, tier),
        },
      });
    }

    return ranked
      .sort((a, b) => a.tier - b.tier || a.order - b.order || a.sortLabel.localeCompare(b.sortLabel, 'ca'))
      .slice(0, MAX_SUGGESTIONS)
      .map((entry) => entry.suggestion);
  });
}
