import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlaceService } from '../../core/services/place.service';
import { SavedService } from '../../core/services/saved.service';

@Component({
  selector: 'app-saved',
  imports: [RouterLink, UpperCasePipe],
  templateUrl: './saved.html',
  styleUrl: './saved.scss',
})
export class Saved {
  private readonly placeService = inject(PlaceService);
  private readonly savedService = inject(SavedService);

  protected readonly places = computed(() =>
    [...this.savedService.slugs()]
      .map((slug) => this.placeService.getBySlug(slug))
      .filter((place) => place !== undefined),
  );
}
