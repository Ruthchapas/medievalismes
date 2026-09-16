import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  private readonly currentUrl = signal(this.router.url);

  // The floating pill only makes sense on the three top-level destinations —
  // Fitxa, Col·lecció and Perfil are reached "into", not switched between.
  readonly showFloatingNav = computed(() =>
    ['/mapa', '/descobreix', '/desats'].some((path) => this.currentUrl().startsWith(path)),
  );

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.currentUrl.set((event as NavigationEnd).urlAfterRedirects);
    });
  }
}
