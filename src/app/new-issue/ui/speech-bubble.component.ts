import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'mell-speech-bubble',
  template: `<ng-content />`,
  styles: `
    :host {
      padding: 0.75rem 1rem;
      position: relative;
      background: white;
      border-radius: 0.5rem;
    }

    :host:after {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 0;
      height: 0;
      border: 20px solid transparent;
      border-right-color: white;
      border-left: 0;
      border-bottom: 0;
      margin-top: -10px;
      margin-left: -20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeechBubbleComponent {}
