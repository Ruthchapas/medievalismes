import { defineArrayMember, defineField, defineType } from 'sanity';

/** An editorial route: an ordered series of places ("Esglésies romàniques del Collsacabra"). */
export const collection = defineType({
  name: 'collection',
  title: 'Col·lecció',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Títol', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      title: 'Adreça',
      type: 'slug',
      description: 'Surt a l\'enllaç (/coleccio/...). Prem "Generate" i no la canviïs després.',
      options: { source: 'title', maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kicker',
      title: 'Etiqueta',
      type: 'string',
      description: 'La frase en lletra gòtica sobre el títol.',
      initialValue: 'Una sèrie de',
    }),
    defineField({ name: 'intro', title: 'Introducció', type: 'text', rows: 4 }),
    defineField({ name: 'cover', title: 'Foto de portada', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'items',
      title: 'Parades',
      type: 'array',
      description: 'L\'ordre és l\'ordre de la ruta. Arrossega per canviar-lo.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stop',
          title: 'Parada',
          fields: [
            defineField({
              name: 'place',
              title: 'Lloc',
              type: 'reference',
              to: [{ type: 'place' }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'highlight',
              title: 'Què es veu a la parada',
              type: 'string',
              description: 'Ex.: "Sant Miquel Arcàngel".',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'place.name', subtitle: 'highlight' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', media: 'cover' },
  },
});
