import * as multer from 'multer';
import * as _ from 'lodash';
import * as sharp from 'sharp';
import * as mkdirp from 'mkdirp';
import * as concat from 'concat-stream';
import * as exifReader from 'exif-reader';
import { pseudoRandomBytes, createHash } from 'crypto';
import { existsSync, unlink, writeFile } from 'fs';
import { join } from 'path';
import { resolve } from 'url';
import * as config from 'config';

import { ImageInfo } from '../../shared';
import { getAbsolutePath } from './PathFixer';

export interface FileStreamOutputResult {
  destination: string;
  filename: string;
  thumbFilePaths: { [key: number]: string };
  storage: Options['storage'];
  imageInfo: ImageInfo;
}

const allowedStorageSystems = ['local'];
const allowedOutputFormats = ['jpg', 'png'];

// fallback for the options
interface Options {
  storage?: 'local';
  output?: 'jpg' | 'png';
  greyscale?: boolean,
  quality?: number,
  square?: boolean
}
const defaultOptions: Options = {
  storage: 'local',
  output: 'png',
  greyscale: false,
  quality: 70,
  square: false
};

export class ImageStorage implements multer.StorageEngine {
  options: Options;
  uploadPath: string;
  uploadPathOriginal: string;

  constructor(opts: Options) {
    let options = (opts && _.isObject(opts)) ? _.pick(opts, _.keys(defaultOptions)) : {};
    options = _.extend(defaultOptions, options);
    
    this.options = _.forIn(options, (value, key, object) => {
      let parsedValue: any;
      switch (key) {
        case 'square':
        case 'greyscale':
        
        case 'storage':
          parsedValue = String(value).toLowerCase();
          object[key] = _.includes(allowedStorageSystems, parsedValue) ? parsedValue : defaultOptions[key];
          break;
        
        case 'output':
          parsedValue = String(value).toLowerCase();
          object[key] = _.includes(allowedOutputFormats, parsedValue) ? parsedValue : defaultOptions[key];
          break;
        
        case 'quality':
          parsedValue = _.isFinite(value) ? value : Number(value);
          object[key] = (parsedValue && parsedValue >= 0 && parsedValue <= 100) ? parsedValue : defaultOptions[key];
          break;
        
        case 'threshold':
          parsedValue = _.isFinite(value) ? value : Number(value);
          object[key] = (parsedValue && parsedValue >= 0) ? parsedValue : defaultOptions[key];
          break;
      }
    });
      
    // set the upload paths
    this.uploadPath = getAbsolutePath(config.get('LOCAL_STORAGE'));
    this.uploadPathOriginal = getAbsolutePath(config.get('LOCAL_ORIGINAL_STORAGE'));
    
    if (this.options.storage == 'local') {
      // if upload path does not exist, create the upload path structure
      !existsSync(this.uploadPath) && mkdirp.sync(this.uploadPath);
      !existsSync(this.uploadPathOriginal) && mkdirp.sync(this.uploadPathOriginal);
    }
  }

  _handleFile(req: Express.Request, file: any, cb: (error?: any, info?: Partial<FileStreamOutputResult>) => void) {
    // create a writable stream using concat-stream that will
    // concatenate all the buffers written to it and pass the
    // complete buffer to a callback fn
    let fileManipulate = concat((imageData: Buffer) => {
      // read the image buffer with Jimp
      // it returns a promise
      this.processImage(imageData).then(info => {
        cb(null, info);
      }, err => {
        cb(err);
      });
    });

    // write the uploaded file buffer to the fileManipulate stream
    file.stream.pipe(fileManipulate);
  }
  
  _removeFile(req: Express.Request, file: any, cb: (error: Error) => void) {
    let matches: boolean, pathsplit: string[];
    let filename: string = file.filename;
    let filePath = join(this.uploadPath, filename);
    let paths: string[] = [];

    // delete the file properties
    delete file.filename;
    delete file.destination;
    delete file.baseUrl;
    delete file.storage;

    pathsplit = filePath.split('/');
    matches = !!pathsplit.pop().match(/^(.+?)_.+?\.(.+)$/i);

    if (matches) {
      paths = _.map(config.get('IMAGE_SIZES'), function(size) {
        return pathsplit.join('/') + '/' + (matches[1] + '_' + size + '.' + matches[2]);
      });
    }

    // delete the files from the filesystem
    _.each(paths, function(filePath) {
      unlink(filePath, cb);
    });
  }

  private generateRandomFilename() {
    // create pseudo random bytes
    let bytes = pseudoRandomBytes(32);

    // create the md5 hash of the random bytes
    let checksum = createHash('MD5').update(bytes).digest('hex');

    // return as filename the hash with the output extension
    return checksum;
  };

  // this processes the Jimp image buffer
  private processImage(imageData: Buffer): Promise<FileStreamOutputResult> {
    const image = sharp(imageData);

    return image
      .metadata()
      .then((metadata) => {
        let batch: Promise<sharp.OutputInfo>[] = [];
        let thumbFilepaths: FileStreamOutputResult['thumbFilePaths'] = {};
    
        let imageInfo: ImageInfo = {
          aspect: metadata.height ? (metadata.width / metadata.height) : 0
        }
        if (metadata.exif !== undefined) {
          const exifData = exifReader(metadata.exif);

          imageInfo.exif = exifData;
          imageInfo.created = exifData.exif.DateTimeOriginal || exifData.exif.CreateDate;
          imageInfo.deviceInfo = {
            model: exifData.image.Make,
            make: exifData.image.Model
          };
          imageInfo.orientation = exifData.image.Orientation;
        }

        let filename = this.generateRandomFilename();

        // crop the image to a square if enabled
        if (this.options.square) {
          let square = Math.min(metadata.width, metadata.height);
          // fetch the new image dimensions and crop
          image.extract({
            left: (metadata.width - square) / 2, 
            top: (metadata.height - square) / 2,
            width: square,
            height: square
          });
        }
        if(this.options.output === 'jpg') {
          image.jpeg({ quality: 80 });
        } else if(this.options.output === 'png') {
          image.png();
        }

        // map through the responsive sizes and push them to the batch
        batch = _.map(config.get('IMAGE_SIZES'), (size: number) => {
          let resizedImage = image.resize(size, size, { fit: 'inside' });
          
          // create the complete filepath and create a writable stream for it
          let thumbFilename = filename + '_' + size + '.' + this.options.output;
          thumbFilepaths[size] = resolve(config.get('LOCAL_UPLOADS_BASE_URL'), thumbFilename);
          
          return resizedImage.toFile(join(this.uploadPath, thumbFilename));
        });

        const baseFileName = filename + '.' + this.options.output;
        const originalFilePromise = new Promise((resolve, reject) => {
          writeFile(join(this.uploadPathOriginal, baseFileName), imageData, (err) => {
            if (err) {
              reject(err)
            } else {
              resolve();
            }
          });
        });

        return Promise.all([ ...batch, originalFilePromise ]).then(() => ({
          destination: this.uploadPath,
          filename: baseFileName,
          thumbFilePaths: thumbFilepaths,
          storage: this.options.storage,
          imageInfo: imageInfo
        }));
      });
  }
}
