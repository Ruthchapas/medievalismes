import { Component, input } from '@angular/core';
import { PlaceHighlight } from '../../../../core/models/place.model';
import { PlaceIcon } from '../../../../shared/ui/place-icon/place-icon';

@Component({
  selector: 'app-place-highlights',
  imports: [PlaceIcon],
  templateUrl: './place-highlights.html',
  styleUrl: './place-highlights.scss',
})
export class PlaceHighlights {
  highlights = input.required<PlaceHighlight[]>();
}
