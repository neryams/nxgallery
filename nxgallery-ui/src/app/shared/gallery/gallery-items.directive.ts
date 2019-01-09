import { Directive, EmbeddedViewRef, Input, OnChanges, TemplateRef, ViewContainerRef } from '@angular/core';

import { GalleryItem } from './gallery.component';

@Directive({
  selector: '[nxgGalleryItems]' // tslint:disable-line
})
export class GalleryItemsDirective implements OnChanges {
  @Input() nxgGalleryItemsOf: Array<GalleryItem>;
  @Input() nxgGalleryItemsGridInst: any;

  private _items: Array<GalleryItem>;
  private map: Map<string, EmbeddedViewRef<any>> = new Map<string, EmbeddedViewRef<any>>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef
  ) {
    this._items = [];
  }

  ngOnChanges(): void {
    const galleryItems = this.nxgGalleryItemsOf;
    if(galleryItems) {
      const addedItems = galleryItems.filter(currItem => this._items.find(prevItem => prevItem.id === currItem.id) === undefined);
      const removedItems = this._items.filter(prevItem => galleryItems.find(currItem => currItem.id === prevItem.id) === undefined);
      const updatedItems = galleryItems.filter(currItem => this._items.find(prevItem => prevItem.id === currItem.id && prevItem.url !== currItem.url) !== undefined);
      // handle each change
      addedItems.forEach(item => {
        const viewRef = this.templateRef.createEmbeddedView({"\$implicit": item});
        if (item.newItem) {
          this.viewContainerRef.insert(viewRef, 0);
          setTimeout(() => this.nxgGalleryItemsGridInst.prepended(viewRef.rootNodes));
        } else {
          this.viewContainerRef.insert(viewRef);
          setTimeout(() => this.nxgGalleryItemsGridInst.appended(viewRef.rootNodes));
        }
        this.map.set(item.id, viewRef);
      });
      updatedItems.forEach((item => {
        this.map.get(item.id).context.$implicit = item;
      }));
      removedItems.forEach((item => {
        // this.viewContainerRef.remove(this.templateRef);
      }));

      this._items = galleryItems;
    }
  }
}
