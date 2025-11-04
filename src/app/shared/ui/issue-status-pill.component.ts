import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { IssueStatus } from '../../../../types/db-types';

@Component({
  selector: 'mell-issue-status-pill',
  template: ` <p
    class="inline-block rounded-full px-[0.5rem] py-[0.05rem] font-semibold"
    [class.bg-gray-300]="status() === IssueStatus.Open"
    [class.text-gray-600]="status() === IssueStatus.Open"
    [class.bg-green-200]="status() === IssueStatus.Completed"
    [class.text-green-800]="status() === IssueStatus.Completed"
    [class.bg-blue-200]="status() === IssueStatus.InProgress"
    [class.text-blue-700]="status() === IssueStatus.InProgress"
    [class.bg-amber-200]="status() === IssueStatus.UnderReview"
    [class.text-amber-800]="status() === IssueStatus.UnderReview"
    [class.bg-pink-200]="status() === IssueStatus.Scheduled"
    [class.text-pink-800]="status() === IssueStatus.Scheduled"
    [class.bg-red-200]="status() === IssueStatus.NotPlanned"
    [class.text-red-700]="status() === IssueStatus.NotPlanned"
  >
    @if (showPrefix()) {
      <span class="font-normal">Status: </span>
    }
    {{ statusDisplayText() }}
  </p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueStatusPillComponent {
  readonly status = input.required<IssueStatus>();
  readonly showPrefix = input<boolean>(false);

  readonly statusToDisplayText: Record<IssueStatus, string> = {
    [IssueStatus.Open]: 'Open',
    [IssueStatus.UnderReview]: 'Under Review',
    [IssueStatus.Scheduled]: 'Scheduled',
    [IssueStatus.InProgress]: 'In Progress',
    [IssueStatus.Completed]: 'Completed',
    [IssueStatus.NotPlanned]: 'Not Planned',
  };

  readonly statusDisplayText = computed(
    () => this.statusToDisplayText[this.status()],
  );

  protected readonly IssueStatus = IssueStatus;
}
