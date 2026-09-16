import { Component, input } from '@angular/core';

/**
 * Usage: <button appButton variant="secondary">Guarda per després</button>
 * Renders as a native <button> so type/disabled/focus keep working for free.
 */
@Component({
  selector: 'button[appButton]',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  host: {
    '[class]': 'variant()',
  },
})
export class Button {
  variant = input<'primary' | 'secondary' | 'link'>('primary');
}
