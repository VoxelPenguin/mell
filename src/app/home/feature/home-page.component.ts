import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'mell-home-page',
  imports: [RouterLink],
  template: `
    <p><a routerLink="../new-issue">Submit new issue</a></p>
    <p><a routerLink="../existing-issues">Check on an existing issue</a></p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePageComponent {}
