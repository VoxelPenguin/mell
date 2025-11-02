import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withHashLocation } from '@angular/router';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),

    // PrimeNG still uses deprecated Angular animations
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: definePreset(Aura, {
          semantic: {
            primary: {
              50: '{orange.50}',
              100: '{orange.100}',
              200: '{orange.200}',
              300: '{orange.300}',
              400: '{orange.400}',
              500: '{orange.500}',
              600: '{orange.600}',
              700: '{orange.700}',
              800: '{orange.800}',
              900: '{orange.900}',
              950: '{orange.950}',
            },
          },
        }),
      },
    }),
  ],
};
