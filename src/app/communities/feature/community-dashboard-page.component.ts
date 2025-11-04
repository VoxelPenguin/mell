import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { MessageService } from 'primeng/api';
import { ImageModule } from 'primeng/image';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Community, Issue, IssueStatus } from '../../../../types/db-types';
import { ApiService } from '../../shared/data-access/api.service';
import {
  IssueStatusPillComponent,
  statusToDisplayText,
} from '../../shared/ui/issue-status-pill.component';
import { SpeechBubbleComponent } from '../../shared/ui/speech-bubble.component';

@Component({
  selector: 'mell-community-dashboard-page',
  imports: [
    TableModule,
    ImageModule,
    IssueStatusPillComponent,
    SpeechBubbleComponent,
    SelectModule,
    IssueStatusPillComponent,
    FormsModule,
    ProgressBarModule,
    RouterLink,
    LucideAngularModule,
    DatePipe,
    ToastModule,
  ],
  template: `
    <!-- Back Button -->
    <a class="flex h-full gap-1 pt-3 pr-3 pb-3" routerLink="/communities">
      <lucide-icon [img]="ArrowLeft" />
    </a>

    @if (community(); as community) {
      <div class="flex w-full flex-col gap-4" #container>
        <!-- Header -->
        <div class="flex items-center gap-4">
          @if (community.logoUrl) {
            <img
              [src]="community.logoUrl"
              class="size-25 rounded-full"
              alt=""
            />
          }
          <div class="flex flex-col gap-1">
            <h1 class="text-5xl font-semibold">{{ community.name }}</h1>
            <p class="pl-1 text-lg">Community Dashboard</p>
          </div>
        </div>

        <!-- Issue Table -->
        @if (issues().length) {
          <p-table [value]="issues()">
            <ng-template #header>
              <tr>
                <th class="w-[15rem]" pSortableColumn="type.name">
                  Type <p-sortIcon field="type.name" />
                </th>
                <th class="w-[10rem]">Photo</th>
                <th class="w-[15rem]" pSortableColumn="address">
                  Address <p-sortIcon field="address" />
                </th>
                <th class="w-[10rem]">Submitted On</th>
                <th class="w-[25rem]">Description</th>
                <th class="w-[15rem]" pSortableColumn="status">
                  Status <p-sortIcon field="status" />
                </th>
              </tr>
            </ng-template>
            <ng-template #body let-issue let-first="first">
              <tr>
                <td>
                  @if (issue.type?.name) {
                    {{ issue.type.name }}
                  } @else {
                    <span class="text-gray-400 italic">Unknown</span>
                  }
                </td>
                <td>
                  <p-image
                    [src]="issue.photoUrl"
                    [alt]="issue.description"
                    width="96"
                    [preview]="true"
                    appendTo="body"
                    imageClass="rounded-md"
                  />
                </td>
                <td>{{ issue.address }}</td>
                <td>{{ issue.createdAt | date }}</td>
                <td>{{ issue.description }}</td>
                <td>
                  <p-select
                    class="w-full !border-transparent !shadow-none hover:!border-current focus:!border-current active:!border-current"
                    [options]="issueStatuses"
                    [(ngModel)]="issueStatusModels()[issue.id]"
                    placeholder="Status"
                    appendTo="body"
                    (onChange)="onStatusChange(issue, $event.value)"
                  >
                    <ng-template #selectedItem let-selectedStatus>
                      <mell-issue-status-pill
                        class="text-sm"
                        [status]="selectedStatus"
                      />
                    </ng-template>
                    <ng-template let-status #item>
                      <mell-issue-status-pill
                        class="text-sm"
                        [status]="status"
                      />
                    </ng-template>
                  </p-select>
                </td>
              </tr>
            </ng-template>
          </p-table>
        } @else {
          <div class="mt-7 flex justify-center">
            <mell-speech-bubble
              >Woohoo! No issues to report!</mell-speech-bubble
            >
          </div>
        }
      </div>
    } @else {
      <p>Error loading community data, please try again.</p>
    }

    <p-toast position="bottom-right" />
  `,
  styles: [
    `
      :host ::ng-deep .p-datatable {
        border-radius: 0.5rem;
        overflow: hidden;
      }

      :host ::ng-deep .p-datatable .p-datatable-thead > tr:last-child > th {
        border-bottom: none;
      }

      :host
        ::ng-deep
        .p-datatable
        .p-datatable-thead
        > tr:first-child
        > th:first-child {
        border-top-left-radius: 0.5rem;
      }

      :host
        ::ng-deep
        .p-datatable
        .p-datatable-thead
        > tr:first-child
        > th:last-child {
        border-top-right-radius: 0.5rem;
      }

      :host
        ::ng-deep
        .p-datatable
        .p-datatable-tbody
        > tr:last-child
        > td:first-child {
        border-bottom-left-radius: 0.5rem;
      }

      :host
        ::ng-deep
        .p-datatable
        .p-datatable-tbody
        > tr:last-child
        > td:last-child {
        border-bottom-right-radius: 0.5rem;
      }

      :host ::ng-deep .p-image img {
        border-radius: 0.375rem;
      }

      :host ::ng-deep .p-select-dropdown-icon {
        visibility: hidden;
      }

      :host ::ng-deep .p-select:hover .p-select-dropdown-icon {
        visibility: visible;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunityDashboardPageComponent {
  private readonly api = inject(ApiService);
  private readonly messageService = inject(MessageService);

  readonly issues = input.required<Issue[]>();
  readonly community = input.required<Community>();

  readonly issueStatusModels: Signal<
    Record<string, WritableSignal<Issue['status']>>
  > = computed(() =>
    this.issues().reduce(
      (prev, issue) => ({
        ...prev,
        [issue.id]: signal(issue.status),
      }),
      {},
    ),
  );

  async onStatusChange(
    issue: Issue,
    newStatus: Issue['status'],
  ): Promise<void> {
    await this.api.updateIssue({ ...issue, status: newStatus });

    this.messageService.add({
      summary: 'Success',
      detail: `Issue status changed to ${statusToDisplayText[newStatus]}`,
      severity: 'success',
    });
  }

  readonly issueStatuses = Object.values(IssueStatus);
  protected readonly ArrowLeft = ArrowLeft;
}
