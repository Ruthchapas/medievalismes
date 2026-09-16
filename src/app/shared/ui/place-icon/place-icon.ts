import { Component, input } from '@angular/core';
import { PlaceIconType } from '../../../core/models/place.model';

/** The four system-calibrated icons from Jerarquia Visual, in one switcher. */
@Component({
  selector: 'app-place-icon',
  imports: [],
  templateUrl: './place-icon.html',
  styleUrl: './place-icon.scss',
})
export class PlaceIcon {
  type = input.required<PlaceIconType>();
}
