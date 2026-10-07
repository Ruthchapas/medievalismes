import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SavedService } from '../../core/services/saved.service';
import { BackButton } from '../../shared/ui/back-button/back-button';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, BackButton],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly savedService = inject(SavedService);
  protected readonly savedCount = computed(() => this.savedService.slugs().size);
}
