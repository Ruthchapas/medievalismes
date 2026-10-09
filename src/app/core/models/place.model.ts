export type PlaceIconType = 'castell' | 'esglesia' | 'mirador' | 'sender';

export type PlaceCategory = 'patrimoni' | 'natura';

export interface PlaceHighlight {
  icon: PlaceIconType;
  /** Short name, used on the map ("Sant Miquel Arcàngel"). */
  name: string;
  /** Longer description, used in the fitxa and in the map card. */
  label: string;
  /** Where it is. Optional: a highlight without a location is simply not drawn on the map. */
  lat?: number;
  lng?: number;
}

export interface Place {
  slug: string;
  name: string;
  comarca: string;
  regio: string;
  habitants: number;
  altitud: number;
  lat: number;
  lng: number;
  categories: PlaceCategory[];
  routeTag?: string;
  photoUrl?: string;
  /** Short one-liner for list/grid cards — distinct from introText. */
  teaser?: string;
  introText: string;
  contextText: string;
  highlights: PlaceHighlight[];
  /** Original image URLs; each use (thumbnail, full screen) asks for the size it needs. */
  gallery: string[];
  /** Slugs of nearby places; distances are worked out from the coordinates. */
  nearby: string[];
}
