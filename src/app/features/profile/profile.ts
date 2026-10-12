import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SavedService } from '../../core/services/saved.service';
import { BackButton } from '../../shared/ui/back-button/back-button';
import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, BackButton, Button],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly savedService = inject(SavedService);
  protected readonly savedCount = computed(() => this.savedService.slugs().size);

  protected readonly email = signal('');
  protected readonly editingName = signal(false);
  protected readonly nameDraft = signal('');
  protected readonly confirmingDelete = signal(false);

  ngOnInit(): void {
    // Opening the profile is the moment someone may want to sign in.
    void this.auth.start();
  }

  protected typed(signalToSet: { set(value: string): void }, event: Event): void {
    signalToSet.set((event.target as HTMLInputElement).value);
  }

  protected sendLink(event: Event): void {
    event.preventDefault();
    void this.auth.sendEmailLink(this.email());
  }

  protected confirmLink(event: Event): void {
    event.preventDefault();
    void this.auth.confirmEmailLink(this.email());
  }

  protected useAnotherEmail(): void {
    this.auth.linkSentTo.set(null);
  }

  protected startEditingName(): void {
    this.nameDraft.set(this.auth.name() ?? '');
    this.editingName.set(true);
  }

  protected async saveName(event: Event): Promise<void> {
    event.preventDefault();
    await this.auth.updateName(this.nameDraft());
    if (!this.auth.error()) this.editingName.set(false);
  }

  protected async deleteAccount(): Promise<void> {
    const deleted = await this.auth.deleteAccount(() => this.savedService.deleteRemote());
    if (!deleted) await this.savedService.pushNow();
    this.confirmingDelete.set(false);
  }
}
