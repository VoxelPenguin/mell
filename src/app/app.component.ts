import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { filter, map, mergeMap } from 'rxjs';

@Component({
  selector: 'mell-root',
  imports: [RouterOutlet],
  template: ` <router-outlet /> `,
  host: {
    '[class.max-w-xl]': '!preferDesktop()',
    '[class.mx-auto]': '!preferDesktop()',
  },
})
export class AppComponent {
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly destroyRef = inject(DestroyRef);

  protected readonly title = signal('mell');

  // route data is normally accessible outside of a router-outlet
  // https://stackoverflow.com/questions/43512695/how-to-get-route-data-into-app-component-in-angular-2
  readonly routeData = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.route),
      map((route) => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route) => route.data),
    ),
  );

  readonly preferDesktop = computed(
    () => (this.routeData()?.['preferDesktop'] as boolean | undefined) ?? false,
  );
}
