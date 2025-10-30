import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { NgOptimizedImage } from '@angular/common';
import { interval, map, startWith } from 'rxjs';

@Component({
  selector: 'mell-home-page',
  imports: [RouterLink, ButtonModule, NgOptimizedImage],
  template: `
    <img
      [ngSrc]="mellImageSrc()"
      alt=""
      height="256"
      width="256"
      class="mx-auto size-64"
    />

    <h1 class="text-center text-3xl font-bold">
      Meet <span class="text-primary-700">Mell</span>
    </h1>

    <p class="py-5 text-center text-balance">
      Your community's watchful friend. Report local issues in seconds, track
      their progress, and help your community stay safe and clean,
      <strong>together</strong>.
    </p>

    <a routerLink="../new-issue" pButton class="p-button-rounded">
      Submit new issue
    </a>
    <a
      routerLink="../existing-issues"
      pButton
      class="p-button-secondary p-button-rounded"
    >
      Check on an existing issue
    </a>
  `,
  host: {
    class: 'flex flex-col gap-2',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePageComponent {
  readonly mellImageSrc = toSignal(
    interval(1500).pipe(
      map((tick) => (tick + 1) % 2),
      startWith(0),
      map(
        (index) => ['/images/mell-base.png', '/images/mell-waving.png'][index],
      ),
    ),
    { requireSync: true },
  );
}
