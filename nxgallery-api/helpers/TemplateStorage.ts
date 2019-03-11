import * as multer from 'multer';
import * as _ from 'lodash';
import * as mkdirp from 'mkdirp';
import * as concat from 'concat-stream'
import { join } from 'path';
import { resolve as urlResolve } from 'url';
import { existsSync, unlink, writeFile } from 'fs';
import * as config from 'config';

import { IUserDocument } from './../models/users.model';
import { getAbsolutePath } from './PathFixer';

export interface FileStreamOutputResult {
  destination: string;
}

const CUSTOM_THEME_FOLDER = 'custom';

export class TemplateStorage implements multer.StorageEngine {
  uploadPath: string;
  fetchPath: string;

  constructor() {
    if (config.get('STORAGE_MODEL') === 'local') {
      // set the upload paths
      this.fetchPath = config.get('LOCAL_THEMES_BASE_URL')
      this.uploadPath = getAbsolutePath(config.get('LOCAL_THEME_STORAGE'));

      // if upload path does not exist, create the upload path structure
      !existsSync(join(this.uploadPath, CUSTOM_THEME_FOLDER)) && mkdirp.sync(join(this.uploadPath, CUSTOM_THEME_FOLDER));
    } else {
      throw('No valid storage model selected.')
    }
  }

  _handleFile(req: Express.Request, file: any, cb: (error?: any, info?: Partial<FileStreamOutputResult>) => void) {
    let user: IUserDocument = req['user'];
    let themeName: string = file.originalname.replace(/\.\w+$/, '');

    !existsSync(join(this.uploadPath, CUSTOM_THEME_FOLDER, user.id, themeName)) && 
      mkdirp.sync(join(this.uploadPath, CUSTOM_THEME_FOLDER, user.id, themeName));

    // create a writable stream using concat-stream that will
    // concatenate all the buffers written to it and pass the
    // complete buffer to a callback fn
    let fileManipulate = concat((themeData: Buffer) => {
      this.processImage(user, themeName, themeData).then(info => {
        cb(null, info);
      }, err => {
        cb(err);
      });
    });

    // write the uploaded file buffer to the fileManipulate stream
    file.stream.pipe(fileManipulate);
  }
  
  _removeFile(req: Express.Request, file: any, cb: (error: Error) => void) {
  }
  
  private processImage(user: IUserDocument, themeName: string, themeData: Buffer): Promise<FileStreamOutputResult> {
    let themeStructure = config.get('THEME_STRUCTURE');
    let baseFileName = themeStructure.MAIN_CSS;
    let themePath = join(CUSTOM_THEME_FOLDER, user.id, themeName);

    let result: FileStreamOutputResult = {
      destination: urlResolve(this.fetchPath, themePath)
    };
    
    return new Promise<FileStreamOutputResult>((resolve, reject) => {
      writeFile(join(join(this.uploadPath, themePath), baseFileName), themeData, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(result);
        }
      });
    });
  }
}
