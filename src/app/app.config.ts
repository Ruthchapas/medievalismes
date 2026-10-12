import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { ContentStore } from './core/services/content.store';
import { SavedService } from './core/services/saved.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // The app starts once the content has been read (or has fallen back to the sample).
    provideAppInitializer(() => inject(ContentStore).load()),
    // Restores a previous session in the background; it never holds the app back.
    provideAppInitializer(() => {
      inject(AuthService).init();
      // Created now so saved places sync from the first screen, whichever it is.
      inject(SavedService);
    }),
  ],
};
