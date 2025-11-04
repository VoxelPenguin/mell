import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { ArrowRight, LucideAngularModule, Upload } from 'lucide-angular';
import { SpeechBubbleComponent } from '../../shared/ui/speech-bubble.component';
import { Router } from '@angular/router';
import { resizeImageAndConvertToDataUrl } from '../../../../helpers/image-helpers';
import { NewCommunityFormService } from '../data-access/new-community-form.service';
import { NewCommunityFormModel } from './new-community-page.component';
import { ApiService } from '../../shared/data-access/api.service';
import { ErrorMessageComponent } from '../../shared/ui/error-message.component';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'mell-new-community-logo-page',
  imports: [
    ButtonDirective,
    LucideAngularModule,
    SpeechBubbleComponent,
    ErrorMessageComponent,
    JsonPipe,
    Button,
  ],
  template: `
    <mell-speech-bubble>
      Great! Now, let's upload a logo for {{ communityName() }}.
    </mell-speech-bubble>

    <input
      #photoInput
      type="file"
      accept="image/*"
      name="photo"
      required
      capture="environment"
      class="hidden"
      (change)="onImageChange($event)"
    />

    <div
      class="flex flex-col items-center gap-4 self-center rounded-2xl bg-white p-6"
    >
      @if (logoUrl(); as logoUrl) {
        <img [src]="logoUrl" class="size-30 rounded-full" alt="" />
      } @else {
        <button
          pButton
          class="flex size-30! w-full flex-col gap-4 rounded-full!"
          type="button"
          (click)="photoInput.click()"
        >
          <lucide-icon [img]="Upload" size="48" />

          Upload
        </button>
      }

      <p class="text-center text-xl font-bold text-balance">
        {{ communityName() }}
      </p>
    </div>

    @if (errorMessage()) {
      <mell-error-message>
        {{ errorMessage() | json }}
      </mell-error-message>
    }

    @if (logoUrl(); as logoUrl) {
      <button
        pButton
        class="p-button-secondary flex gap-2"
        (click)="photoInput.click()"
        [disabled]="submitting()"
      >
        Change logo
      </button>

      <p-button
        [disabled]="form().invalid()"
        [loading]="submitting()"
        (onClick)="submit()"
        label="Finish"
        styleClass="w-full"
        iconPos="right"
      >
        <ng-template #icon>
          <lucide-icon [img]="ArrowRight" size="20" />
        </ng-template>
      </p-button>
    }
  `,
  host: {
    class: 'flex flex-col gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewCommunityLogoPageComponent {
  private readonly newCommunityFormService = inject(NewCommunityFormService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly form = this.newCommunityFormService.form;
  readonly formValue = this.newCommunityFormService.formValue;

  readonly communityName = computed(() => this.formValue().name);
  readonly logoUrl = computed(() => this.formValue().logoUrl);

  readonly submitting = signal(false);
  readonly errorMessage = signal<unknown>(null);

  async onImageChange(e: Event) {
    const inputElement = e.target as HTMLInputElement | undefined;
    const imageFile = inputElement?.files?.[0];

    if (!imageFile) {
      this.formValue.update(
        (value): NewCommunityFormModel => ({
          ...value,
          logoUrl: '',
        }),
      );
      return;
    }

    const logoUrl = await resizeImageAndConvertToDataUrl(imageFile, 256);

    this.formValue.update(
      (value): NewCommunityFormModel => ({
        ...value,
        logoUrl,
      }),
    );
  }

  async submit(): Promise<void> {
    this.submitting.set(true);

    try {
      const newCommunityId = await this.api.createNewCommunity(
        this.formValue(),
      );

      this.newCommunityFormService.resetForm();

      void this.router.navigateByUrl(
        `/new-community/success/${newCommunityId}`,
      );
    } catch (error: unknown) {
      this.errorMessage.set(error);
      this.submitting.set(false);
    }
  }

  protected readonly ArrowRight = ArrowRight;
  protected readonly Upload = Upload;
}
