import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'mell-error-message',
  template: `<ng-content />`,
  host: {
    class:
      'rounded-lg border-2 border-red-700 bg-red-50 px-3.5 py-3.5 text-sm text-red-800 whitespace-pre-wrap',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageComponent {}
