import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { LocationData } from '../ui/location-picker.component';
import { SelectModule } from 'primeng/select';
import { Issue } from '../../../../types/db-types';
import { ArrowLeft, LucideAngularModule, Trash2 } from 'lucide-angular';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { NewIssueFormService } from '../data-access/new-issue-form.service';

export type NewIssueFormModel = Pick<
  Required<Issue>,
  'communityId' | 'typeId' | 'otherTypeName' | 'photoUrl' | 'description'
> & {
  location: LocationData;
};

@Component({
  selector: 'mell-new-issue-page',
  imports: [
    FormsModule,
    SelectModule,
    RouterOutlet,
    LucideAngularModule,
    ConfirmDialog,
  ],
  template: `
    <div class="flex justify-between pt-3 pb-5">
      <button class="pr-3 pb-3" (click)="goBack()">
        <lucide-icon [img]="ArrowLeft" />
      </button>

      <button class="pb-3 pl-3" (click)="confirmDiscard()">
        <lucide-icon [img]="Trash2" />
      </button>
    </div>

    <router-outlet />

    <p-confirm-dialog />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewIssuePageComponent {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly newIssueFormService = inject(NewIssueFormService);
  private readonly router = inject(Router);

  goBack(): void {
    window.history.back();
  }

  confirmDiscard(): void {
    this.confirmationService.confirm({
      header: 'Discard this new issue?',
      message: 'Your progress will be lost.',
      closable: false,
      accept: () => {
        this.newIssueFormService.resetForm();
        void this.router.navigate(['/home']);
      },
    });
  }

  protected readonly ArrowLeft = ArrowLeft;
  protected readonly Trash2 = Trash2;
}
