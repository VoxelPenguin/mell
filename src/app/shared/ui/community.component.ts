import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  TemplateRef,
} from '@angular/core';
import { Community } from '../../../../types/db-types';

@Component({
  selector: 'mell-community',
  imports: [NgTemplateOutlet],
  template: `
    @if (logoTemplate(); as logoTemplate) {
      <ng-container *ngTemplateOutlet="logoTemplate" />
    } @else if (logoUrl(); as logoUrl) {
      <img [src]="logoUrl" class="size-30 rounded-full" alt="" />
    }

    <p class="text-center text-xl font-bold text-balance">
      {{ name() }}
    </p>
  `,
  host: {
    class:
      'flex flex-col items-center gap-4 self-center rounded-2xl bg-white p-6',
    '[class.cursor-pointer]': 'interactive()',
    '[class.hover:bg-slate-100]': 'interactive()',
    '[class.hover:translate-x-1]': 'interactive()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityComponent {
  readonly name = input.required<Community['name']>();
  readonly logoUrl = input<Community['logoUrl']>();
  readonly interactive = input(false, { transform: booleanAttribute });

  readonly logoTemplate = contentChild<TemplateRef<unknown>>('logo');
}
