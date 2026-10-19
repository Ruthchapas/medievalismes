import { defineField, defineType } from 'sanity';

/** A point of interest inside a place: the street, the church, the viewpoint... */
export const highlight = defineType({
  name: 'highlight',
  title: 'Punt destacat',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: 'Dibuix',
      type: 'string',
      description: 'El dibuix que surt a la fitxa i al mapa.',
      options: {
        list: [
          { title: 'Castell, carrer o edifici', value: 'castell' },
          { title: 'Església', value: 'esglesia' },
          { title: 'Mirador o ermita', value: 'mirador' },
          { title: 'Sender', value: 'sender' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Nom curt',
      type: 'string',
      description: 'Surt al mapa, sota el dibuix. Ex.: "Sant Miquel Arcàngel".',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'label',
      title: 'Descripció',
      type: 'text',
      rows: 3,
      description: 'El text de la llista "Punts destacats": pot ser una o dues frases.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lat',
      title: 'Latitud',
      type: 'number',
      description:
        'On és. Es pot copiar amb clic dret sobre el punt a Google Maps o OpenStreetMap. Si no es posa, el punt no surt al mapa.',
      validation: (rule) => rule.min(40).max(43),
    }),
    defineField({
      name: 'lng',
      title: 'Longitud',
      type: 'number',
      validation: (rule) => rule.min(0).max(4),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'label', lat: 'lat' },
    prepare: ({ title, subtitle, lat }) => ({
      title,
      subtitle: `${lat === undefined ? 'Sense ubicació · ' : ''}${subtitle ?? ''}`,
    }),
  },
});
