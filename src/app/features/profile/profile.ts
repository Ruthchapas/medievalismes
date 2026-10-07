import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SavedService } from '../../core/services/saved.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly savedService = inject(SavedService);
  protected readonly savedCount = computed(() => this.savedService.slugs().size);
}
