
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SettingsService } from '~/app/framework/settings/settings.service';
import { InputFile } from '~/app/shared/image-upload/interfaces/input-file';

import { IAlbumDocument } from '../../../../../shared';

export interface ConfigMenuResult {
  rootAlbumId: string;
  galleryName: string;
  theme: string;
}

@Component({
  selector: 'nxg-config-menu',
  templateUrl: './config-menu.component.html',
  styleUrls: ['./config-menu.component.scss']
})
export class ConfigMenuDialogComponent implements OnInit {
  rootAlbumId: string;
  gallerySettingsForm: FormGroup;
  themeFile: InputFile;
  
  constructor(
    public dialogRef: MatDialogRef<ConfigMenuDialogComponent, IAlbumDocument>,
    @Inject(MAT_DIALOG_DATA) public data: ConfigMenuResult,
    private settingsService: SettingsService
  ) {
    this.rootAlbumId = this.data.rootAlbumId;
    this.gallerySettingsForm = new FormGroup({
      galleryName: new FormControl(this.data.galleryName)
    });
  }

  ngOnInit(): void {
    // do nothing
  }

  uploadTheme(inputFile: InputFile): void {
    this.themeFile = inputFile;
  }

  closeDialog(): void {
    this.dialogRef.close(undefined);
  }

  save(): void {
    if (this.themeFile) {
      this.settingsService.uploadTheme(this.themeFile.file).subscribe((uploadResult) => {
        if (typeof uploadResult === 'number') {
          // Some progress bar stuff here later
        } else {
          this.submitDialog();
        }
      });
    } else {
      this.submitDialog();
    }
  }

  submitDialog(): void {
    this.settingsService.updateAlbumSettings({
      _id: this.rootAlbumId,
      name: this.gallerySettingsForm.get('galleryName').value
    }).subscribe(result => {
      this.dialogRef.close(result);
    });
  }
}
