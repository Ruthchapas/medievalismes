import { Component, input } from '@angular/core';

/**
 * Static tag:      <span appChip variant="favorit">Destacat</span>
 * Filter toggle:   <button appChip [active]="selected">Patrimoni</button>
 */
@Component({
  selector: 'span[appChip], button[appChip]',
  imports: [],
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
  host: {
    '[class.favorit]': "variant() === 'favorit'",
    '[class.active]': 'active()',
  },
})
export class Chip {
  variant = input<'default' | 'favorit'>('default');
  active = input(false);
}
