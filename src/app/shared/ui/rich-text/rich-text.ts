import { Component, input } from '@angular/core';
import { RichText } from '../../../core/models/rich-text';

/** Paragraphs of text with bold and italic runs. `variant="context"` is the smaller reading size. */
@Component({
  selector: 'app-rich-text',
  templateUrl: './rich-text.html',
  styleUrl: './rich-text.scss',
  host: { '[class.context]': "variant() === 'context'" },
})
export class RichTextView {
  paragraphs = input.required<RichText>();
  variant = input<'intro' | 'context'>('intro');
}
