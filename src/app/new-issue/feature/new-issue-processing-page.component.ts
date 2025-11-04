import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { NewIssueFormService } from '../data-access/new-issue-form.service';
import { ApiService } from '../../shared/data-access/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorMessageComponent } from '../../shared/ui/error-message.component';
import { JsonPipe } from '@angular/common';
import { Button } from 'primeng/button';
import { LucideAngularModule, RotateCcw } from 'lucide-angular';

@Component({
  selector: 'mell-new-issue-processing-page',
  imports: [ErrorMessageComponent, JsonPipe, Button, LucideAngularModule],
  template: `
    <div class="speech-bubble p-4">
      @if (errorMessage()) {
        Uh oh...
      } @else {
        <p>Alright, let's have a look...</p>
        <p>This will only take a moment...</p>
      }
    </div>

    <div class="flex items-center justify-center gap-3">
      <div class="flex w-2/5 items-center p-4" [class.scan]="analyzing()">
        <img [src]="photoUrl()" class="w-full rounded-xl shadow-lg" alt="" />
      </div>

      <img src="/images/mell-base.png" class="w-2/5" alt="" />
    </div>

    @if (errorMessage()) {
      <mell-error-message>
        {{ errorMessage() | json }}

        <p-button
          severity="danger"
          [loading]="analyzing()"
          label="Try again"
          (onClick)="analyzePhoto()"
          styleClass="block mt-3 w-full"
        >
          <ng-template #icon>
            <lucide-icon [img]="RotateCcw" size="20" />
          </ng-template>
        </p-button>
      </mell-error-message>
    }
  `,
  styles: `
    .speech-bubble {
      position: relative;
      background: white;
      border-radius: 0.4em;
    }

    .speech-bubble:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 0;
      border: 20px solid transparent;
      border-top-color: white;
      border-bottom: 0;
      border-right: 0;
      margin-left: -10px;
      margin-bottom: -20px;
    }

    .scan {
      position: relative;
    }
    .scan::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 0.5rem;
      background: var(--color-primary-500);
      box-shadow: 0 0 70px 20px var(--color-primary-500);
      clip-path: inset(0);
      animation:
        x 0.75s ease-in-out infinite alternate,
        y 1.5s ease-in-out infinite;
    }

    @keyframes x {
      to {
        transform: translateX(-100%);
        left: 100%;
      }
    }

    @keyframes y {
      33% {
        clip-path: inset(0 0 0 -3rem);
      }
      50% {
        clip-path: inset(0 0 0 0);
      }
      83% {
        clip-path: inset(0 -3rem 0 0);
      }
    }
  `,
  host: {
    class: 'flex flex-col gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewIssueProcessingPageComponent implements OnInit {
  private readonly newIssueFormService = inject(NewIssueFormService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly formValue = this.newIssueFormService.formValue;

  readonly photoUrl = computed(() => this.formValue().photoUrl);

  readonly analyzing = signal(false);
  readonly errorMessage = signal<unknown>(null);

  async analyzePhoto() {
    this.analyzing.set(true);

    try {
      const { typeId, description } =
        await this.api.getAiGeneratedIssueTypeAndDescriptionFromPhoto(
          this.photoUrl(),
        );

      this.formValue.update((value) => ({
        ...value,
        typeId,
        description,
      }));

      void this.router.navigateByUrl(`/new-issue/review`, {
        replaceUrl: true,
      });
    } catch (error: unknown) {
      this.analyzing.set(false);
      this.errorMessage.set(
        error instanceof HttpErrorResponse ? error.error : error,
      );
    }
  }

  ngOnInit(): void {
    void this.analyzePhoto();
  }

  protected readonly RotateCcw = RotateCcw;
}
