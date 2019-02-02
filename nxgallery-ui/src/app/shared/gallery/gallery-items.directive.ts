import { isPlatformBrowser } from '@angular/common';
import { Directive, EmbeddedViewRef, Inject, Input, NgZone, OnChanges, PLATFORM_ID, TemplateRef, ViewContainerRef } from '@angular/core';
import * as Draggabilly from 'draggabilly';

import { GalleryItem } from './gallery.component';

@Directive({
  selector: '[nxgGalleryItems]' // tslint:disable-line
})
export class GalleryItemsDirective implements OnChanges {
  @Input() nxgGalleryItemsOf: Array<GalleryItem>;
  @Input() nxgGalleryItemsGridInst: any;
  @Input('nxgGalleryItemsDraggable')
  set nxgGalleryItemsDraggable(draggable: boolean) {
    if (!draggable) {
      this.dragHandlersMap.forEach(dragHandlers => dragHandlers.forEach(draggie => draggie.disable()));
    } else {
      this.dragHandlersMap.forEach(dragHandlers => dragHandlers.forEach(draggie => draggie.enable()));
    }
  }

  private _items: Array<GalleryItem>;
  private readonly viewRefsMap: Map<string, EmbeddedViewRef<any>> = new Map<string, EmbeddedViewRef<any>>();
  private readonly dragHandlersMap: Map<string, Array<any>> = new Map<string, Array<any>>();

  private scrollingBy: number;

  constructor(
    private readonly templateRef: TemplateRef<any>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly zone: NgZone,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    this._items = [];
    this.scrollingBy = 0;
  }

  ngOnChanges(): void {
    const galleryItems = this.nxgGalleryItemsOf;
    if (galleryItems) {
      const addedItems = galleryItems.filter(currItem => this._items.find(prevItem => prevItem.id === currItem.id) === undefined);
      const removedItems = this._items.filter(prevItem => galleryItems.find(currItem => currItem.id === prevItem.id) === undefined);
      const updatedItems = galleryItems.filter(
        currItem => this._items.find(prevItem => prevItem.id === currItem.id && prevItem.url !== currItem.url) !== undefined
      );
      // handle each change
      addedItems.forEach(item => {
        const viewRef = this.templateRef.createEmbeddedView({ $implicit: item });
        if (item.newItem) {
          this.viewContainerRef.insert(viewRef, 0);
          setTimeout(() => {
            this.nxgGalleryItemsGridInst.prepended(viewRef.rootNodes);
            this.initDraggable(item.id, viewRef.rootNodes);
          });
        } else {
          this.viewContainerRef.insert(viewRef);
          setTimeout(() => {
            this.nxgGalleryItemsGridInst.appended(viewRef.rootNodes);
            this.initDraggable(item.id, viewRef.rootNodes);
          });
        }
        this.viewRefsMap.set(item.id, viewRef);
      });
      updatedItems.forEach(item => {
        this.viewRefsMap.get(item.id).context.$implicit = item;
      });
      removedItems.forEach(item => {
        // this.viewContainerRef.remove(this.templateRef);
        // draggie.destroy()
      });

      this._items = galleryItems;
    }
  }

  initDraggable(id: string, nodes: Array<HTMLElement>): void {
    if (isPlatformBrowser(this.platformId)) {
      // Run dragging outside of angular for drag performance
      this.zone.runOutsideAngular(() => {
        const dragHandlers: Array<any> = [];

        nodes.forEach(node => {
          const draggie = new Draggabilly(node);
          dragHandlers.push(draggie);

          // If the user drags to a window edge, scroll the window to allow placing the image lower
          draggie.on('dragMove', (event: MouseEvent) => {
            const clientBottom = window.innerHeight - event.clientY;
            if (this.scrollingBy === 0) {
              window.requestAnimationFrame(() => this.scrollPage());
            }

            // Scroll faster the closer they are to the page edge
            this.scrollingBy =
              event.clientY < 150
                ? Math.floor(75 / Math.max(5, event.clientY) + 1) * -1
                : clientBottom < 200
                ? Math.floor(100 / Math.max(5, clientBottom) + 1)
                : 0;
          });
          draggie.on('dragEnd', () => {
            this.scrollingBy = 0;
          });
          this.nxgGalleryItemsGridInst.bindDraggabillyEvents(draggie);
        });

        this.dragHandlersMap.set(id, dragHandlers);
      });
    }
  }

  private scrollPage(): void {
    if (this.scrollingBy !== 0) {
      window.scrollBy(0, this.scrollingBy);
      window.requestAnimationFrame(() => this.scrollPage());
    }
  }
}
