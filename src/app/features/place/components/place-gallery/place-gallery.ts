import { Component, computed, input, signal } from '@angular/core';
import { resized } from '../../../../core/cms/image';
import { PhotoViewer } from '../photo-viewer/photo-viewer';

// Soft, low-contrast stand-ins for real photography — used whenever a photo
// URL isn't available yet (see the "toned-down gradient" note from FASE 1).
const FALLBACK_GRADIENTS = [
  'linear-gradient(155deg, #e6d2a8, #b9793e)',
  'linear-gradient(155deg, #cbd3ae, #8b9970)',
  'linear-gradient(155deg, #cfdada, #93a6aa)',
  'linear-gradient(155deg, #e0bfa0, #b57a5c)',
];

@Component({
  selector: 'app-place-gallery',
  imports: [PhotoViewer],
  templateUrl: './place-gallery.html',
  styleUrl: './place-gallery.scss',
})
export class PlaceGallery {
  photos = input<string[]>([]);
  /** The place's name, for the viewer's accessible description. */
  label = input('');

  /** Position (among the real photos) of the one open full screen, if any. */
  protected readonly openIndex = signal<number | null>(null);

  /** Only entries with an actual image can be opened. */
  protected readonly viewable = computed(() => this.photos().filter((url) => !!url));

  protected thumbStyle(url: string, index: number) {
    const image = url ? `url(${resized(url, 400)})` : FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
    return { backgroundImage: image };
  }

  protected open(url: string): void {
    this.openIndex.set(this.viewable().indexOf(url));
  }
}
