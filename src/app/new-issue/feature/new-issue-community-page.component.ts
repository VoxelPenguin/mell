import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Community } from '../../../../types/db-types';
import { NgOptimizedImage } from '@angular/common';
import { SpeechBubbleComponent } from '../../shared/ui/speech-bubble.component';
import { ButtonDirective } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { NewIssueFormService } from '../data-access/new-issue-form.service';

@Component({
  selector: 'mell-new-issue-choose-community-page',
  imports: [
    NgOptimizedImage,
    SpeechBubbleComponent,
    ButtonDirective,
    RouterLink,
  ],
  template: `
    @if (multipleMatchingCommunities()) {
      <mell-speech-bubble imageUrl="/images/mell-pirate.png">
        It looks like this location is within multiple communities! Which
        community should we report the issue to?
      </mell-speech-bubble>

      @for (community of communities(); track community.id) {
        <button
          pButton
          class="flex gap-3"
          (click)="chooseCommunity(community.id)"
        >
          @if (community.logoUrl; as logoUrl) {
            <img
              [ngSrc]="logoUrl"
              alt=""
              height="32"
              width="32"
              class="size-8 shrink-0 rounded-full"
            />
          }

          {{ community.name }}
        </button>
      }

      <a
        pButton
        class="p-button-secondary"
        routerLink="../prompt-create-new-community"
      >
        None of the above
      </a>
    } @else if (singleMatchingCommunity()) {
      <mell-speech-bubble imageUrl="/images/mell-pirate.png">
        It looks like this issue is within
        <span class="font-semibold">{{ firstCommunity().name }}</span
        >. Is that correct?
      </mell-speech-bubble>

      <div
        class="flex flex-col items-center gap-4 self-center rounded-2xl bg-white p-6"
      >
        @if (firstCommunity().logoUrl; as logoUrl) {
          <img [src]="logoUrl" class="size-30 rounded-full" alt="" />
        }

        <p class="text-center text-xl font-bold text-balance">
          {{ firstCommunity().name }}
        </p>
      </div>

      <button pButton (click)="chooseCommunity(firstCommunity().id)">
        Yes
      </button>

      <a
        pButton
        class="p-button-secondary"
        routerLink="../prompt-create-new-community"
      >
        No
      </a>
    } @else {
      <mell-speech-bubble>
        It looks like there aren't any communities set up in your area yet.
        Would you like to create one?
      </mell-speech-bubble>

      <a pButton routerLink="/new-community">Yes, create new community</a>
    }
  `,
  host: {
    class: 'flex flex-col gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewIssueCommunityPageComponent {
  private readonly newIssueFormService = inject(NewIssueFormService);
  private readonly router = inject(Router);

  readonly formValue = this.newIssueFormService.formValue;

  readonly communities = input.required<Community[]>();

  readonly multipleMatchingCommunities = computed(
    () => this.communities().length > 1,
  );
  readonly singleMatchingCommunity = computed(
    () => this.communities().length === 1,
  );

  readonly firstCommunity = computed(() => this.communities()[0]);

  chooseCommunity(communityId: Community['id']): void {
    this.formValue.update((value) => ({
      ...value,
      communityId,
    }));
    void this.router.navigateByUrl(`/new-issue/photo`);
  }
}
