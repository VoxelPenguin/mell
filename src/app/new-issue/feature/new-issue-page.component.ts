import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { encodeImageAsBase64Url } from '../../shared/util/image-helpers';

enum Step {
  Location = 'location',
  Photo = 'photo',
  Thinking = 'thinking',
  Review = 'review',
}

@Component({
  selector: 'mell-new-issue-page',
  imports: [FormsModule],
  template: `
    <form #form="ngForm" (ngSubmit)="onSubmit(form.value)">
      @switch (step()) {
        @case (Step.Location) {
          <h2>Where is the issue?</h2>

          <button (click)="getCurrentLocation()" type="button">
            Get current location
          </button>

          <p>or</p>

          <p>
            Enter address:
            <input type="text" name="address" required ngModel />
          </p>

          <button
            type="button"
            (click)="step.set(Step.Photo)"
            [disabled]="!form.value.address"
          >
            Next ->
          </button>
        }

        @case (Step.Photo) {
          <h2>Snap a photo of the issue</h2>

          <input
            #photoInput
            type="file"
            accept="image/*"
            name="photo"
            required
            ngModel
            capture="environment"
            style="display: none;"
            (change)="onPhotoChange($event)"
          />
          <button type="button" (click)="photoInput.click()">Take Photo</button>

          <button
            type="button"
            (click)="step.set(Step.Thinking)"
            [disabled]="!form.value.photo"
          >
            Next ->
          </button>

          @if (photoDataUrl(); as dataUrl) {
            <img
              [src]="dataUrl"
              style="display: block; width: min(100%, 30rem); height: auto"
            />
          }
        }

        @case (Step.Thinking) {
          <h2>Thinking...</h2>

          <button type="button" (click)="step.set(Step.Review)">
            Stop thinking
          </button>
        }

        @case (Step.Review) {
          <h2>Review and submit</h2>

          <label>
            Issue Type

            <select ngModel required name="type">
              @for (type of ISSUE_TYPES; track type) {
                <option [value]="type">{{ type }}</option>
              }
            </select>

            @if (form.value.type === 'Other') {
              <input type="text" placeholder="Issue type" />
            }
          </label>

          <input type="submit" [disabled]="form.invalid" />
        }
      }
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewIssuePageComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly ISSUE_TYPES = ['Pothole', 'Fallen Tree', 'Other'] as const;

  readonly step = signal<Step>(Step.Location);

  readonly photoDataUrl = signal<string | null>(null);

  getCurrentLocation(): void {
    alert('TODO: implement this');
  }

  async onPhotoChange(e: Event) {
    const inputElement = e.target as HTMLInputElement | undefined;
    const imageFile = inputElement?.files?.[0];

    if (!imageFile) {
      this.photoDataUrl.set(null);
      return;
    }

    const photoDataUrl = await encodeImageAsBase64Url(imageFile);

    this.photoDataUrl.set(photoDataUrl);
  }

  onSubmit(formValue: { address: string; photo: File; type: string }): void {
    this.router.navigate(['submitted'], { relativeTo: this.activatedRoute });
  }

  protected readonly Step = Step;
}
