import { Component, input } from '@angular/core';

/** Usage: <span appChip variant="favorit">Destacat</span> */
@Component({
  selector: 'span[appChip]',
  imports: [],
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
  host: {
    '[class]': 'variant()',
  },
})
export class Chip {
  variant = input<'default' | 'favorit'>('default');
}
