import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { resized } from '../../../../core/cms/image';

const SWIPE_MIN_PX = 50;
/** Moving more than this between touching and lifting counts as a swipe, not a tap. */
const TAP_SLOP_PX = 10;

/** Full-screen photo viewer: swipe, arrows or keyboard to move between photos. */
@Component({
  selector: 'app-photo-viewer',
  imports: [],
  templateUrl: './photo-viewer.html',
  styleUrl: './photo-viewer.scss',
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class PhotoViewer {
  /** Original image URLs. */
  photos = input.required<string[]>();
  startIndex = input(0);
  /** What the photos are of (e.g. the place name), for the accessible description. */
  label = input('');
  closed = output<void>();

  protected readonly index = linkedSignal(() => this.startIndex());
  protected readonly count = computed(() => this.photos().length);
  protected readonly large = computed(() => resized(this.photos()[this.index()], 1600));
  /** Already cached from the gallery, so it appears at once while the large one loads. */
  protected readonly placeholder = computed(() => resized(this.photos()[this.index()], 400));
  protected readonly loaded = signal(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly closeButton = viewChild.required<ElementRef<HTMLButtonElement>>('closeButton');
  private pointerStart: { x: number; y: number } | null = null;
  private swiped = false;

  constructor() {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    afterNextRender(() => this.closeButton().nativeElement.focus());
    inject(DestroyRef).onDestroy(() => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    });

    // A new photo starts faded out until it has loaded.
    effect(() => {
      this.index();
      this.loaded.set(false);
    });

    // Load the neighbours ahead of time so swiping feels instant.
    effect(() => {
      const photos = this.photos();
      const i = this.index();
      for (const neighbour of [photos[(i + 1) % photos.length], photos[(i - 1 + photos.length) % photos.length]]) {
        new Image().src = resized(neighbour, 1600);
      }
    });
  }

  protected next(): void {
    this.index.update((i) => (i + 1) % this.count());
  }

  protected previous(): void {
    this.index.update((i) => (i - 1 + this.count()) % this.count());
  }

  protected onPointerDown(event: PointerEvent): void {
    this.pointerStart = { x: event.clientX, y: event.clientY };
    this.swiped = false;
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.pointerStart) return;
    const dx = event.clientX - this.pointerStart.x;
    const dy = event.clientY - this.pointerStart.y;
    this.pointerStart = null;

    this.swiped = Math.hypot(dx, dy) > TAP_SLOP_PX;
    if (this.count() > 1 && Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? this.next() : this.previous();
    }
  }

  /** Tapping the dark area around the photo closes the viewer — but not at the end of a swipe. */
  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.swiped) this.closed.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.closed.emit();
        break;
      case 'ArrowRight':
        if (this.count() > 1) this.next();
        break;
      case 'ArrowLeft':
        if (this.count() > 1) this.previous();
        break;
      case 'Tab':
        this.keepFocusInside(event);
        break;
    }
  }

  /** The viewer is modal, so Tab cycles through its own buttons instead of the page behind. */
  private keepFocusInside(event: KeyboardEvent): void {
    const buttons = [...this.host.nativeElement.querySelectorAll('button')];
    if (!buttons.length) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
