import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { House, LucideAngularModule } from 'lucide-angular';
import { Issue } from '../../../../types/db-types';
import { SpeechBubbleComponent } from '../../shared/ui/speech-bubble.component';
import { ExistingIssueMapComponent } from '../ui/existing-issue-map.component';

@Component({
  selector: 'mell-existing-issues-page',
  imports: [
    RouterLink,
    ExistingIssueMapComponent,
    LucideAngularModule,
    SpeechBubbleComponent,
  ],
  template: `
    <a class="flex h-full gap-1 pr-3 pb-3" routerLink="/">
      <lucide-icon [img]="House" />
      Home
    </a>

    <!-- Mell Speech Bubble -->
    <mell-speech-bubble>
      Let's see what your neighbors are reporting!
    </mell-speech-bubble>

    <mell-existing-issue-map [issues]="issues()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExistingIssuesPageComponent {
  readonly issues = input.required<Issue[]>();
  protected readonly House = House;
}
