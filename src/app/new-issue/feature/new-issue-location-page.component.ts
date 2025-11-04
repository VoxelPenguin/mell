import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LocationPickerComponent } from '../ui/location-picker.component';
import { Field } from '@angular/forms/signals';
import { ButtonDirective } from 'primeng/button';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { SpeechBubbleComponent } from '../../shared/ui/speech-bubble.component';
import { NewIssueFormService } from '../data-access/new-issue-form.service';

@Component({
  selector: 'mell-new-issue-location-page',
  imports: [
    LocationPickerComponent,
    Field,
    ButtonDirective,
    LucideAngularModule,
    SpeechBubbleComponent,
  ],
  template: `
    <mell-speech-bubble imageUrl="/images/mell-pirate.webp">
      Where is the issue located?
    </mell-speech-bubble>

    <mell-location-picker [field]="form.location" />

    <!-- Confirm Button -->
    <button
      pButton
      type="button"
      (click)="next()"
      [disabled]="form.location.address().invalid()"
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
export default class NewIssueLocationPageComponent {
  private readonly newIssueFormService = inject(NewIssueFormService);
  private readonly router = inject(Router);

  readonly form = this.newIssueFormService.form;
  protected readonly ArrowRight = ArrowRight;

  next(): void {
    void this.router.navigateByUrl('/new-issue/community');
  }
}
