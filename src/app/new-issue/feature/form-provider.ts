import { FieldTree } from '@angular/forms/signals';
import { WritableSignal } from '@angular/core';

export abstract class FormProvider<T> {
  abstract readonly form: FieldTree<T>;
  abstract readonly formValue: WritableSignal<T>;
}
