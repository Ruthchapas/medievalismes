import { UpperCasePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Place } from '../../../../core/models/place.model';

let uid = 0;

@Component({
  selector: 'app-place-header',
  imports: [RouterLink, UpperCasePipe],
  templateUrl: './place-header.html',
  styleUrl: './place-header.scss',
})
export class PlaceHeader {
  place = input.required<Place>();
  saved = input(false);
  savedChange = output<boolean>();

  /** Unique per instance so the watercolor filter never collides across cards. */
  protected readonly filterId = `place-wash-${uid++}`;

  protected readonly photoStyle = computed(() => {
    const url = this.place().photoUrl;
    return url ? { backgroundImage: `url(${url})` } : {};
  });

  toggleSaved() {
    this.savedChange.emit(!this.saved());
  }
}
