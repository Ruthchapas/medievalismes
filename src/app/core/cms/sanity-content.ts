import { createClient } from '@sanity/client';
import { Collection } from '../models/collection.model';
import { Place, PlaceCategory, PlaceHighlight, PlaceIconType } from '../models/place.model';
import { CMS } from './cms.config';
import { resized } from './image';

const client = createClient({ ...CMS, useCdn: true });

const FETCH_TIMEOUT_MS = 8000;

// GROQ returns `null` for anything left empty in the Studio, hence the `| null`s below.
const PLACES_QUERY = `*[_type == "place" && defined(slug.current) && defined(lat) && defined(lng)] | order(name asc) {
  "slug": slug.current,
  name, comarca, regio, habitants, altitud, lat, lng, categories, routeTag, teaser, introText, contextText,
  "photoUrl": photo.asset->url,
  "highlights": highlights[]{ icon, name, label, lat, lng },
  "gallery": gallery[].asset->url,
  "nearby": nearby[]->slug.current
}`;

const COLLECTIONS_QUERY = `*[_type == "collection" && defined(slug.current)] | order(title asc) {
  "slug": slug.current,
  kicker, title, intro,
  "coverPhotoUrl": cover.asset->url,
  "items": items[defined(place)]{ "placeSlug": place->slug.current, highlight }
}`;

interface RawPlace {
  slug: string;
  name: string;
  comarca: string | null;
  regio: string | null;
  habitants: number | null;
  altitud: number | null;
  lat: number;
  lng: number;
  categories: string[] | null;
  routeTag: string | null;
  teaser: string | null;
  introText: string | null;
  contextText: string | null;
  photoUrl: string | null;
  highlights: { icon: string | null; name: string; label: string | null; lat: number | null; lng: number | null }[] | null;
  gallery: (string | null)[] | null;
  nearby: (string | null)[] | null;
}

interface RawCollection {
  slug: string;
  kicker: string | null;
  title: string;
  intro: string | null;
  coverPhotoUrl: string | null;
  items: { placeSlug: string | null; highlight: string | null }[] | null;
}

const CATEGORIES: PlaceCategory[] = ['patrimoni', 'natura'];
const ICONS: PlaceIconType[] = ['castell', 'esglesia', 'mirador', 'sender'];

const isCategory = (value: string): value is PlaceCategory => (CATEGORIES as string[]).includes(value);
const isIcon = (value: string | null): value is PlaceIconType => value !== null && (ICONS as string[]).includes(value);
const isString = (value: string | null): value is string => !!value;

function toHighlight(raw: NonNullable<RawPlace['highlights']>[number]): PlaceHighlight {
  return {
    icon: isIcon(raw.icon) ? raw.icon : 'castell',
    name: raw.name,
    label: raw.label ?? raw.name,
    lat: raw.lat ?? undefined,
    lng: raw.lng ?? undefined,
  };
}

function toPlace(raw: RawPlace): Place {
  return {
    slug: raw.slug,
    name: raw.name,
    comarca: raw.comarca ?? '',
    regio: raw.regio ?? '',
    habitants: raw.habitants ?? 0,
    altitud: raw.altitud ?? 0,
    lat: raw.lat,
    lng: raw.lng,
    categories: (raw.categories ?? []).filter(isCategory),
    routeTag: raw.routeTag ?? undefined,
    teaser: raw.teaser ?? undefined,
    photoUrl: raw.photoUrl ? resized(raw.photoUrl, 1600) : undefined,
    introText: raw.introText ?? '',
    contextText: raw.contextText ?? '',
    highlights: (raw.highlights ?? []).map(toHighlight),
    gallery: (raw.gallery ?? []).filter(isString),
    nearby: (raw.nearby ?? []).filter(isString),
  };
}

function toCollection(raw: RawCollection): Collection {
  return {
    slug: raw.slug,
    kicker: raw.kicker ?? '',
    title: raw.title,
    coverPhotoUrl: raw.coverPhotoUrl ? resized(raw.coverPhotoUrl, 1200) : undefined,
    intro: raw.intro ?? '',
    items: (raw.items ?? []).flatMap((item) =>
      item.placeSlug ? [{ placeSlug: item.placeSlug, highlight: item.highlight ?? '' }] : [],
    ),
  };
}

/** Everything the app shows, read from the published content in Sanity. */
export async function fetchContent(): Promise<{ places: Place[]; collections: Collection[] }> {
  const options = { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) };
  const [places, collections] = await Promise.all([
    client.fetch<RawPlace[]>(PLACES_QUERY, {}, options),
    client.fetch<RawCollection[]>(COLLECTIONS_QUERY, {}, options),
  ]);
  return { places: places.map(toPlace), collections: collections.map(toCollection) };
}
