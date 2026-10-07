export interface CollectionItem {
  placeSlug: string;
  /** What this route highlights at that place — not just the place name. */
  highlight: string;
}

export interface Collection {
  slug: string;
  kicker: string;
  title: string;
  coverPhotoUrl?: string;
  intro: string;
  items: CollectionItem[];
}
