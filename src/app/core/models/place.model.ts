export type PlaceIconType = 'castell' | 'esglesia' | 'mirador' | 'sender';

export interface PlaceHighlight {
  icon: PlaceIconType;
  label: string;
}

export interface NearbyPlace {
  slug: string;
  name: string;
  distanceKm: number;
  photoUrl?: string;
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
  introText: string;
  contextText: string;
  highlights: PlaceHighlight[];
  gallery: string[];
  nearby: NearbyPlace[];
}
