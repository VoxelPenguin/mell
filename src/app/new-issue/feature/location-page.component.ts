import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormProvider } from './form-provider';
import { IssueSubmission } from '../../../../types/db-types';
import { NgOptimizedImage } from '@angular/common';
import { SpeechBubbleComponent } from '../ui/speech-bubble.component';
import { LocationPickerComponent } from '../ui/location-picker.component';
import { NewIssueFormModel } from './new-issue-page.component';
import { Field } from '@angular/forms/signals';
import { ButtonDirective } from 'primeng/button';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'mell-location-page',
  imports: [
    NgOptimizedImage,
    SpeechBubbleComponent,
    LocationPickerComponent,
    Field,
    ButtonDirective,
    LucideAngularModule,
    RouterLink,
  ],
  template: `
    <div class="flex items-start gap-6">
      <img
        ngSrc="/images/mell-pirate.png"
        height="100"
        width="100"
        alt=""
        priority
      />

      <mell-speech-bubble>Where is the issue located?</mell-speech-bubble>
    </div>

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
export default class LocationPageComponent {
  private readonly formProvider: FormProvider<NewIssueFormModel> =
    inject(FormProvider);
  private readonly router = inject(Router);

  readonly form = this.formProvider.form;
  protected readonly ArrowRight = ArrowRight;

  next(): void {
    void this.router.navigateByUrl('/new-issue/choose-community');
  }
}
