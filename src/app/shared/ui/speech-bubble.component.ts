import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'mell-speech-bubble',
  template: `
    <img [src]="imageUrl()" alt="" [class]="imageClass()" />

    <div class="speech-bubble">
      <ng-content />
    </div>
  `,
  styles: `
    .speech-bubble {
      padding: 0.75rem 1rem;
      position: relative;
      background: white;
      border-radius: 0.5rem;
    }

    .speech-bubble:after {
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
  host: { class: 'flex items-start gap-6' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeechBubbleComponent {
  readonly imageUrl = input('/images/mell-base.webp');
  readonly imageStyleClass = input('');

  readonly imageClass = computed(
    () => `self-end h-30 shrink-0 ${this.imageStyleClass()}`,
  );
}
