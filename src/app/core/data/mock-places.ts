import { Place } from '../models/place.model';

// Temporary in-memory content, standing in for the CMS. Rupit uses the real
// reference text from the brief; everything else is a placeholder shape.
//
// Coordinates come from OpenStreetMap and are APPROXIMATE (village centres, and
// the nearest OSM node for each highlight). They are meant to be replaced by
// the real locations once they're entered in the CMS.
export const MOCK_PLACES: Record<string, Place> = {
  rupit: {
    slug: 'rupit',
    name: 'Rupit',
    comarca: 'Osona',
    regio: 'Catalunya Central',
    habitants: 191,
    altitud: 850,
    lat: 42.0243,
    lng: 2.4654,
    categories: ['patrimoni', 'natura'],
    routeTag: 'Collsacabra',
    teaser: 'Cases de pedra dels segles XVI i XVII.',
    introText:
      "Pocs pobles han dut a terme una tasca de preservació dels edificis tan important com la que ha fet Rupit al llarg dels anys. El conjunt, format majoritàriament per cases dels segles XVI i XVII, l'ha convertit sens dubte en un dels més pintorescos del país.",
    contextText:
      "S'ubica al Collsacabra, un altiplà salvatge al nord-est de la Plana de Vic, abrupte i ple de cingleres. Visitar-lo durant la tardor és tota una experiència que, per molt que passi el temps, sempre recordes.",
    highlights: [
      {
        icon: 'castell',
        name: 'Carrer del Fossar',
        label: 'El carrer del Fossar, de forta inclinació',
        lat: 42.02416,
        lng: 2.4657,
      },
      {
        icon: 'esglesia',
        name: 'Sant Miquel Arcàngel',
        label: "L'església de Sant Miquel Arcàngel des de la plaça Major",
        lat: 42.02382,
        lng: 2.46503,
      },
      {
        icon: 'mirador',
        name: 'Santa Magdalena',
        label: "L'ermita de Santa Magdalena",
        lat: 42.02247,
        lng: 2.46627,
      },
    ],
    gallery: ['', '', ''],
    nearby: ['tavertet', 'sant-julia-de-cabrera'],
  },
  tavertet: {
    slug: 'tavertet',
    name: 'Tavertet',
    comarca: 'Osona',
    regio: 'Catalunya Central',
    habitants: 180,
    altitud: 760,
    lat: 41.9956,
    lng: 2.4183,
    categories: ['patrimoni', 'natura'],
    routeTag: 'Collsacabra',
    teaser: 'Un balcó sobre el pantà de Sau.',
    introText: 'Un balcó de pedra sobre el pantà de Sau, a tocar del cingle.',
    contextText: "Fitxa pendent d'ampliar amb el mateix nivell de detall que Rupit.",
    // No location yet for the church, so it isn't drawn on the map.
    highlights: [{ icon: 'esglesia', name: 'Sant Cristòfol', label: 'Sant Cristòfol, al bell mig del poble' }],
    gallery: [],
    nearby: ['rupit'],
  },
  'sant-julia-de-cabrera': {
    slug: 'sant-julia-de-cabrera',
    name: 'Sant Julià de Cabrera',
    comarca: 'Osona',
    regio: 'Catalunya Central',
    habitants: 0,
    altitud: 640,
    lat: 42.0719,
    lng: 2.3974,
    categories: ['patrimoni'],
    teaser: 'Absis romànic entre alzinars.',
    introText: 'Una petita parròquia romànica entremig d’alzinars.',
    contextText: "Fitxa pendent d'ampliar amb el mateix nivell de detall que Rupit.",
    highlights: [
      {
        icon: 'esglesia',
        name: 'Absis romànic',
        label: 'Absis romànic del segle XII',
        lat: 42.07204,
        lng: 2.39696,
      },
    ],
    gallery: [],
    nearby: ['rupit'],
  },
};
