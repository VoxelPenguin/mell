import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { SpeechBubbleComponent } from '../../shared/ui/speech-bubble.component';
import { Issue } from '../../../../types/db-types';

@Component({
  selector: 'mell-new-issue-success-page',
  imports: [RouterLink, ButtonDirective, SpeechBubbleComponent],
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

      <div class="rounded-b-2xl bg-white px-4 py-3">
        <p class="text-xl font-bold">{{ issueType() }}</p>
        <p class="mb-3 truncate text-sm font-semibold text-neutral-500">
          {{ address() }}
        </p>
        <p class="mb-2 flex gap-2 font-semibold">
          <img
            [src]="communityLogoUrl()"
            class="size-5 shrink-0 rounded-full"
            alt=""
          />
          {{ communityName() }}
        </p>
        <p class="mb-2 text-sm whitespace-pre-wrap">{{ description() }}</p>
        <p class="text-right">
          <span
            class="rounded-2xl bg-neutral-200 px-3 py-1 text-sm text-neutral-700"
          >
            Status: <span class="font-semibold">{{ status() }}</span>
          </span>
        </p>
      </div>
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

  readonly community = computed(() => this.issue().community);

  readonly issueType = computed(() => this.issue().type?.name);
  readonly photoUrl = computed(() => this.issue().photoUrl);
  readonly address = computed(() => this.issue().address);
  readonly description = computed(() => this.issue().description);
  readonly status = computed(() => this.issue().status);
  readonly communityName = computed(() => this.community().name);
  readonly communityLogoUrl = computed(() => this.community().logoUrl);
}
