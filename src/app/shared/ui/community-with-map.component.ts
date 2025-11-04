import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
} from '@angular/core';
import {
  LocationDataWithRadius,
  LocationWithRadiusPickerComponent,
} from '../../new-community/ui/location-with-radius-picker.component';
import { Community } from '../../../../types/db-types';
import { Field, form } from '@angular/forms/signals';

@Component({
  selector: 'mell-community-with-map',
  imports: [LocationWithRadiusPickerComponent, Field],
  template: `
    <mell-location-with-radius-picker
      [field]="locationField"
      [readonly]="true"
      flatBottom
    />
    <div
      class="flex w-full items-center justify-center gap-3 rounded-b-2xl bg-white px-5 py-3 text-xl font-semibold"
    >
      <img
        [src]="communityLogoUrl()"
        alt=""
        class="size-8 shrink-0 rounded-full"
      />

      {{ communityName() }}
    </div>
  `,
  host: {
    class: 'block w-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityWithMapComponent {
  readonly community = input.required<Community>();

  readonly communityName = computed(() => this.community().name);
  readonly communityLogoUrl = computed(() => this.community().logoUrl);

  private readonly location = linkedSignal(
    (): LocationDataWithRadius => ({
      latitude: this.community().geographicCenter[0],
      longitude: this.community().geographicCenter[1],
      radiusMeters: this.community().radiusMeters,
    }),
  );

  readonly locationField = form(this.location);
}
