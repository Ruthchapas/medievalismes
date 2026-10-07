import { Collection } from '../models/collection.model';

export const MOCK_COLLECTIONS: Record<string, Collection> = {
  'esglesies-romaniques-collsacabra': {
    slug: 'esglesies-romaniques-collsacabra',
    kicker: 'Una sèrie de',
    title: 'Esglésies romàniques del Collsacabra',
    intro:
      "Tres parades per entendre com el romànic rural es va adaptar a la pedra i al vent d'aquest altiplà.",
    items: [
      { placeSlug: 'rupit', highlight: 'Sant Miquel Arcàngel' },
      { placeSlug: 'tavertet', highlight: 'Sant Cristòfol' },
      { placeSlug: 'sant-julia-de-cabrera', highlight: 'Absis romànic del segle XII' },
    ],
  },
};
