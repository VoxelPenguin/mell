import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { FormProvider } from './form-provider';
import { Community, IssueSubmission } from '../../../../types/db-types';
import { NgOptimizedImage } from '@angular/common';
import { SpeechBubbleComponent } from '../ui/speech-bubble.component';
import { ButtonDirective } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'mell-choose-community-page',
  imports: [NgOptimizedImage, SpeechBubbleComponent, ButtonDirective],
  template: `
    <div class="flex items-start gap-6">
      <img
        ngSrc="/images/mell-pirate.png"
        height="100"
        width="100"
        alt=""
        priority
      />

      <mell-speech-bubble>
        It looks like this location is within multiple communities! Which
        community should we report the issue to?
      </mell-speech-bubble>
    </div>

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

    <button pButton class="p-button-secondary">None of the above</button>
  `,
  host: {
    class: 'flex flex-col gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChooseCommunityPageComponent {
  private readonly formProvider: FormProvider<IssueSubmission> =
    inject(FormProvider);
  private readonly router = inject(Router);

  readonly formValue = this.formProvider.formValue;

  readonly communities = input.required<Community[]>();

  chooseCommunity(communityId: Community['id']): void {
    this.formValue.update((value) => ({
      ...value,
      communityId,
    }));
    void this.router.navigateByUrl('/new-issue/photo');
  }
}
