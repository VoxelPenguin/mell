import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withHashLocation,
  withInMemoryScrolling,
} from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { ConfirmationService } from 'primeng/api';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { harperCredentialsInterceptor } from './shared/data-access/harper-credentials.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withHashLocation(),
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(withInterceptors([harperCredentialsInterceptor])),
    provideHttpClient(),

    // PrimeNG still uses deprecated Angular animations
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: definePreset(Aura, {
          semantic: {
            primary: {
              50: '{orange.100}',
              100: '{orange.200}',
              200: '{orange.300}',
              300: '{orange.400}',
              400: '{orange.500}',
              500: '{orange.600}',
              600: '{orange.700}',
              700: '{orange.800}',
              800: '{orange.900}',
              900: '{orange.950}',
              950: '{orange.950}',
            },
          },
        }),
        options: {
          darkModeSelector: false,
        },
      },
    }),
    ConfirmationService,
  ],
};
