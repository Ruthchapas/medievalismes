import { RichText } from './rich-text';

export type PlaceIconType = 'castell' | 'esglesia' | 'mirador' | 'sender';

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
  routeTag?: string;
  photoUrl?: string;
  /** Short one-liner for list/grid cards — distinct from introText. */
  teaser?: string;
  introText: RichText;
  /** "El relat": one or more paragraphs. */
  contextText: RichText;
  highlights: PlaceHighlight[];
  /** Original image URLs; each use (thumbnail, full screen) asks for the size it needs. */
  gallery: string[];
}
