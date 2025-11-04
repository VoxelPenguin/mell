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
import { CommunityWithMapComponent } from '../../shared/ui/community-with-map.component';

@Component({
  selector: 'mell-new-issue-choose-community-page',
  imports: [
    NgOptimizedImage,
    SpeechBubbleComponent,
    ButtonDirective,
    RouterLink,
    CommunityWithMapComponent,
  ],
  template: `
    @if (multipleMatchingCommunities()) {
      <mell-speech-bubble>
        It looks like this is within multiple communities! Which community
        should we report the issue to?
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
      <mell-speech-bubble>
        It looks like this issue is within
        <span class="font-semibold">{{ firstCommunity().name }}</span
        >. Is that correct?
      </mell-speech-bubble>

      <mell-community-with-map [community]="firstCommunity()" />

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
      <mell-speech-bubble
        imageUrl="/images/mell-analyzing.webp"
        imageStyleClass="scale-x-[-1]"
      >
        It looks like there aren't any communities set up in your area yet.
        Would you like to create one?
      </mell-speech-bubble>

      <a pButton routerLink="/new-community">Yes, create new community</a>

      <button pButton class="p-button-secondary" (click)="goBack()">
        No, go back
      </button>
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

  goBack(): void {
    window.history.back();
  }
}
