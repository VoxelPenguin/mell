import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'mell-submitted-page',
  imports: [RouterLink, ButtonDirective],
  template: `
    <h1 class="pb-5 text-center text-3xl font-semibold text-balance">
      ✅ Success!
    </h1>

    <a pButton class="p-button-rounded w-full" routerLink="/">Home</a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SubmittedPageComponent {}
