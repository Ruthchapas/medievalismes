import { UpperCasePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Place } from '../../../../core/models/place.model';
import { BackButton } from '../../../../shared/ui/back-button/back-button';

let uid = 0;

// The ribbon is drawn wide and cropped to the screen (never stretched), so a
// tablet simply shows more leaves instead of a distorted drawing.
const RIBBON_WIDTH = 1600;
const LEAVES = Array.from({ length: 16 }, (_, i) => ({
  x: 50 + i * 100,
  y: 44 + Math.sin(i * 1.9) * 6,
  rotate: i % 2 ? 18 : -22,
}));
const OLIVES = [130, 450, 770, 1090, 1410];

@Component({
  selector: 'app-place-header',
  imports: [RouterLink, UpperCasePipe, BackButton],
  templateUrl: './place-header.html',
  styleUrl: './place-header.scss',
})
export class PlaceHeader {
  place = input.required<Place>();
  saved = input(false);
  savedChange = output<boolean>();

  /** Unique per instance so the watercolor filter never collides across cards. */
  protected readonly filterId = `place-wash-${uid++}`;

  protected readonly ribbonWidth = RIBBON_WIDTH;
  protected readonly leaves = LEAVES;
  protected readonly olives = OLIVES;

  protected readonly photoStyle = computed(() => {
    const url = this.place().photoUrl;
    return url ? { backgroundImage: `url(${url})` } : {};
  });

  /** A short confirmation ("Enllaç copiat") that fades away on its own. */
  protected readonly toast = signal<string | null>(null);
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.toastTimer));
  }

  toggleSaved() {
    this.savedChange.emit(!this.saved());
  }

  /**
   * Phones and tablets get their own share sheet (WhatsApp, Messages, AirDrop...).
   * Where there isn't one — most desktop browsers — the link is copied instead.
   */
  protected async share(): Promise<void> {
    const place = this.place();
    const data: ShareData = {
      title: `${place.name} · Medievalismes`,
      text: place.teaser ?? undefined,
      url: window.location.href,
    };

    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data);
      } catch (error) {
        // Closing the share sheet without choosing anything is not an error.
        if ((error as DOMException).name !== 'AbortError') this.showToast("No s'ha pogut compartir");
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(data.url!);
      this.showToast('Enllaç copiat');
    } catch {
      this.showToast("No s'ha pogut copiar l'enllaç");
    }
  }

  private showToast(message: string): void {
    clearTimeout(this.toastTimer);
    this.toast.set(message);
    this.toastTimer = setTimeout(() => this.toast.set(null), 2400);
  }
}
