import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { SpeechBubbleComponent } from '../../shared/ui/speech-bubble.component';

@Component({
  selector: 'mell-new-issue-prompt-create-new-community-page',
  imports: [
    ButtonDirective,
    LucideAngularModule,
    SpeechBubbleComponent,
    RouterLink,
  ],
  template: `
    <mell-speech-bubble>
      Since we don't have the community you're looking for, would you like to
      create a new community?
    </mell-speech-bubble>

    <a pButton routerLink="/new-community">Yes, create new community</a>

    <button pButton class="p-button-secondary" (click)="goBack()">
      No, go back
    </button>
  `,
  host: {
    class: 'flex flex-col gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewIssueLocationPageComponent {
  goBack(): void {
    window.history.back();
  }
}
