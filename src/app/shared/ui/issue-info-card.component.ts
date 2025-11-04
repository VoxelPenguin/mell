import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { Crosshair, LucideAngularModule, X } from 'lucide-angular';
import { ImageModule } from 'primeng/image';
import { Issue } from '../../../../types/db-types';
import { IssueStatusPillComponent } from './issue-status-pill.component';

@Component({
  selector: 'mell-issue-info-card',
  imports: [IssueStatusPillComponent, ImageModule, LucideAngularModule],
  template: `
    <div
      class="flex flex-col gap-3 rounded-b-lg bg-gray-50 px-4 py-3"
      [class.rounded-t-lg]="roundTopBorders()"
    >
      <div class="flex items-start justify-between">
        <!-- Issue Type -->
        <h1 class="text-xl font-bold">
          {{ issue().type?.name ?? 'Unknown Issue' }}
        </h1>

        @if (showCloseButton()) {
          <!-- Close Button -->
          <button
            class="rounded-full p-1 text-gray-500 active:bg-gray-200"
            (click)="closeButtonClick.emit()"
          >
            <lucide-icon [img]="X" [size]="20" />
          </button>
        }
      </div>

      <div class="flex justify-between">
        <!-- Community Logo and Name -->
        <p class="flex items-center gap-2 font-semibold">
          @if (issue().community?.logoUrl; as communityLogoUrl) {
            <img
              [src]="communityLogoUrl"
              class="size-5 shrink-0 rounded-full"
              alt=""
            />
          }
          {{ issue().community?.name ?? 'Unknown Community' }}
        </p>

        <!-- Status -->
        <mell-issue-status-pill
          class="shrink-0 text-sm"
          [status]="issue().status"
          [showPrefix]="true"
        />
      </div>

      <div>
        <!-- Address -->
        <p class="flex-shrink truncate text-sm font-semibold text-neutral-500">
          {{ issue().address }}
        </p>

        <!-- Find Issue on Map Button -->
        @if (showLocationButton()) {
          <button
            class="text-primary-500 active:text-primary-600 flex items-center gap-2 self-start rounded p-1 text-sm font-semibold transition-colors active:bg-gray-200"
            (click)="centerButtonClick.emit()"
            type="button"
          >
            <lucide-icon [img]="Crosshair" [size]="16" />
            <span>Find Issue on Map</span>
          </button>
        }
      </div>

      <!-- Description -->
      <p class="text-sm whitespace-pre-wrap">{{ issue().description }}</p>

      <!-- Issue Photo -->
      @if (showImagePreview()) {
        <div class="flex flex-col gap-1">
          <p class="text-sm font-semibold">Images (click to enlarge):</p>
          <p-image
            [src]="issue().photoUrl"
            [alt]="issue().description"
            width="96"
            [preview]="true"
            class="rounded"
            appendTo="body"
          />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueInfoCardComponent {
  readonly issue = input.required<Issue>();
  readonly roundTopBorders = input<boolean>(true);
  readonly showCloseButton = input<boolean>(false);
  readonly showLocationButton = input<boolean>(false);
  readonly showImagePreview = input<boolean>(false);

  readonly closeButtonClick = output();
  readonly centerButtonClick = output();

  protected readonly Crosshair = Crosshair;
  protected readonly X = X;
}
