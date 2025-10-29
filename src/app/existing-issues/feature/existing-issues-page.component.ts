import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'mell-existing-issues-page',
  imports: [RouterLink],
  template: `
    <h2>Existing Issues</h2>

    <p>TODO: insert map here</p>

    <a routerLink="/">Home</a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExistingIssuesPageComponent {}
