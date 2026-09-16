import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { PlaceService } from '../../core/services/place.service';
import { PlaceGallery } from './components/place-gallery/place-gallery';
import { PlaceHeader } from './components/place-header/place-header';
import { PlaceHighlights } from './components/place-highlights/place-highlights';
import { PlaceNearby } from './components/place-nearby/place-nearby';

@Component({
  selector: 'app-place',
  imports: [RouterLink, PlaceHeader, PlaceHighlights, PlaceGallery, PlaceNearby],
  templateUrl: './place.html',
  styleUrl: './place.scss',
})
export class Place {
  private readonly route = inject(ActivatedRoute);
  private readonly placeService = inject(PlaceService);

  private readonly slug = toSignal(this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')), {
    initialValue: '',
  });

  protected readonly place = computed(() => this.placeService.getBySlug(this.slug()));
  protected readonly saved = signal(false);
}
