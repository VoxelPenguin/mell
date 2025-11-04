import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { ButtonDirective } from 'primeng/button';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { SpeechBubbleComponent } from '../../shared/ui/speech-bubble.component';
import { NewCommunityFormService } from '../data-access/new-community-form.service';
import { LocationWithRadiusPickerComponent } from '../ui/location-with-radius-picker.component';

@Component({
  selector: 'mell-new-issue-location-page',
  imports: [
    LocationWithRadiusPickerComponent,
    Field,
    ButtonDirective,
    LucideAngularModule,
    SpeechBubbleComponent,
  ],
  template: `
    <mell-speech-bubble imageUrl="/images/mell-pirate.png">
      Where is your community located?
    </mell-speech-bubble>

    <mell-location-with-radius-picker [field]="form.location" />

    <!-- Confirm Button -->
    <button pButton type="button" (click)="next()">
      Next
      <lucide-icon [img]="ArrowRight" size="20" />
    </button>
  `,
  host: {
    class: 'flex flex-col gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewCommunityLocationPageComponent {
  private readonly newCommunityFormService = inject(NewCommunityFormService);
  private readonly router = inject(Router);

  readonly form = this.newCommunityFormService.form;
  protected readonly ArrowRight = ArrowRight;

  next(): void {
    void this.router.navigateByUrl('/new-community/name');
  }
}
