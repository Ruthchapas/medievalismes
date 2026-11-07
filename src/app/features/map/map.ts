import {
  afterNextRender,
  ApplicationRef,
  Component,
  ComponentRef,
  createComponent,
  DestroyRef,
  effect,
  ElementRef,
  EnvironmentInjector,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as maplibregl from 'maplibre-gl';
import { map as mapOperator } from 'rxjs/operators';
import { resized } from '../../core/cms/image';
import { Place, PlaceHighlight, PlaceIconType } from '../../core/models/place.model';
import { FilterService } from '../../core/services/filter.service';
import { PlaceService } from '../../core/services/place.service';
import { createBrandMap, createPinElement } from '../../shared/map/brand-map';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { PlaceIcon } from '../../shared/ui/place-icon/place-icon';

/** Below this zoom the place names would pile on top of each other. */
const LABELS_MIN_ZOOM = 10.5;
/** From this zoom you're in the village, so the highlighted spots appear. */
const HIGHLIGHTS_MIN_ZOOM = 14.5;
/** Space a hover preview needs beside its pin (card width plus the gap). */
const PREVIEW_ROOM = 270;
/** How close to go when sent to a single highlight. */
const SPOT_ZOOM = 17;

interface SelectedHighlight {
  name: string;
  label: string;
  icon: PlaceIconType;
  placeName: string;
  placeSlug: string;
}

/** The place whose card is open (phones and tablets: tapping a pin opens a card instead of the fitxa). */
interface SelectedPlace {
  slug: string;
  name: string;
  comarca: string;
  photoUrl?: string;
}

@Component({
  selector: 'app-map',
  imports: [FilterBar, RouterLink, PlaceIcon],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map {
  private readonly placeService = inject(PlaceService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  protected readonly filters = inject(FilterService);

  private readonly mapContainer = viewChild.required<ElementRef<HTMLElement>>('mapContainer');

  /** The highlight whose card is open. */
  protected readonly selected = signal<SelectedHighlight | null>(null);
  protected readonly selectedPlace = signal<SelectedPlace | null>(null);

  /** A real mouse: pins show a preview on hover and open the fitxa on click. Touch has no hover. */
  private readonly hasHover = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
  private hoverPopup?: maplibregl.Popup;

  /**
   * `/mapa?lloc=rupit` opens the map framing that place and its highlights;
   * `&punt=Sant Miquel Arcàngel` goes straight to one of them and opens its card.
   */
  private readonly focus = toSignal(
    this.route.queryParamMap.pipe(mapOperator((params) => ({ slug: params.get('lloc'), spot: params.get('punt') }))),
    { initialValue: { slug: null as string | null, spot: null as string | null } },
  );

  private map?: maplibregl.Map;
  private readonly pins = new globalThis.Map<string, { element: HTMLElement; lngLat: [number, number] }>();
  private readonly highlightMarkers: { element: HTMLElement; placeSlug: string }[] = [];
  private readonly iconRefs: ComponentRef<PlaceIcon>[] = [];

  constructor() {
    afterNextRender(() => this.initMap());
    effect(() => this.syncPins(this.filters.places().map((place) => place.slug)));
    effect(() => {
      const { slug, spot } = this.focus();
      if (slug) this.focusPlace(slug, spot);
    });
  }

  private initMap(): void {
    const { slug: focus, spot } = this.focus();
    const target = focus ? this.findHighlight(focus, spot) : undefined;
    const map = createBrandMap({
      container: this.mapContainer().nativeElement,
      // Open on the highlight or place we were sent to, or framing every place; either way with
      // room at the sides for the names under the pins.
      ...(target
        ? { center: [target.highlight.lng!, target.highlight.lat!] as [number, number], zoom: SPOT_ZOOM }
        : {
            bounds: (focus && this.boundsAround(focus)) || this.allPlacesBounds(),
            fitBoundsOptions: focus
              ? { padding: this.focusPadding, maxZoom: 16.5 }
              : { padding: { top: 150, bottom: 130, left: 110, right: 110 }, maxZoom: 13 },
          }),
      maxZoom: 19,
      attributionControl: { compact: true },
    });
    this.map = map;

    if (target) {
      // Leaves room under the highlight for its card.
      map.jumpTo({ center: [target.highlight.lng!, target.highlight.lat!], zoom: SPOT_ZOOM, padding: this.spotPadding });
      this.showHighlight(target.place, target.highlight);
    }

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.on('click', () => this.closeCards());

    const updateZoomState = () => {
      const zoom = map.getZoom();
      const classes = map.getContainer().classList;
      classes.toggle('hide-pin-labels', zoom < LABELS_MIN_ZOOM);
      classes.toggle('show-highlights', zoom >= HIGHLIGHTS_MIN_ZOOM);
    };
    map.on('zoom', updateZoomState);
    updateZoomState();

    for (const place of this.placeService.getAll()) {
      const element = createPinElement(place.name);
      this.wirePin(element, place);
      new maplibregl.Marker({ element, anchor: 'bottom' }).setLngLat([place.lng, place.lat]).addTo(map);
      this.pins.set(place.slug, { element, lngLat: [place.lng, place.lat] });

      for (const highlight of place.highlights) {
        if (highlight.lat === undefined || highlight.lng === undefined) continue;
        const marker = this.createHighlightElement(highlight.icon, highlight.name);
        marker.addEventListener('click', (event) => {
          // Otherwise the click would also reach the map and close the card straight away.
          event.stopPropagation();
          this.showHighlight(place, highlight);
        });
        new maplibregl.Marker({ element: marker, anchor: 'center' })
          .setLngLat([highlight.lng, highlight.lat])
          .addTo(map);
        this.highlightMarkers.push({ element: marker, placeSlug: place.slug });
      }
    }

    this.syncPins(this.filters.places().map((place) => place.slug));
    this.destroyRef.onDestroy(() => {
      this.hoverPopup?.remove();
      for (const ref of this.iconRefs) ref.destroy();
      map.remove();
    });
  }

  /** A round badge with the drawing for the highlight (the same icon as in the fitxa) and its name. */
  private createHighlightElement(icon: PlaceIconType, name: string): HTMLElement {
    const element = document.createElement('button');
    element.className = 'map-highlight';
    element.type = 'button';
    element.setAttribute('aria-label', name);

    const badge = document.createElement('span');
    badge.className = 'map-highlight__badge';

    // Reuse the PlaceIcon component so the drawing lives in one place only.
    const iconRef = createComponent(PlaceIcon, {
      environmentInjector: this.injector,
      hostElement: document.createElement('app-place-icon'),
    });
    iconRef.setInput('type', icon);
    this.appRef.attachView(iconRef.hostView);
    iconRef.changeDetectorRef.detectChanges();
    this.iconRefs.push(iconRef);
    badge.append(iconRef.location.nativeElement);

    const label = document.createElement('span');
    label.className = 'map-highlight__label';
    label.textContent = name;

    element.append(badge, label);
    return element;
  }

  private readonly focusPadding = { top: 170, bottom: 230, left: 90, right: 90 };
  private readonly spotPadding = { top: 120, bottom: 260, left: 40, right: 40 };

  protected closeCards(): void {
    this.selected.set(null);
    this.selectedPlace.set(null);
  }

  /**
   * With a mouse, hovering a pin previews the place and clicking opens its fitxa. On touch screens there
   * is no hover, so tapping opens a card with the cover photo and a button to the fitxa.
   */
  private wirePin(element: HTMLElement, place: Place): void {
    const hover = this.hasHover();

    if (hover) {
      const show = () => this.showPreview(place);
      const hide = () => this.hoverPopup?.remove();
      element.addEventListener('mouseenter', show);
      element.addEventListener('mouseleave', hide);
      element.addEventListener('focus', show);
      element.addEventListener('blur', hide);
    }

    element.addEventListener('click', (event) => {
      if (hover) {
        this.router.navigate(['/lloc', place.slug]);
        return;
      }
      // Otherwise the tap would also reach the map and close the card straight away.
      event.stopPropagation();
      this.showPlaceCard(place);
    });
  }

  private showPlaceCard(place: Place): void {
    this.selected.set(null);
    this.selectedPlace.set({
      slug: place.slug,
      name: place.name,
      comarca: place.comarca,
      photoUrl: place.photoUrl ? resized(place.photoUrl, 400) : undefined,
    });
    // Brings the pin clear of the card.
    this.map?.easeTo({ center: [place.lng, place.lat], padding: this.spotPadding, duration: 500 });
  }

  private showPreview(place: Place): void {
    if (!this.map) return;
    this.hoverPopup?.remove();

    // Opens to the right of the pin when there is room for it, otherwise to the left.
    const container = this.map.getContainer();
    const point = this.map.project([place.lng, place.lat]);
    const side = container.clientWidth - point.x >= PREVIEW_ROOM ? 'left' : 'right';
    const vertical = point.y < 240 ? 'top-' : point.y > container.clientHeight - 240 ? 'bottom-' : '';
    const dx = side === 'right' ? -22 : 22;
    this.hoverPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: `${vertical}${side}` as maplibregl.PositionAnchor,
      offset: [dx, vertical === 'top-' ? 10 : vertical === 'bottom-' ? -34 : -22],
      maxWidth: '240px',
      className: 'place-popup',
    });

    const card = document.createElement('div');
    card.className = 'place-preview';
    if (place.photoUrl) {
      const image = document.createElement('img');
      image.className = 'place-preview__photo';
      image.src = resized(place.photoUrl, 480);
      image.alt = '';
      card.append(image);
    }
    const text = document.createElement('div');
    text.className = 'place-preview__text';
    const comarca = document.createElement('p');
    comarca.className = 'place-preview__comarca';
    comarca.textContent = place.comarca;
    const name = document.createElement('p');
    name.className = 'place-preview__name';
    name.textContent = place.name;
    const hint = document.createElement('p');
    hint.className = 'place-preview__hint';
    hint.textContent = 'Clica per veure la fitxa';
    text.append(comarca, name, hint);
    card.append(text);

    this.hoverPopup.setLngLat([place.lng, place.lat]).setDOMContent(card).addTo(this.map);
  }

  private showHighlight(place: Place, highlight: PlaceHighlight): void {
    this.selectedPlace.set(null);
    this.selected.set({
      name: highlight.name,
      label: highlight.label,
      icon: highlight.icon,
      placeName: place.name,
      placeSlug: place.slug,
    });
  }

  /** A highlight by name, if it has a location to go to. */
  private findHighlight(slug: string, spot: string | null) {
    const place = this.placeService.getBySlug(slug);
    const highlight = spot ? place?.highlights.find((item) => item.name === spot) : undefined;
    return place && highlight && highlight.lat !== undefined && highlight.lng !== undefined
      ? { place, highlight }
      : undefined;
  }

  private allPlacesBounds(): maplibregl.LngLatBounds {
    const bounds = new maplibregl.LngLatBounds();
    for (const place of this.placeService.getAll()) bounds.extend([place.lng, place.lat]);
    return bounds;
  }

  /** The place plus its located highlights, so the zoom shows everything worth seeing there. */
  private boundsAround(slug: string): maplibregl.LngLatBounds | undefined {
    const place = this.placeService.getBySlug(slug);
    if (!place) return undefined;

    const bounds = new maplibregl.LngLatBounds([place.lng, place.lat], [place.lng, place.lat]);
    for (const highlight of place.highlights) {
      if (highlight.lat !== undefined && highlight.lng !== undefined) bounds.extend([highlight.lng, highlight.lat]);
    }
    return bounds;
  }

  private focusPlace(slug: string, spot: string | null): void {
    const target = this.findHighlight(slug, spot);
    if (this.map && target) {
      this.showHighlight(target.place, target.highlight);
      this.map.flyTo({
        center: [target.highlight.lng!, target.highlight.lat!],
        zoom: SPOT_ZOOM,
        padding: this.spotPadding,
        duration: 900,
      });
      return;
    }

    const bounds = this.boundsAround(slug);
    if (!this.map || !bounds) return;
    this.closeCards();
    this.map.fitBounds(bounds, { padding: this.focusPadding, maxZoom: 16.5, duration: 900 });
  }

  /** Shows only the pins that match the current filter and frames them. */
  private syncPins(visibleSlugs: string[]): void {
    if (!this.map) return;

    const visible = new Set(visibleSlugs);
    const bounds = new maplibregl.LngLatBounds();
    if (this.selectedPlace() && !visible.has(this.selectedPlace()!.slug)) this.selectedPlace.set(null);

    for (const [slug, pin] of this.pins) {
      const isVisible = visible.has(slug);
      pin.element.style.display = isVisible ? '' : 'none';
      if (isVisible) bounds.extend(pin.lngLat);
    }
    for (const { element, placeSlug } of this.highlightMarkers) {
      element.classList.toggle('is-filtered-out', !visible.has(placeSlug));
    }

    if (this.filters.isActive() && !bounds.isEmpty()) {
      this.map.fitBounds(bounds, {
        padding: { top: 150, bottom: 130, left: 60, right: 60 },
        maxZoom: 13.5,
        duration: 600,
      });
    }
  }
}
