import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import {
  encodeImageAsBase64Url,
  resizeImageAndConvertToDataUrl,
} from '../../shared/util/image-helpers';
import {
  LocationData,
  LocationPickerComponent,
} from '../ui/location-picker.component';
import { ButtonDirective } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { NgOptimizedImage } from '@angular/common';
import { Issue, IssueSubmission } from '../../../../types/db-types';
import {
  applyWhen,
  customError,
  form,
  required,
  validate,
} from '@angular/forms/signals';
import { FormProvider } from './form-provider';
import { ArrowLeft, LucideAngularModule, Trash2 } from 'lucide-angular';
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

enum Step {
  Location = 'location',
  Photo = 'photo',
  Thinking = 'thinking',
  Review = 'review',
}

export type NewIssueFormModel = Pick<
  Required<Issue>,
  'communityId' | 'typeId' | 'otherTypeName' | 'photoUrl' | 'description'
> & {
  location: LocationData;
};

@Component({
  selector: 'mell-new-issue-page',
  imports: [
    FormsModule,
    SelectModule,
    RouterOutlet,
    LucideAngularModule,
    ConfirmDialog,
  ],
  template: `
    <div class="flex justify-between pt-3 pb-5">
      <button class="pr-3 pb-3" (click)="goBack()">
        <lucide-icon [img]="ArrowLeft" />
      </button>

      <button class="pb-3 pl-3" (click)="confirmDiscard()">
        <lucide-icon [img]="Trash2" />
      </button>
    </div>

    <router-outlet />

    <p-confirm-dialog />

    <!--    @switch (step()) {-->
    <!--      @case (Step.Location) {-->
    <!--        <h1 class="pb-5 text-center text-3xl font-semibold text-balance">-->
    <!--          Where is the issue?-->
    <!--        </h1>-->

    <!--        <mell-location-picker-->
    <!--          [(ngModel)]="location"-->
    <!--          name="location"-->
    <!--          (confirmLocation)="step.set(Step.Photo)"-->
    <!--        />-->
    <!--      }-->

    <!--      @case (Step.Photo) {-->
    <!--        <h1 class="pb-5 text-center text-3xl font-semibold text-balance">-->
    <!--          Snap a photo of the issue-->
    <!--        </h1>-->

    <!--        <input-->
    <!--          #photoInput-->
    <!--          type="file"-->
    <!--          accept="image/*"-->
    <!--          name="photo"-->
    <!--          required-->
    <!--          capture="environment"-->
    <!--          style="display: none;"-->
    <!--          (change)="onPhotoChange($event)"-->
    <!--        />-->
    <!--        <button-->
    <!--          pButton-->
    <!--          class="w-full"-->
    <!--          type="button"-->
    <!--          (click)="photoInput.click()"-->
    <!--        >-->
    <!--          📷 Open camera-->
    <!--        </button>-->

    <!--        @if (photoDataUrl(); as dataUrl) {-->
    <!--          <img-->
    <!--            alt=""-->
    <!--            [src]="dataUrl"-->
    <!--            class="my-4 block h-auto w-[min(100%,30rem)] rounded-2xl"-->
    <!--          />-->

    <!--          <button-->
    <!--            pButton-->
    <!--            class="w-full"-->
    <!--            type="button"-->
    <!--            (click)="step.set(Step.Thinking)"-->
    <!--          >-->
    <!--            Next-->
    <!--          </button>-->
    <!--        }-->
    <!--      }-->

    <!--      @case (Step.Thinking) {-->
    <!--        <h1 class="pb-5 text-center text-3xl font-semibold text-balance">-->
    <!--          Thinking...-->
    <!--        </h1>-->

    <!--        <button pButton type="button" (click)="step.set(Step.Review)">-->
    <!--          Stop thinking-->
    <!--        </button>-->
    <!--      }-->

    <!--      @case (Step.Review) {-->
    <!--        <h1 class="pb-5 text-center text-3xl font-semibold text-balance">-->
    <!--          Review and submit-->
    <!--        </h1>-->

    <!--        <img-->
    <!--          [src]="photoDataUrl()"-->
    <!--          alt=""-->
    <!--          class="max-h-[40vh] w-full rounded-2xl"-->
    <!--        />-->

    <!--        <label class="mt-4 flex flex-col gap-1">-->
    <!--          Issue Type-->

    <!--          <p-select [options]="ISSUE_TYPES" [(ngModel)]="type" />-->

    <!--          @if (type() === 'Other') {-->
    <!--            <input-->
    <!--              pInputText-->
    <!--              type="text"-->
    <!--              placeholder="Issue type"-->
    <!--              [(ngModel)]="otherType"-->
    <!--            />-->
    <!--          }-->
    <!--        </label>-->

    <!--        <button-->
    <!--          pButton-->
    <!--          class="mt-4 w-full"-->
    <!--          (click)="onSubmit()"-->
    <!--          [disabled]="!type() || (type() === 'Other' && !otherType())"-->
    <!--        >-->
    <!--          Submit-->
    <!--        </button>-->
    <!--      }-->
    <!--    }-->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: FormProvider, useExisting: NewIssuePageComponent }],
})
export default class NewIssuePageComponent extends FormProvider<NewIssueFormModel> {
  // private readonly router = inject(Router);
  // private readonly activatedRoute = inject(ActivatedRoute);
  //
  // readonly ISSUE_TYPES = ['Pothole', 'Fallen Tree', 'Other'];
  //
  // readonly step = signal<Step>(Step.Location);

  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly formValue = signal<NewIssueFormModel>({
    location: {
      latitude: 39.145024, // Meerkat exhibit at the Cincinnati Zoo
      longitude: -84.506283,
      address: '',
    },
    communityId: '',
    photoUrl: '',
    typeId: '',
    otherTypeName: '',
    description: '',
  });

  readonly form = form(this.formValue, (path) => {
    required(path.location.address);
    required(path.communityId);
    required(path.photoUrl);

    required(path.otherTypeName, {
      when: ({ valueOf }) => !valueOf(path.typeId),
    });
  });

  goBack(): void {
    window.history.back();
  }

  confirmDiscard(): void {
    this.confirmationService.confirm({
      header: 'Discard this new issue?',
      message: 'Your progress will be lost.',
      closable: false,
      accept: () => this.router.navigate(['/home']),
    });
  }

  // // form values
  // readonly location = signal<LocationData | null>(null);
  // readonly photoDataUrl = signal<string | null>(null);
  // readonly type = signal(this.ISSUE_TYPES[0]);
  // readonly otherType = signal('');
  // readonly description = signal<string>('');
  //
  // async onPhotoChange(e: Event) {
  //   const inputElement = e.target as HTMLInputElement | undefined;
  //   const imageFile = inputElement?.files?.[0];
  //
  //   if (!imageFile) {
  //     this.photoDataUrl.set(null);
  //     return;
  //   }
  //
  //   const photoDataUrl = await resizeImageAndConvertToDataUrl(imageFile, 512);
  //
  //   this.photoDataUrl.set(photoDataUrl);
  // }
  //
  // onSubmit(): void {
  //   console.log({
  //     location: this.location(),
  //     photoDataUrl: this.photoDataUrl(),
  //     type: this.type(),
  //     otherType: this.otherType(),
  //     description: this.description(),
  //   });
  //
  //   this.router.navigate(['submitted'], { relativeTo: this.activatedRoute });
  // }
  //
  // protected readonly Step = Step;
  protected readonly ArrowLeft = ArrowLeft;
  protected readonly Trash2 = Trash2;
}
