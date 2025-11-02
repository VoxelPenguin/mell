import { NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ArrowRight, Camera, LucideAngularModule } from 'lucide-angular';
import { ButtonDirective } from 'primeng/button';
import { PhotoAnalysisPayload } from '../../../../types/api-types';
import { Issue, IssueSubmission } from '../../../../types/db-types';
import { environment } from '../../../environments/environment';
import {
  getMimeType,
  getRawImageData,
  resizeImageAndConvertToDataUrl,
} from '../../shared/util/image-helpers';
import { SpeechBubbleComponent } from '../ui/speech-bubble.component';
import { FormProvider } from './form-provider';

@Component({
  selector: 'mell-photo-page',
  imports: [
    NgOptimizedImage,
    SpeechBubbleComponent,
    ButtonDirective,
    LucideAngularModule,
  ],
  template: `
    <div class="flex items-start gap-6">
      <img
        ngSrc="/images/mell-base.png"
        height="100"
        width="100"
        alt=""
        priority
      />

      <mell-speech-bubble> Now, snap a photo of the issue</mell-speech-bubble>
    </div>

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

        <button pButton class="flex gap-2" (click)="next()">
          Next
          <lucide-icon [img]="ArrowRight" size="20" />
        </button>
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
export default class ChooseCommunityPageComponent {
  private readonly formProvider: FormProvider<IssueSubmission> =
    inject(FormProvider);
  private readonly http = inject(HttpClient);

  readonly formValue = this.formProvider.formValue;

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

  next(): void {
    const formValue = this.formValue();

    this.http
      .post<Pick<Issue, 'id' | 'description'>>(
        `${environment.harperApiUrl}/PhotoAnalysis`,
        {
          imageData: getRawImageData(formValue.photoUrl),
          imageMimeType: getMimeType(formValue.photoUrl),
          communityId: '5dfe8372-6927-4320-9e41-fe63984c5081',
        } satisfies PhotoAnalysisPayload,
      )
      .subscribe(console.log);
  }

  protected readonly ArrowRight = ArrowRight;
  protected readonly Camera = Camera;
}
