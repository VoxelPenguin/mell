import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'mell-root',
  imports: [RouterOutlet],
  template: `
    <h1>Mell</h1>
    <router-outlet />
  `,
})
export class AppComponent {
  protected readonly title = signal('mell');
}
