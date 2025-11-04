import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { SpeechBubbleComponent } from '../../shared/ui/speech-bubble.component';
import { Community } from '../../../../types/db-types';
import { CommunityWithMapComponent } from '../../shared/ui/community-with-map.component';
import * as confetti from 'canvas-confetti';

@Component({
  selector: 'mell-new-issue-success-page',
  imports: [
    RouterLink,
    ButtonDirective,
    SpeechBubbleComponent,
    CommunityWithMapComponent,
  ],
  template: `
    <mell-speech-bubble imageUrl="/images/mell-jump.webp">
      <p class="mb-2">Success! 🎉</p>

      <p>Now anyone can report issues in {{ communityName() }}!</p>
    </mell-speech-bubble>

    <mell-community-with-map [community]="community()" />

    <a pButton class="w-full" routerLink="/">Home</a>
  `,
  host: {
    class: 'flex flex-col gap-6',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewIssueSuccessPageComponent implements AfterViewInit {
  readonly community = input.required<Community>();

  readonly communityName = computed(() => this.community().name);

  ngAfterViewInit(): void {
    confetti.default({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }
}
