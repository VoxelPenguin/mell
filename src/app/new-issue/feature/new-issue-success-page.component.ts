import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Issue } from '../../../../types/db-types';
import { IssueInfoCardComponent } from '../../shared/ui/issue-info-card.component';
import { SpeechBubbleComponent } from '../../shared/ui/speech-bubble.component';

@Component({
  selector: 'mell-new-issue-success-page',
  imports: [
    RouterLink,
    ButtonDirective,
    SpeechBubbleComponent,
    IssueInfoCardComponent,
  ],
  template: `
    <mell-speech-bubble>
      <p class="mb-2">Success! 🎉</p>

      <p class="mb-2">
        The community managers will address your issue as soon as possible.
      </p>

      <p>
        Thanks for doing your part to make our community a great place to live!
      </p>
    </mell-speech-bubble>

    <div class="mx-auto w-full">
      <img [src]="photoUrl()" class="w-full rounded-t-2xl" alt="" />

      <mell-issue-info-card [issue]="issue()" [roundTopBorders]="false" />
    </div>

    <a pButton class="w-full" routerLink="/">Home</a>
  `,
  host: {
    class: 'flex flex-col gap-6',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewIssueSuccessPageComponent {
  readonly issue = input.required<Issue>();

  readonly photoUrl = computed(() => this.issue().photoUrl);
}
