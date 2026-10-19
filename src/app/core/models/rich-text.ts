/** A run of text with the formatting the Studio allows: bold and italic. */
export interface RichSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export type RichParagraph = RichSpan[];
export type RichText = RichParagraph[];

/** Plain text with blank lines between paragraphs, as a RichText. */
export function plainParagraphs(text: string): RichText {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => [{ text: paragraph }]);
}

interface PortableBlock {
  _type?: string;
  children?: { text?: string; marks?: string[] }[];
}

/**
 * What the CMS sends for a text field: Sanity's block content (bold/italic marks on spans), or a plain
 * string — which is how these fields were stored before they could be formatted.
 */
export function toRichText(value: unknown): RichText {
  if (typeof value === 'string') return plainParagraphs(value);
  if (!Array.isArray(value)) return [];

  return (value as PortableBlock[])
    .filter((block) => block._type === 'block')
    .map((block) =>
      (block.children ?? [])
        .filter((child) => child.text)
        .map((child) => ({
          text: child.text!,
          bold: child.marks?.includes('strong') || undefined,
          italic: child.marks?.includes('em') || undefined,
        })),
    )
    .filter((paragraph) => paragraph.length > 0);
}
