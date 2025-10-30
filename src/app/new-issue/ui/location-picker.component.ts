import {
  Component,
  signal,
  ChangeDetectionStrategy,
  forwardRef,
  output,
} from '@angular/core';
import {
  FormsModule,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

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
  imports: [FormsModule, ButtonDirective, InputTextModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationPickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="mx-auto p-4">
      @if (!locationSelected()) {
        <!-- Initial State -->
        <div class="flex flex-col gap-4">
          <button
            pButton
            type="button"
            class="p-button-rounded"
            (click)="useCurrentLocation()"
            [disabled]="isLoadingLocation()"
          >
            @if (isLoadingLocation()) {
              <span
                class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
              ></span>
              <span>Getting your location...</span>
            } @else {
              📍 Use My Location
            }
          </button>

          <!-- Or -->
          <div class="my-2 flex items-center text-center">
            <div class="border-primary-900/30 flex-1 border-b"></div>
            <span class="px-4 text-sm">Or</span>
            <div class="border-primary-900/30 flex-1 border-b"></div>
          </div>

          <div class="flex flex-col gap-2">
            <label for="address-input" class="text-sm font-semibold">
              Enter an address
            </label>
            <input
              pInputText
              id="address-input"
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="searchAddress()"
              placeholder="123 Main St, City, State"
              class="w-full"
            />
            <button
              pButton
              type="button"
              class="p-button-rounded"
              (click)="searchAddress()"
              [disabled]="!searchQuery() || isSearching()"
            >
              @if (isSearching()) {
                <span
                  class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                ></span>
              } @else {
                <span>Search</span>
              }
            </button>
          </div>

          <!-- Or -->
          <div class="my-2 flex items-center text-center">
            <div class="border-primary-900/30 flex-1 border-b"></div>
            <span class="px-4 text-sm">Or</span>
            <div class="border-primary-900/30 flex-1 border-b"></div>
          </div>

          <button
            pButton
            type="button"
            class="p-button-rounded p-button-secondary"
            (click)="showMapPicker()"
          >
            🗺️ Pick location on map
          </button>

          @if (errorMessage()) {
            <div
              class="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3.5 text-sm text-red-800"
            >
              {{ errorMessage() }}
            </div>
          }
        </div>
      } @else {
        <!-- Location Selected State -->
        <div class="flex flex-col gap-4">
          <div
            class="h-[400px] w-full overflow-hidden rounded-lg border-2 border-gray-300 sm:h-[300px]"
            #mapContainer
          >
            <!-- Leaflet map will be initialized here -->
          </div>

          <div class="flex flex-col gap-2 rounded-lg bg-gray-50 p-4">
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
            <div class="font-mono text-sm text-gray-600">
              {{ currentLatitude().toFixed(6) }},
              {{ currentLongitude().toFixed(6) }}
            </div>
            <p class="mt-2 text-sm text-gray-600">
              Drag the pin to adjust the location
            </p>
          </div>

          <div class="mt-2 grid grid-cols-2 gap-3">
            <button
              pButton
              type="button"
              class="p-button-rounded p-button-secondary"
              (click)="resetSelection()"
            >
              Change Location
            </button>
            <button
              pButton
              type="button"
              class="p-button-rounded"
              (click)="onConfirmLocation()"
              [disabled]="isLoadingAddress()"
            >
              Confirm Location
            </button>
          </div>

          @if (errorMessage()) {
            <div
              class="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3.5 text-sm text-red-800"
            >
              {{ errorMessage() }}
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationPickerComponent implements ControlValueAccessor {
  // Outputs
  readonly confirmLocation = output();

  // State
  searchQuery = signal('');
  locationSelected = signal(false);
  currentLatitude = signal(0);
  currentLongitude = signal(0);
  currentAddress = signal('');
  isLoadingLocation = signal(false);
  isLoadingAddress = signal(false);
  isSearching = signal(false);
  errorMessage = signal('');

  // Leaflet map instance
  private map: any = null;
  private marker: any = null;

  // ControlValueAccessor
  private onChange: (value: LocationData | null) => void = () => {};
  private onTouched: () => void = () => {};
  disabled = false;

  constructor() {
    // Load Leaflet dynamically
    this.loadLeaflet();
  }

  writeValue(value: LocationData | null): void {
    if (value) {
      this.currentLatitude.set(value.latitude);
      this.currentLongitude.set(value.longitude);
      this.currentAddress.set(value.address);
      this.locationSelected.set(true);
      this.initializeMap();
    } else {
      this.resetSelection();
    }
  }

  registerOnChange(fn: (value: LocationData | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

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
    if (this.disabled) return;

    this.errorMessage.set('');
    this.onTouched();

    if (!navigator.geolocation) {
      this.errorMessage.set('Geolocation is not supported by your browser');
      return;
    }

    this.isLoadingLocation.set(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        this.currentLatitude.set(position.coords.latitude);
        this.currentLongitude.set(position.coords.longitude);
        this.locationSelected.set(true);
        this.isLoadingLocation.set(false);

        await this.initializeMap();
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
    if (this.disabled) return;

    const query = this.searchQuery().trim();
    if (!query) return;

    this.errorMessage.set('');
    this.isSearching.set(true);
    this.onTouched();

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
      this.currentLatitude.set(parseFloat(result.lat));
      this.currentLongitude.set(parseFloat(result.lon));
      this.currentAddress.set(result.display_name);
      this.locationSelected.set(true);
      this.isSearching.set(false);

      await this.initializeMap();
    } catch (error) {
      this.errorMessage.set('Error searching for address. Please try again.');
      this.isSearching.set(false);
    }
  }

  async showMapPicker(): Promise<void> {
    if (this.disabled) return;

    this.onTouched();
    // Default to a reasonable center point (you can customize this)
    this.currentLatitude.set(39.8283); // Center of USA
    this.currentLongitude.set(-98.5795);
    this.currentAddress.set('Drag the pin to select a location');
    this.locationSelected.set(true);

    await this.initializeMap();
  }

  private async initializeMap(): Promise<void> {
    // Wait for Leaflet to load
    await this.loadLeaflet();

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const L = (window as any).L;
      if (!L) return;

      const container = document.querySelector('.w-full.h-\\[400px\\]');
      if (!container) return;

      // Remove existing map if present
      if (this.map) {
        this.map.remove();
      }

      // Initialize map
      this.map = L.map(container).setView(
        [this.currentLatitude(), this.currentLongitude()],
        15,
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      // Add draggable marker
      this.marker = L.marker(
        [this.currentLatitude(), this.currentLongitude()],
        { draggable: !this.disabled },
      ).addTo(this.map);

      // Handle marker drag
      this.marker.on('dragend', async () => {
        const position = this.marker.getLatLng();
        this.currentLatitude.set(position.lat);
        this.currentLongitude.set(position.lng);
        await this.reverseGeocode(position.lat, position.lng);
      });
    }, 100);
  }

  private async reverseGeocode(lat: number, lon: number): Promise<void> {
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
      this.currentAddress.set(result.display_name);
    } catch (error) {
      this.currentAddress.set('Unable to load address');
      this.errorMessage.set('Could not load address for this location.');
    } finally {
      this.isLoadingAddress.set(false);
    }
  }

  resetSelection(): void {
    if (this.disabled) return;

    this.locationSelected.set(false);
    this.searchQuery.set('');
    this.errorMessage.set('');
    this.currentAddress.set('');
    this.onChange(null);

    // Cleanup map
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }

  onConfirmLocation(): void {
    if (this.disabled || this.isLoadingAddress()) return;

    const locationData: LocationData = {
      latitude: this.currentLatitude(),
      longitude: this.currentLongitude(),
      address: this.currentAddress(),
    };

    this.onChange(locationData);
    this.confirmLocation.emit();
  }
}
