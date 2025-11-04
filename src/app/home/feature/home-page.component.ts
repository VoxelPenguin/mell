import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { interval, map, startWith } from 'rxjs';
import { Community } from '../../../../types/db-types';
import { CommunityWithMapComponent } from '../../shared/ui/community-with-map.component';
import { LogIn, LucideAngularModule } from 'lucide-angular';

const MELL_IMAGES = [
  '/images/mell-waving.webp',
  '/images/mell-manhole.webp',
  '/images/mell-tree.webp',
  '/images/mell-pothole.webp',
];

@Component({
  selector: 'mell-home-page',
  imports: [
    RouterLink,
    ButtonModule,
    CommunityWithMapComponent,
    LucideAngularModule,
  ],
  template: `
    <img [src]="mellImageSrc()" alt="" class="mx-auto size-64" />

    <h1 class="text-center text-3xl font-bold">
      Meet <span class="text-primary-700">Mell</span>
    </h1>

    <p class="py-5 text-center text-balance">
      Your community's watchful friend. Report local issues in seconds, track
      their progress, and help keep your community safe and clean!
    </p>

    <a routerLink="../new-issue" pButton> Submit new issue </a>
    <a routerLink="../existing-issues" pButton class="p-button-secondary">
      Check on an existing issue
    </a>

    <h2 class="mt-8 mb-5 text-center text-xl font-semibold text-balance">
      We proudly serve all of these communities:
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
      <lucide-icon [img]="LogIn" size="20" />

      Community manager login
    </a>
  `,
  host: {
    class: 'flex flex-col gap-2 pt-8',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePageComponent {
  readonly allCommunities = input.required<Community[]>();

  readonly mellImageSrc = toSignal(
    interval(3000).pipe(
      map((tick) => (tick + 1) % MELL_IMAGES.length),
      startWith(0),
      map((index) => MELL_IMAGES[index]),
    ),
    { requireSync: true },
  );

  protected readonly LogIn = LogIn;
}
