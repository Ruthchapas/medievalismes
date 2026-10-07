import { Place } from '../models/place.model';

// Temporary in-memory content, standing in for the CMS. Rupit uses the real
// reference text from the brief; everything else is a placeholder shape.
export const MOCK_PLACES: Record<string, Place> = {
  rupit: {
    slug: 'rupit',
    name: 'Rupit',
    comarca: 'Osona',
    regio: 'Catalunya Central',
    habitants: 191,
    altitud: 850,
    lat: 41.9192,
    lng: 2.4658,
    categories: ['patrimoni', 'natura'],
    routeTag: 'Collsacabra',
    teaser: 'Cases de pedra dels segles XVI i XVII.',
    introText:
      "Pocs pobles han dut a terme una tasca de preservació dels edificis tan important com la que ha fet Rupit al llarg dels anys. El conjunt, format majoritàriament per cases dels segles XVI i XVII, l'ha convertit sens dubte en un dels més pintorescos del país.",
    contextText:
      "S'ubica al Collsacabra, un altiplà salvatge al nord-est de la Plana de Vic, abrupte i ple de cingleres. Visitar-lo durant la tardor és tota una experiència que, per molt que passi el temps, sempre recordes.",
    highlights: [
      { icon: 'castell', label: 'El carrer del Fossar, de forta inclinació' },
      { icon: 'esglesia', label: "L'església de Sant Miquel Arcàngel des de la plaça Major" },
      { icon: 'mirador', label: "L'ermita de Santa Magdalena" },
    ],
    gallery: ['', '', ''],
    nearby: [
      { slug: 'tavertet', name: 'Tavertet', distanceKm: 3.2 },
      { slug: 'sant-julia-de-cabrera', name: 'Sant Julià de Cabrera', distanceKm: 5 },
    ],
  },
  tavertet: {
    slug: 'tavertet',
    name: 'Tavertet',
    comarca: 'Osona',
    regio: 'Catalunya Central',
    habitants: 180,
    altitud: 760,
    lat: 41.9357,
    lng: 2.4419,
    categories: ['patrimoni', 'natura'],
    routeTag: 'Collsacabra',
    teaser: 'Un balcó sobre el pantà de Sau.',
    introText: 'Un balcó de pedra sobre el pantà de Sau, a tocar del cingle.',
    contextText: "Fitxa pendent d'ampliar amb el mateix nivell de detall que Rupit.",
    highlights: [{ icon: 'esglesia', label: 'Sant Cristòfol, al bell mig del poble' }],
    gallery: [],
    nearby: [{ slug: 'rupit', name: 'Rupit', distanceKm: 3.2 }],
  },
  'sant-julia-de-cabrera': {
    slug: 'sant-julia-de-cabrera',
    name: 'Sant Julià de Cabrera',
    comarca: 'Osona',
    regio: 'Catalunya Central',
    habitants: 0,
    altitud: 640,
    lat: 41.905,
    lng: 2.4459,
    categories: ['patrimoni'],
    teaser: 'Absis romànic entre alzinars.',
    introText: 'Una petita parròquia romànica entremig d’alzinars.',
    contextText: "Fitxa pendent d'ampliar amb el mateix nivell de detall que Rupit.",
    highlights: [{ icon: 'esglesia', label: 'Absis romànic del segle XII' }],
    gallery: [],
    nearby: [{ slug: 'rupit', name: 'Rupit', distanceKm: 5 }],
  },
};
