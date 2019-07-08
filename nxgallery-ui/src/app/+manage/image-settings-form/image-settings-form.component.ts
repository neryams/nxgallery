import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { IImageDocument } from './../../../../../shared/interfaces/imageData';

export interface ConfigMenuResult {
  albumId: string;
  albumName: string;
  rootSettings: boolean;
}

@Component({
  selector: 'nxg-image-settings-form',
  templateUrl: './image-settings-form.component.html',
  styleUrls: ['./image-settings-form.component.scss']
})
export class ImageSettingsFormComponent {
  _image: IImageDocument;
  @Input() set image(newImage: IImageDocument) {
    this._image = newImage;
    this.imageSettingsForm.get('title').setValue(newImage.title || '');
    this.imageSettingsForm.get('caption').setValue(newImage.info.caption || '');

    this.ref.detectChanges();

    this.imageSettingsForm.valueChanges.pipe(
      debounceTime(50),
      distinctUntilChanged()
    )
    .subscribe(res => {
      this.outputChanged();
    });
  };
  @Output() readonly changed = new EventEmitter();

  imageSettingsForm = new FormGroup({
    title: new FormControl(''),
    caption: new FormControl('')
  });
  
  constructor(
    private readonly ref: ChangeDetectorRef
  ) {
  }

  outputChanged(): void {
    this._image.title = this.imageSettingsForm.get('title').value;
    this._image.info.caption = this.imageSettingsForm.get('caption').value;

    this.changed.emit(this._image);
  }
}
