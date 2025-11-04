import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Crosshair,
  LucideAngularModule,
  Navigation,
  Search,
  X,
} from 'lucide-angular';
import { ButtonDirective } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Issue } from '../../../../types/db-types';
import { ErrorMessageComponent } from '../../shared/ui/error-message.component';
import { IssueStatusPillComponent } from '../../shared/ui/issue-status-pill.component';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

const NOMINATIM_USER_AGENT = 'Mell - Smart Community Issue Reporting';
const DEFAULT_ZOOM = 11;
const MARKER_SIZE = 80;

@Component({
  selector: 'mell-existing-issue-map',
  imports: [
    FormsModule,
    ButtonDirective,
    InputTextModule,
    LucideAngularModule,
    InputGroup,
    InputGroupAddon,
    ErrorMessageComponent,
    IssueStatusPillComponent,
    ImageModule,
  ],
  template: `
    <div class="flex h-full flex-col gap-4">
      <!-- Jump to My Location Button -->
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
          <lucide-icon [img]="Navigation" size="20" /> Jump to My Location
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
          class="border-primary-800 z-0 h-56 w-full overflow-hidden rounded-t-lg rounded-b-none sm:h-[300px]"
          id="map-container"
        >
          <!-- Leaflet map will be initialized here -->
        </div>

        <!-- Issue Info -->
        @if (selectedIssue(); as issue) {
          <div
            class="absolute bottom-[1rem] z-5 flex h-[25rem] w-[calc(100%-2rem)] flex-col gap-3 overflow-y-auto rounded-lg bg-gray-50 px-4 py-3 shadow-[0_-10px_10px_rgba(0,0,0,0.25)]"
          >
            <div class="flex justify-between">
              <!-- Issue Type -->
              <div class="text-lg font-semibold text-gray-900">
                {{ issue.type?.name ?? 'Unknown Issue' }}
              </div>

              <!-- Close Button -->
              <button
                class="rounded-full p-1 text-gray-500 active:bg-gray-200"
                (click)="hideSelectedIssue()"
              >
                <lucide-icon [img]="X" [size]="20" />
              </button>
            </div>

            <!-- Center on Map Button -->
            <button
              class="text-primary-500 active:text-primary-600 flex items-center gap-2 self-start rounded p-1 text-sm font-semibold transition-colors active:bg-gray-200"
              (click)="centerOnSelectedIssue()"
              type="button"
            >
              <lucide-icon [img]="Crosshair" [size]="16" />
              <span>Center Issue on Map</span>
            </button>

            <!-- Issue Status -->
            <div class="flex gap-2 text-sm text-gray-600">
              <strong>Status:</strong>
              <mell-issue-status-pill [status]="issue.status" />
            </div>

            <!-- Issue Description -->
            @if (issue.description) {
              <div class="text-sm text-gray-600">
                <strong>Description:</strong>
                {{ issue.description }}
              </div>
            }

            <!-- Issue Address -->
            <div class="text-sm text-gray-600">
              <strong>Reported at:</strong>
              {{ issue.address }}
            </div>

            <!-- Issue Photo -->
            <div class="flex flex-col gap-1 text-sm text-gray-600">
              <strong>Images (click to enlarge):</strong>
              <p-image
                [src]="issue.photoUrl"
                [alt]="issue.description"
                width="96"
                [preview]="true"
                styleClass="rounded-full"
              />
            </div>
          </div>
        } @else {
          <div
            class="rounded-t-none rounded-b-lg bg-gray-50 px-4 py-3 text-base text-gray-600"
          >
            Click on a marker to view issue details
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExistingIssueMapComponent implements OnInit {
  // Inputs
  readonly issues = input.required<Issue[]>();
  readonly initialCenter = input<[number, number]>([39.145024, -84.506283]);

  // State
  readonly searchQuery = signal('');
  readonly isLoadingLocation = signal(false);
  readonly isSearching = signal(false);
  readonly errorMessage = signal('');
  readonly selectedIssue = signal<Issue | null>(null);

  // Leaflet map instance
  private map: any = null;
  private markers: Map<string, any> = new Map();

  constructor() {
    // Watch for changes to issues input and update markers
    effect(() => {
      const currentIssues = this.issues();
      if (this.map) {
        this.updateMarkers(currentIssues);
      }
    });

    // Watch for selected issue changes to update marker styles
    effect(() => {
      const selected = this.selectedIssue();
      this.updateMarkerStyles(selected);
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
    this.errorMessage.set('');

    if (!navigator.geolocation) {
      this.errorMessage.set('Geolocation is not supported by your browser');
      return;
    }

    this.isLoadingLocation.set(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.isLoadingLocation.set(false);

        // Update map view
        if (this.map) {
          this.map.setView(
            [position.coords.latitude, position.coords.longitude],
            DEFAULT_ZOOM,
          );
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
      this.isSearching.set(false);

      // Update map view
      if (this.map) {
        this.map.setView(
          [parseFloat(result.lat), parseFloat(result.lon)],
          DEFAULT_ZOOM,
        );
      }
    } catch (error) {
      this.errorMessage.set('Error searching for address. Please try again.');
      this.isSearching.set(false);
    }
  }

  hideSelectedIssue(): void {
    this.selectedIssue.set(null);
  }

  centerOnSelectedIssue(): void {
    const issue = this.selectedIssue();
    if (issue && this.map) {
      this.map.setView(issue.coordinates, 16);
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
      const center = this.initialCenter();
      this.map = L.map(container).setView(center, DEFAULT_ZOOM);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.map);

      // Add markers for all issues
      this.updateMarkers(this.issues());
    }, 100);
  }

  private createMarkerIcon(issue: Issue, isSelected: boolean): any {
    const L = (window as any).L;
    if (!L) return null;

    // Create custom icon HTML with pin shape
    const borderWidth = isSelected ? 6 : 3;
    const borderColor = isSelected ? '#ea580c' : '#ffffff';
    const shadowSize = isSelected
      ? '0 6px 16px rgba(0,0,0,0.4)'
      : '0 4px 10px rgba(0,0,0,0.3)';
    const scale = isSelected ? 1.1 : 1;
    const pinHeight = 20; // Height of the triangular point

    if (issue.photoUrl) {
      const iconHtml = `
        <div style="
          position: relative;
          width: ${MARKER_SIZE}px;
          height: ${MARKER_SIZE + pinHeight}px;
          transform: scale(${scale});
          transition: transform 0.2s ease;
          cursor: pointer;
        ">
          <!-- Circular photo container -->
          <div style="
            width: ${MARKER_SIZE}px;
            height: ${MARKER_SIZE}px;
            border-radius: 50%;
            overflow: hidden;
            border: ${borderWidth}px solid ${borderColor};
            box-shadow: ${shadowSize};
            background: white;
            transition: border 0.2s ease, box-shadow 0.2s ease;
            position: relative;
            z-index: 2;
          ">
            <img
              src="${issue.photoUrl}"
              style="
                width: 100%;
                height: 100%;
                object-fit: cover;
              "
            />
          </div>

          <!-- Pin point (triangle) -->
          <div style="
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%) translateY(-5px);
            width: 0;
            height: 0;
            border-left: ${pinHeight / 2}px solid transparent;
            border-right: ${pinHeight / 2}px solid transparent;
            border-top: ${pinHeight}px solid ${borderColor};
            z-index: 1;
            transition: border-top-color 0.2s ease;
          "></div>
        </div>
      `;

      return L.divIcon({
        html: iconHtml,
        className: 'custom-marker-icon',
        iconSize: [MARKER_SIZE, MARKER_SIZE + pinHeight],
        iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE + pinHeight],
      });
    } else {
      // Return default Leaflet marker icon
      return new L.Icon.Default();
    }
  }

  private updateMarkers(issues: Issue[]): void {
    const L = (window as any).L;
    if (!L || !this.map) return;

    // Clear existing markers
    this.markers.forEach((marker) => marker.remove());
    this.markers.clear();

    // Add new markers
    issues.forEach((issue) => {
      const isSelected = this.selectedIssue()?.id === issue.id;
      const icon = this.createMarkerIcon(issue, isSelected);

      const marker = L.marker(issue.coordinates, { icon }).addTo(this.map);

      // Add click event to show issue details
      marker.on('click', () => {
        this.selectedIssue.set(issue);
      });

      // Store marker reference
      this.markers.set(issue.id, marker);
    });
  }

  private updateMarkerStyles(selectedIssue: Issue | null): void {
    const L = (window as any).L;
    if (!L || !this.map) return;

    // Update all markers to reflect selected state
    this.issues().forEach((issue) => {
      const marker = this.markers.get(issue.id);
      if (marker) {
        const isSelected = selectedIssue?.id === issue.id;
        const icon = this.createMarkerIcon(issue, isSelected);
        marker.setIcon(icon);
      }
    });
  }

  protected readonly Navigation = Navigation;
  protected readonly Search = Search;
  protected readonly Crosshair = Crosshair;
  protected readonly X = X;
}
