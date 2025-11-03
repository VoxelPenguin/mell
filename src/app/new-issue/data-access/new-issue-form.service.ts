import { Injectable, signal } from '@angular/core';
import { NewIssueFormModel } from '../feature/new-issue-page.component';
import { form, required } from '@angular/forms/signals';

const INITIAL_FORM_VALUE: NewIssueFormModel = {
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
};

@Injectable({
  providedIn: null,
})
export class NewIssueFormService {
  readonly formValue = signal(INITIAL_FORM_VALUE);

  readonly form = form(this.formValue, (path) => {
    required(path.location.address);
    required(path.communityId);
    required(path.photoUrl);

    required(path.otherTypeName, {
      when: ({ valueOf }) => !valueOf(path.typeId),
    });
  });

  resetForm(): void {
    this.formValue.set(INITIAL_FORM_VALUE);
  }
}
