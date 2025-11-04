import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime } from 'rxjs';
import { Community } from '../../../../types/db-types';
import { CommunityComponent } from '../../shared/ui/community.component';
import { SpeechBubbleComponent } from '../../shared/ui/speech-bubble.component';

@Component({
  selector: 'mell-communities-search-page',
  imports: [
    InputTextModule,
    FormsModule,
    CommunityComponent,
    SpeechBubbleComponent,
    LucideAngularModule,
    RouterLink,
  ],
  template: `
    <!-- Back Button -->
    <a class="flex h-full gap-1 self-start pt-3 pr-3 pb-3" routerLink="/">
      <lucide-icon [img]="ArrowLeft" />
    </a>

    <mell-speech-bubble class="self-start"
      >Let's find your community.</mell-speech-bubble
    >

    <input
      pInputText
      class="w-[30rem] self-start"
      type="text"
      placeholder="Start typing a community name"
      [(ngModel)]="searchString"
    />

    <div class="flex w-full flex-col gap-3">
      @for (community of communities(); track community.id) {
        <mell-community
          class="w-full"
          [name]="community.name"
          [logoUrl]="community.logoUrl"
          interactive
          (click)="onCommunityClick(community.id)"
        />
      }
    </div>
  `,
  host: {
    class: 'flex flex-col items-center gap-3 max-w-[50rem] mx-auto',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunitiesSearchPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly communities = input.required<Community[]>();

  readonly searchString = signal('');

  readonly searchNavigationSubscription = toObservable(this.searchString)
    .pipe(takeUntilDestroyed(), debounceTime(500))
    .subscribe((searchString) =>
      this.router.navigate([`../${searchString}`], {
        relativeTo: this.route,
      }),
    );

  onCommunityClick(communityId: Community['id']): void {
    this.router.navigate([`/communities/dashboard/${communityId}`]);
  }

  protected readonly ArrowLeft = ArrowLeft;
}
