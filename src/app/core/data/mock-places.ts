import { Place } from '../models/place.model';
import { plainParagraphs } from '../models/rich-text';

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
    routeTag: 'Collsacabra',
    teaser: 'Cases de pedra dels segles XVI i XVII.',
    introText:
      plainParagraphs("Pocs pobles han dut a terme una tasca de preservació dels edificis tan important com la que ha fet Rupit al llarg dels anys. El conjunt, format majoritàriament per cases dels segles XVI i XVII, l'ha convertit sens dubte en un dels més pintorescos del país."),
    contextText:
      plainParagraphs("S’ubica al Collsacabra, un altiplà salvatge al nord-est de la Plana de Vic, abrupte i ple de cingleres. Visitar-lo durant la tardor és tota una experiència que, per molt que passi el temps, sempre recordes. L'últim cop que hi vaig anar, a mitjans d’un fred mes de novembre, recórrer amb cotxe la carretera que connecta Tavertet amb Rupit em feia sentir com si m’endinsés al cor del bosc, a l'origen del món. A primera hora del matí, aquell indret era l’imperi del silenci.\n\nRupit, però, és millor evitar-lo a les hores punta, especialment els caps de setmana. És un poble molt conegut pels catalans, que històricament l’han convertit en una destinació popular, tant perquè és punt de partida de destacades rutes de senderisme com perquè ofereix tot allò que necessita un barceloní per sentir que ha fugit de la ciutat durant un diumenge. En arribar, però, descobreix que no és l’únic que ha tingut aquella mateixa idea.\n\nCal dir que el turisme també ha comportat alguna cosa força positiva: la regulació de l’accés al poble, amb un gran aparcament a l’entrada, i la creació d’un espai lliure de cotxes. Això permet apreciar millor la bellesa de les façanes de pedra i posa en valor l'arquitectura tradicional."),
    highlights: [
      {
        icon: 'castell',
        name: 'Carrer del Fossar',
        label: "El carrer del Fossar, de forta inclinació, on el paviment és la mateixa roca repicada. Pujar-hi és gairebé com caminar per la mateixa pedra sobre la qual s’assenta el poble.",
        lat: 42.02416,
        lng: 2.4657,
      },
      {
        icon: 'esglesia',
        name: 'Sant Miquel Arcàngel',
        label: "La visió de l’església de Sant Miquel Arcàngel des de la plaça Major, una estampa que resumeix a la perfecció l’essència del barroc rural català.",
        lat: 42.02382,
        lng: 2.46503,
      },
      {
        icon: 'mirador',
        name: 'Santa Magdalena',
        label: "La curta excursió a peu fins a l’ermita de Santa Magdalena, des d’on es pot contemplar l’skyline del poble.",
        lat: 42.02247,
        lng: 2.46627,
      },
    ],
    gallery: ['', '', ''],
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
    routeTag: 'Collsacabra',
    teaser: 'Un balcó sobre el pantà de Sau.',
    introText: plainParagraphs('Un balcó de pedra sobre el pantà de Sau, a tocar del cingle.'),
    contextText: plainParagraphs("Fitxa pendent d'ampliar amb el mateix nivell de detall que Rupit."),
    // No location yet for the church, so it isn't drawn on the map.
    highlights: [{ icon: 'esglesia', name: 'Sant Cristòfol', label: 'Sant Cristòfol, al bell mig del poble' }],
    gallery: [],
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
    teaser: 'Absis romànic entre alzinars.',
    introText: plainParagraphs('Una petita parròquia romànica entremig d’alzinars.'),
    contextText: plainParagraphs("Fitxa pendent d'ampliar amb el mateix nivell de detall que Rupit."),
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
  },
};
