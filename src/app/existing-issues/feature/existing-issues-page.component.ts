import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'mell-existing-issues-page',
  imports: [RouterLink, ButtonDirective],
  template: `
    <h1 class="pb-5 text-center text-3xl font-semibold text-balance">
      Existing Issues
    </h1>

    <p>TODO: insert map here</p>

    <a pButton class="p-button-rounded" routerLink="/">Home</a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExistingIssuesPageComponent {}
