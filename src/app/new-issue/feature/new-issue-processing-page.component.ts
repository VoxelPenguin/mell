import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { IssueType } from '../../../../types/db-types';
import { Router } from '@angular/router';
import { NewIssueFormService } from '../data-access/new-issue-form.service';

@Component({
  selector: 'mell-new-issue-processing-page',
  imports: [],
  template: `
    <div class="speech-bubble p-4">
      <p>Alright, let's have a look...</p>
      <p>This will only take a moment...</p>
    </div>

    <div class="flex items-center justify-center gap-3">
      <div class="scan flex w-2/5 items-center p-4">
        <img [src]="photoUrl()" class="w-full rounded-xl shadow-lg" alt="" />
      </div>

      <img src="/images/mell-base.png" class="w-2/5" alt="" />
    </div>
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
  private readonly router = inject(Router);

  readonly issueTypes = input.required<IssueType[]>();

  readonly formValue = this.newIssueFormService.formValue;

  readonly photoUrl = computed(() => this.formValue().photoUrl);

  ngOnInit(): void {
    // TODO: send to AI

    // fake 3-second delay
    setTimeout(() => {
      // fake response from AI
      const typeId = this.issueTypes()[0].id;
      const description =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas blandit, ante in aliquam vehicula, augue magna rutrum odio, vitae luctus velit sapien at neque. Nunc ut condimentum orci, eget lobortis turpis.';

      this.formValue.update((value) => ({
        ...value,
        typeId,
        description,
      }));

      void this.router.navigateByUrl(`/new-issue/review`, {
        replaceUrl: true,
      });
    }, 5000);
  }
}
