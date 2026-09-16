import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NearbyPlace } from '../../../../core/models/place.model';

@Component({
  selector: 'app-place-nearby',
  imports: [RouterLink],
  templateUrl: './place-nearby.html',
  styleUrl: './place-nearby.scss',
})
export class PlaceNearby {
  nearby = input<NearbyPlace[]>([]);
}
