import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LucideAngularModule, Navigation, Search } from 'lucide-angular';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { FormValueControl } from '@angular/forms/signals';
import { ErrorMessageComponent } from '../../shared/ui/error-message.component';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
}

const NOMANATIM_USER_AGENT = 'Mell - Smart Community Issue Reporting';

@Component({
  selector: 'mell-location-picker',
  imports: [
    FormsModule,
    ButtonDirective,
    InputTextModule,
    LucideAngularModule,
    InputGroup,
    InputGroupAddon,
    ErrorMessageComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationPickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-4">
      <!-- Use My Location Button -->
      <button
        pButton
        type="button"
        (click)="useCurrentLocation()"
        [disabled]="isLoadingLocation()"
      >
        @if (isLoadingLocation()) {
          <span
            class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          ></span>
          <span>Locating...</span>
        } @else {
          <lucide-icon [img]="Navigation" size="20" /> Use My Location
        }
      </button>

      <!-- Address Search -->
      <p-inputgroup>
        <input
          pInputText
          id="address-input"
          type="text"
          [(ngModel)]="searchQuery"
          (keyup.enter)="searchAddress()"
          placeholder="Search for an address"
          class="w-full"
          [disabled]="isSearching()"
        />
        <p-inputgroup-addon>
          <button
            pButton
            class="p-button-text p-button-secondary"
            (click)="searchAddress()"
            [disabled]="isSearching()"
          >
            <lucide-icon [img]="Search" size="20" />
          </button>
        </p-inputgroup-addon>
      </p-inputgroup>

      @if (errorMessage()) {
        <mell-error-message>
          {{ errorMessage() }}
        </mell-error-message>
      }

      <!-- Map -->
      <div>
        <div
          class="border-primary-800 h-56 w-full overflow-hidden rounded-t-lg rounded-b-none sm:h-[300px]"
          id="map-container"
        >
          <!-- Leaflet map will be initialized here -->
        </div>

        <!-- Location Info -->
        <div
          class="flex flex-col gap-2 rounded-t-none rounded-b-lg bg-gray-50 px-4 py-3"
        >
          <div class="flex items-center gap-2 text-base text-gray-900">
            @if (isLoadingAddress()) {
              <span
                class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
              ></span>
              <span>Loading address...</span>
            } @else {
              <strong>{{ currentAddress() }}</strong>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationPickerComponent
  implements FormValueControl<LocationData>, OnInit
{
  // Form control values
  readonly value = model<LocationData>({
    latitude: 0,
    longitude: 0,
    address: '',
  });
  readonly disabled = input(false);

  // State
  readonly searchQuery = signal('');
  readonly isLoadingLocation = signal(false);
  readonly isLoadingAddress = signal(false);
  readonly isSearching = signal(false);
  readonly errorMessage = signal('');

  readonly currentAddress = computed(() => this.value().address);

  // Leaflet map instance
  private map: any = null;
  private marker: any = null;

  ngOnInit() {
    // Load Leaflet and initialize map
    this.loadLeaflet().then(() => {
      this.initializeMap();
      this.reverseGeocode(this.value().latitude, this.value().longitude);
    });
  }

  // readonly syncMap = effect(() => {
  //   console.log('test');
  //
  //   const { latitude, longitude } = this.value();
  //
  //   if (this.map) {
  //     this.map.setView([latitude, longitude], 15);
  //     if (this.marker) {
  //       this.marker.setLatLng([latitude, longitude]);
  //     }
  //   }
  // });

  private async loadLeaflet(): Promise<void> {
    // Add Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!(window as any).L) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  }

  async useCurrentLocation(): Promise<void> {
    if (this.disabled()) return;

    this.errorMessage.set('');

    if (!navigator.geolocation) {
      this.errorMessage.set('Geolocation is not supported by your browser');
      return;
    }

    this.isLoadingLocation.set(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        this.value.update((value) => ({
          ...value,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));

        this.isLoadingLocation.set(false);

        // Update map view
        if (this.map) {
          this.map.setView(
            [position.coords.latitude, position.coords.longitude],
            17,
          );
          if (this.marker) {
            this.marker.setLatLng([
              position.coords.latitude,
              position.coords.longitude,
            ]);
          }
        }

        await this.reverseGeocode(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      (error) => {
        this.isLoadingLocation.set(false);
        let errorMsg = 'Unable to get your location. ';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg += 'Location request timed out.';
            break;
        }

        this.errorMessage.set(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  async searchAddress(): Promise<void> {
    if (this.disabled()) return;

    const query = this.searchQuery().trim();
    if (!query) return;

    this.errorMessage.set('');
    this.isSearching.set(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'User-Agent': NOMANATIM_USER_AGENT,
          },
        },
      );

      const results: NominatimResult[] = await response.json();

      if (results.length === 0) {
        this.errorMessage.set(
          'Address not found. Please try a different search.',
        );
        this.isSearching.set(false);
        return;
      }

      const result = results[0];

      this.value.set({
        latitude: Number(result.lat),
        longitude: Number(result.lon),
        address: result.display_name,
      });
      this.isSearching.set(false);

      // Update map view
      if (this.map) {
        this.map.setView([parseFloat(result.lat), parseFloat(result.lon)], 15);
        if (this.marker) {
          this.marker.setLatLng([
            parseFloat(result.lat),
            parseFloat(result.lon),
          ]);
        }
      }
    } catch (error) {
      this.errorMessage.set('Error searching for address. Please try again.');
      this.isSearching.set(false);
    }
  }

  private async initializeMap(): Promise<void> {
    // Wait for Leaflet to load
    await this.loadLeaflet();

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const L = (window as any).L;
      if (!L) return;

      const container = document.getElementById('map-container');
      if (!container) return;

      // Remove existing map if present
      if (this.map) {
        this.map.remove();
      }

      // Initialize map
      this.map = L.map(container).setView(
        [this.value().latitude, this.value().longitude],
        19,
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.map);

      // Add marker
      this.marker = L.marker([
        this.value().latitude,
        this.value().longitude,
      ]).addTo(this.map);

      this.map.on('move', () => {
        const position = this.map.getCenter();
        this.marker.setLatLng([position.lat, position.lng]);
        this.value.update((value) => ({
          ...value,
          latitude: position.lat,
          longitude: position.lng,
        }));
      });

      this.map.on('moveend', async () => {
        await this.reverseGeocode(
          this.value().latitude,
          this.value().longitude,
        );
      });
    }, 100);
  }

  private async reverseGeocode(lat: number, lon: number): Promise<void> {
    this.value.update((value) => ({
      ...value,
      address: '',
    }));

    this.isLoadingAddress.set(true);
    this.errorMessage.set('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': NOMANATIM_USER_AGENT,
          },
        },
      );

      const result: NominatimResult = await response.json();
      this.value.update((value) => ({
        ...value,
        address: result.display_name,
      }));
    } catch (error) {
      this.errorMessage.set('Could not load address for this location.');
    } finally {
      this.isLoadingAddress.set(false);
    }
  }

  protected readonly Navigation = Navigation;
  protected readonly Search = Search;
}
