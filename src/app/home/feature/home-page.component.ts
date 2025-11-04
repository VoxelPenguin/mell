import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { interval, map, startWith } from 'rxjs';
import { Community } from '../../../../types/db-types';
import { CommunityWithMapComponent } from '../../shared/ui/community-with-map.component';

@Component({
  selector: 'mell-home-page',
  imports: [
    RouterLink,
    ButtonModule,
    NgOptimizedImage,
    CommunityWithMapComponent,
  ],
  template: `
    <img
      [ngSrc]="mellImageSrc()"
      alt=""
      height="256"
      width="256"
      class="mx-auto size-64"
      priority
    />

    <h1 class="text-center text-3xl font-bold">
      Meet <span class="text-primary-700">Mell</span>
    </h1>

    <p class="py-5 text-center text-balance">
      Your community's watchful friend. Report local issues in seconds, track
      their progress, and help your community stay safe and clean,
      <strong>together</strong>.
    </p>

    <a routerLink="../new-issue" pButton> Submit new issue </a>
    <a routerLink="../existing-issues" pButton class="p-button-secondary">
      Check on an existing issue
    </a>

    <h2 class="mt-8 mb-5 text-center text-xl font-semibold text-balance">
      We proudly support all of these communities:
    </h2>

    <div class="flex flex-col gap-4">
      @for (community of allCommunities(); track community.id) {
        <mell-community-with-map [community]="community" />
      }
    </div>

    <div class="mt-10 mb-20 flex flex-col gap-3">
      <h2 class="text-center text-xl font-semibold">
        Don't see your community?
      </h2>

      <a pButton routerLink="../new-community">Add your community today!</a>
    </div>

    <a pButton class="p-button-secondary" routerLink="../communities">
      Community manager login
    </a>
  `,
  host: {
    class: 'flex flex-col gap-2',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePageComponent {
  readonly allCommunities = input.required<Community[]>();

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
