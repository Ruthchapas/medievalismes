import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ContentStore } from './core/services/content.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // The app starts once the content has been read (or has fallen back to the sample).
    provideAppInitializer(() => inject(ContentStore).load()),
  ],
};
