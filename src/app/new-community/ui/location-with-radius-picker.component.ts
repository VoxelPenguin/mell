import { ChangeDetectionStrategy, Component, computed, effect, input, model, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { Loader, LucideAngularModule, Navigation, Search } from 'lucide-angular';
import { ButtonDirective } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { ErrorMessageComponent } from '../../shared/ui/error-message.component';

export interface LocationDataWithRadius {
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

const NOMINATIM_USER_AGENT = 'Mell - Smart Community Issue Reporting';
const MIN_RADIUS_METERS = 500;
const MAX_RADIUS_METERS = 25000;
const PRIMARY_COLOR = '#f54a00';

@Component({
  selector: 'mell-location-with-radius-picker',
  imports: [
    FormsModule,
    ButtonDirective,
    InputTextModule,
    LucideAngularModule,
    InputGroup,
    InputGroupAddon,
    SliderModule,
    ErrorMessageComponent,
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
        <lucide-icon
          [img]="navigationIcon()"
          size="20"
          [class.animate-spin]="isLoadingLocation()"
        />
        @if (isLoadingLocation()) {
          Locating...
        } @else {
          Use My Location
        }
      </button>

      <!-- Address Search -->
      <p-inputgroup>
        <input
          pInputText
          id="address-input"
          type="text"
          [(ngModel)]="searchQuery"
          (keydown.enter)="searchAddress()"
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
            <lucide-icon
              [img]="searchIcon()"
              size="20"
              [class.animate-spin]="isSearching()"
            />
          </button>
        </p-inputgroup-addon>
      </p-inputgroup>

      @if (errorMessage()) {
        <mell-error-message>
          {{ errorMessage() }}
        </mell-error-message>
      }

      <!-- Radius Slider -->
      <div class="flex flex-col gap-2">
        <label for="radius-slider" class="text-sm font-semibold text-gray-700">
          Radius: {{ radiusInKm() }}km
        </label>
        <p-slider
          id="radius-slider"
          [ngModel]="value().radiusMeters"
          (ngModelChange)="onRadiusChange($event)"
          (onSlideEnd)="onRadiusSlideEnd()"
          [min]="minRadius"
          [max]="maxRadius"
          [step]="10"
          [disabled]="disabled()"
        />
      </div>

      <!-- Map -->
      <div>
        <div
          class="border-primary-800 h-56 w-full overflow-hidden rounded-lg sm:h-[300px]"
          id="map-container"
        >
          <!-- Leaflet map will be initialized here -->
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationWithRadiusPickerComponent
  implements FormValueControl<LocationDataWithRadius>, OnInit
{
  // Form control values
  readonly value = model<LocationDataWithRadius>({
    latitude: 0,
    longitude: 0,
    radiusMeters: MIN_RADIUS_METERS,
  });
  readonly disabled = input(false);

  // State
  readonly searchQuery = signal('');
  readonly isLoadingLocation = signal(false);
  readonly isSearching = signal(false);
  readonly errorMessage = signal('');

  readonly radiusMeters = computed(() => this.value().radiusMeters);
  readonly radiusInKm = computed(() => (this.radiusMeters() / 1000).toFixed(1));
  readonly navigationIcon = computed(() =>
    this.isLoadingLocation() ? Loader : Navigation,
  );
  readonly searchIcon = computed(() => (this.isSearching() ? Loader : Search));

  readonly minRadius = MIN_RADIUS_METERS;
  readonly maxRadius = MAX_RADIUS_METERS;

  private mapMoveWasFromAddressSearch = false;

  // Leaflet map instance
  private map: any = null;
  private marker: any = null;
  private circle: any = null;

  constructor() {
    // Sync radius changes to circle in real-time
    effect(() => {
      const radius = this.radiusMeters();

      if (this.circle) {
        this.circle.setRadius(radius);
      }
    });
  }

  ngOnInit() {
    // Load Leaflet and initialize map
    this.loadLeaflet().then(() => {
      this.initializeMap();
    });
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
            15,
          );
          if (this.marker) {
            this.marker.setLatLng([
              position.coords.latitude,
              position.coords.longitude,
            ]);
          }
          if (this.circle) {
            this.circle.setLatLng([
              position.coords.latitude,
              position.coords.longitude,
            ]);
            this.fitMapToCircle();
          }
        }
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
            'User-Agent': NOMINATIM_USER_AGENT,
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

      this.value.update((v) => ({
        ...v,
        latitude: Number(result.lat),
        longitude: Number(result.lon),
      }));
      this.isSearching.set(false);

      // Update map view
      if (this.map) {
        this.mapMoveWasFromAddressSearch = true;
        setTimeout(() => {
          this.mapMoveWasFromAddressSearch = false;
        }, 100);

        this.map.setView([parseFloat(result.lat), parseFloat(result.lon)]);
        if (this.marker) {
          this.marker.setLatLng([
            parseFloat(result.lat),
            parseFloat(result.lon),
          ]);
        }
        if (this.circle) {
          this.circle.setLatLng([
            parseFloat(result.lat),
            parseFloat(result.lon),
          ]);
          this.fitMapToCircle();
        }
      }
    } catch (error) {
      this.errorMessage.set('Error searching for address. Please try again.');
      this.isSearching.set(false);
    }
  }

  onRadiusChange(newRadius: number): void {
    this.value.update((v) => ({
      ...v,
      radiusMeters: newRadius,
    }));
  }

  onRadiusSlideEnd(): void {
    // Fit map to circle after user finishes dragging
    this.fitMapToCircle();
  }

  private async initializeMap(): Promise<void> {
    await this.loadLeaflet();

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
        15,
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

      // Add circle with primary color
      this.circle = L.circle([this.value().latitude, this.value().longitude], {
        radius: this.radiusMeters(),
        color: PRIMARY_COLOR,
        fillColor: PRIMARY_COLOR,
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(this.map);

      // Fit map to circle initially
      this.fitMapToCircle();

      this.map.on('move', () => {
        const position = this.map.getCenter();
        this.marker.setLatLng([position.lat, position.lng]);
        this.circle.setLatLng([position.lat, position.lng]);

        this.value.update((value) => ({
          ...value,
          latitude: position.lat,
          longitude: position.lng,
        }));
      });

      this.map.on('moveend', () => {
        if (this.mapMoveWasFromAddressSearch) return;
        // Position has been updated via the move event
      });
    }, 100);
  }

  private fitMapToCircle(): void {
    if (!this.map || !this.circle) return;

    const bounds = this.circle.getBounds();
    this.map.fitBounds(bounds, {
      padding: [16, 16], // 20px padding on all sides
      animate: true,
      duration: 0.3,
    });
  }

  protected readonly Navigation = Navigation;
}
