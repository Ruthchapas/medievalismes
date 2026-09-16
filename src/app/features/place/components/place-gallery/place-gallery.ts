import { Component, input } from '@angular/core';

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
  imports: [],
  templateUrl: './place-gallery.html',
  styleUrl: './place-gallery.scss',
})
export class PlaceGallery {
  photos = input<string[]>([]);

  protected thumbStyle(url: string, index: number) {
    if (url) {
      return { backgroundImage: `url(${url})` };
    }
    return { background: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length] };
  }
}
