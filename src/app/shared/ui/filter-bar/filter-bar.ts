import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CATEGORY_OPTIONS, FilterService, Suggestion } from '../../../core/services/filter.service';
import { Chip } from '../chip/chip';

@Component({
  selector: 'app-filter-bar',
  imports: [Chip, RouterLink],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss',
})
export class FilterBar {
  private readonly router = inject(Router);
  protected readonly filters = inject(FilterService);
  protected readonly categories = CATEGORY_OPTIONS;

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly suggestions = this.filters.suggestions;
  protected readonly listOpen = computed(() => this.open() && this.suggestions().length > 0);

  protected onSearch(event: Event) {
    this.filters.query.set((event.target as HTMLInputElement).value);
    this.open.set(true);
    this.activeIndex.set(-1);
  }

  protected onKeydown(event: KeyboardEvent) {
    const count = this.suggestions().length;

    switch (event.key) {
      case 'ArrowDown':
        if (!count) return;
        event.preventDefault();
        this.open.set(true);
        this.activeIndex.update((i) => (i + 1) % count);
        break;
      case 'ArrowUp':
        if (!count) return;
        event.preventDefault();
        this.open.set(true);
        this.activeIndex.update((i) => (i <= 0 ? count - 1 : i - 1));
        break;
      case 'Enter': {
        const active = this.suggestions()[this.activeIndex()];
        if (this.listOpen() && active) {
          event.preventDefault();
          this.pick(active);
        } else {
          this.open.set(false);
        }
        break;
      }
      case 'Escape':
        this.open.set(false);
        break;
    }
  }

  protected pick(suggestion: Suggestion) {
    this.open.set(false);
    this.activeIndex.set(-1);

    if (suggestion.kind === 'place') {
      // Going to the fitxa — leave the search clean for when the user comes back.
      this.filters.query.set('');
      this.router.navigate(['/lloc', suggestion.slug]);
    } else {
      this.filters.query.set(suggestion.before + suggestion.match + suggestion.after);
    }
  }
}
