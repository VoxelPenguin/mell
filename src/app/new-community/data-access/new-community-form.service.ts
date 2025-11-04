import { Injectable, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { NewCommunityFormModel } from '../feature/new-community-page.component';

const INITIAL_FORM_VALUE: NewCommunityFormModel = {
  location: {
    latitude: 39.145024, // Meerkat exhibit at the Cincinnati Zoo
    longitude: -84.506283,
    radiusMeters: 5000,
  },
  name: '',
  logoUrl: '',
};

@Injectable({
  providedIn: null,
})
export class NewCommunityFormService {
  readonly formValue = signal(INITIAL_FORM_VALUE);

  readonly form = form(this.formValue, (path) => {
    required(path.location.radiusMeters);
    required(path.name);
    required(path.logoUrl);
  });

  resetForm(): void {
    this.formValue.set(INITIAL_FORM_VALUE);
  }
}
