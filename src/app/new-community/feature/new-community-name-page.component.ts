import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { ButtonDirective } from 'primeng/button';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { SpeechBubbleComponent } from '../../shared/ui/speech-bubble.component';
import { NewCommunityFormService } from '../data-access/new-community-form.service';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'mell-new-community-name-page',
  imports: [
    Field,
    ButtonDirective,
    LucideAngularModule,
    SpeechBubbleComponent,
    InputText,
  ],
  template: `
    <mell-speech-bubble>
      Got it! What's your community called?
    </mell-speech-bubble>

    <input
      pInputText
      [field]="form.name"
      placeholder="Community Name"
      (keydown.enter)="nextButton.click()"
    />

    <button
      #nextButton
      pButton
      (click)="next()"
      [disabled]="form.name().invalid()"
    >
      Next
      <lucide-icon [img]="ArrowRight" size="20" />
    </button>
  `,
  host: {
    class: 'flex flex-col gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewCommunityNamePageComponent {
  private readonly newCommunityFormService = inject(NewCommunityFormService);
  private readonly router = inject(Router);

  readonly form = this.newCommunityFormService.form;
  protected readonly ArrowRight = ArrowRight;

  next(): void {
    void this.router.navigateByUrl('/new-community/logo');
  }
}
