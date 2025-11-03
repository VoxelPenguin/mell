import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Community, IssueType } from '../../../../types/db-types';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { SpeechBubbleComponent } from '../../shared/ui/speech-bubble.component';
import { Field } from '@angular/forms/signals';
import { LucideAngularModule, Send } from 'lucide-angular';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ApiService } from '../../shared/data-access/api.service';
import { ErrorMessageComponent } from '../../shared/ui/error-message.component';
import { JsonPipe } from '@angular/common';
import { NewIssueFormService } from '../data-access/new-issue-form.service';

@Component({
  selector: 'mell-new-issue-processing-page',
  imports: [
    Select,
    SpeechBubbleComponent,
    Field,
    LucideAngularModule,
    ButtonDirective,
    InputText,
    ErrorMessageComponent,
    JsonPipe,
  ],
  template: `
    <mell-speech-bubble>
      Alright, let's make any final adjustments and send it off!
    </mell-speech-bubble>

    <!-- Photo -->
    <img [src]="photoUrl()" class="mx-auto max-w-full rounded-2xl" alt="" />

    <!-- Issue Type -->
    <div class="flex w-full flex-col gap-1">
      <label for="issue-type" class="text-sm font-semibold">Issue type</label>
      <p-select
        inputId="issue-type"
        [options]="issueTypes()"
        [field]="form.typeId"
        class="w-full"
        optionLabel="name"
        optionValue="id"
      />
    </div>

    <!-- Description -->
    <div class="flex w-full flex-col gap-1">
      <label for="description" class="text-sm font-semibold"
        >Details (optional)</label
      >
      <textarea
        pInputText
        rows="6"
        cols="20"
        id="description"
        [field]="form.description"
        class="p-component p-textarea w-full"
      ></textarea>
    </div>

    @if (errorMessage()) {
      <mell-error-message>
        {{ errorMessage() | json }}
      </mell-error-message>
    }

    <button
      pButton
      class="flex gap-3"
      [disabled]="form().invalid()"
      (click)="submit()"
    >
      Submit <lucide-icon [img]="Send" size="20" />
    </button>
  `,
  host: {
    class: 'flex flex-col gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewIssueProcessingPageComponent {
  private readonly newIssueFormService = inject(NewIssueFormService);
  private readonly router = inject(Router);
  private readonly issueService = inject(ApiService);

  readonly issueTypes = input.required<IssueType[]>();
  readonly communityId = input.required<Community['id']>();

  readonly form = this.newIssueFormService.form;
  readonly formValue = this.newIssueFormService.formValue;

  readonly photoUrl = computed(() => this.formValue().photoUrl);

  readonly submitting = signal(false);
  readonly errorMessage = signal<unknown>(null);

  async submit(): Promise<void> {
    this.submitting.set(true);

    try {
      const newIssueId = await this.issueService.submitNewIssue(
        this.formValue(),
      );

      this.newIssueFormService.resetForm();

      void this.router.navigateByUrl(`/new-issue/success/${newIssueId}`);
    } catch (error: unknown) {
      this.errorMessage.set(error);
      this.submitting.set(false);
    }
  }

  protected readonly Send = Send;
}
