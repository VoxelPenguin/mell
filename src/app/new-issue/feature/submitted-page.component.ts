import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'mell-submitted-page',
  imports: [RouterLink],
  template: `
    <h2>✅ Success!</h2>
    <a routerLink="/">Home</a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SubmittedPageComponent {}
