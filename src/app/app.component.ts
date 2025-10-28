import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <main>
      <h1>{{ title() }}</h1>
      <p>Hello world!</p>
    </main>
    <router-outlet />
  `,
})
export class AppComponent {
  protected readonly title = signal('mell');
}
