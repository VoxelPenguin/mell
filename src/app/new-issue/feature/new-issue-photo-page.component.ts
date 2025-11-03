import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { ArrowRight, Camera, LucideAngularModule } from 'lucide-angular';
import { SpeechBubbleComponent } from '../../shared/ui/speech-bubble.component';
import { RouterLink } from '@angular/router';
import { NewIssueFormService } from '../data-access/new-issue-form.service';
import { resizeImageAndConvertToDataUrl } from '../../../../helpers/image-helpers';

@Component({
  selector: 'mell-new-issue-photo-page',
  imports: [
    ButtonDirective,
    LucideAngularModule,
    SpeechBubbleComponent,
    RouterLink,
  ],
  template: `
    <mell-speech-bubble>
      Great! Now, snap a photo of the issue
    </mell-speech-bubble>

    <input
      #photoInput
      type="file"
      accept="image/*"
      name="photo"
      required
      capture="environment"
      style="display: none;"
      (change)="onPhotoChange($event)"
    />

    @if (photoUrl(); as photoUrl) {
      <img
        alt=""
        [src]="photoUrl"
        class="mx-auto block h-auto w-[min(100%,30rem)] rounded-2xl"
      />

      <div class="grid w-full grid-cols-2 gap-3">
        <button
          pButton
          class="p-button-secondary flex gap-2"
          (click)="photoInput.click()"
        >
          Retake
        </button>

        <a pButton class="flex gap-2" routerLink="../processing">
          Next
          <lucide-icon [img]="ArrowRight" size="20" />
        </a>
      </div>
    } @else {
      <button
        pButton
        class="flex aspect-square w-full flex-col gap-4"
        type="button"
        (click)="photoInput.click()"
      >
        <lucide-icon [img]="Camera" size="80" />

        Open camera
      </button>
    }
  `,
  host: {
    class: 'flex flex-col gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewIssuePhotoPageComponent {
  private readonly newIssueFormService = inject(NewIssueFormService);

  readonly formValue = this.newIssueFormService.formValue;

  readonly photoUrl = computed(() => this.formValue().photoUrl);

  async onPhotoChange(e: Event) {
    const inputElement = e.target as HTMLInputElement | undefined;
    const imageFile = inputElement?.files?.[0];

    if (!imageFile) {
      this.formValue.update((value) => ({
        ...value,
        photoUrl: '',
      }));
      return;
    }

    const photoUrl = await resizeImageAndConvertToDataUrl(imageFile, 512);

    this.formValue.update((value) => ({
      ...value,
      photoUrl,
    }));
  }

  protected readonly ArrowRight = ArrowRight;
  protected readonly Camera = Camera;
}
