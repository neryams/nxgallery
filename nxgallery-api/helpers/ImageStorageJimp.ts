// import * as multer from 'multer';
// import * as _ from 'lodash';
// import * as Jimp from 'jimp';
// import * as mkdirp from 'mkdirp';
// import * as concat from 'concat-stream';
// import * as streamifier from 'streamifier';
// import { pseudoRandomBytes, createHash } from 'crypto';
// import { existsSync, createWriteStream, unlink, WriteStream } from 'fs';
// import { resolve, join, basename } from 'path';
// import * as config from 'config';

// import { ImageInfo } from '../../shared';
// import { BASE_DIR, getAbsolutePath } from './PathFixer';

// export interface FileStreamOutputResult {
//   destination: string;
//   baseUrl: string;
//   filename: string;
//   storage: Options['storage'];
//   imageInfo: ImageInfo;
// }

// const allowedStorageSystems = ['local'];
// const allowedOutputFormats = ['jpg', 'png'];

// // fallback for the options
// interface Options {
//   storage?: 'local';
//   output?: 'jpg' | 'png';
//   greyscale?: boolean,
//   quality?: number,
//   square?: boolean,
//   threshold?: number
// }
// const defaultOptions: Options = {
//   storage: 'local',
//   output: 'png',
//   greyscale: false,
//   quality: 70,
//   square: false,
//   threshold: 2400
// };

// export class ImageStorage implements multer.StorageEngine {
//   options: Options;
//   uploadPath: string;
//   uploadPathOriginal: string;

//   constructor(opts: Options) {
//     let options = (opts && _.isObject(opts)) ? _.pick(opts, _.keys(defaultOptions)) : {};
//     options = _.extend(defaultOptions, options);
    
//     this.options = _.forIn(options, (value, key, object) => {
//       let parsedValue: any;
//       switch (key) {
//         case 'square':
//         case 'greyscale':
        
//         case 'storage':
//           parsedValue = String(value).toLowerCase();
//           object[key] = _.includes(allowedStorageSystems, parsedValue) ? parsedValue : defaultOptions[key];
//           break;
        
//         case 'output':
//           parsedValue = String(value).toLowerCase();
//           object[key] = _.includes(allowedOutputFormats, parsedValue) ? parsedValue : defaultOptions[key];
//           break;
        
//         case 'quality':
//           parsedValue = _.isFinite(value) ? value : Number(value);
//           object[key] = (parsedValue && parsedValue >= 0 && parsedValue <= 100) ? parsedValue : defaultOptions[key];
//           break;
        
//         case 'threshold':
//           parsedValue = _.isFinite(value) ? value : Number(value);
//           object[key] = (parsedValue && parsedValue >= 0) ? parsedValue : defaultOptions[key];
//           break;
//       }
//     });
      
//     // set the upload paths
//     this.uploadPath = getAbsolutePath(config.get('LOCAL_STORAGE'));
//     this.uploadPathOriginal = getAbsolutePath(config.get('LOCAL_ORIGINAL_STORAGE'));
    
//     if (this.options.storage == 'local') {
//       // if upload path does not exist, create the upload path structure
//       !existsSync(this.uploadPath) && mkdirp.sync(this.uploadPath);
//       !existsSync(this.uploadPathOriginal) && mkdirp.sync(this.uploadPathOriginal);
//     }
//   }

//   _handleFile(req: Express.Request, file: any, cb: (error?: any, info?: Partial<FileStreamOutputResult>) => void) {
//     // create a writable stream using concat-stream that will
//     // concatenate all the buffers written to it and pass the
//     // complete buffer to a callback fn
//     let fileManipulate = concat((imageData: Buffer) => {
//       // read the image buffer with Jimp
//       // it returns a promise
//       Jimp.read(imageData)
//         .then((image) => {
//           // process the Jimp image buffer
//           this.processImage(image, cb);
//         })
//         .catch((err) => {
//           cb(err);
//         });
//     });

//     // write the uploaded file buffer to the fileManipulate stream
//     file.stream.pipe(fileManipulate);
//   }
  
//   _removeFile(req: Express.Request, file: any, cb: (error: Error) => void) {
//     let matches: boolean, pathsplit: string[];
//     let filename: string = file.filename;
//     let filePath = join(this.uploadPath, filename);
//     let paths: string[] = [];

//     // delete the file properties
//     delete file.filename;
//     delete file.destination;
//     delete file.baseUrl;
//     delete file.storage;

//     pathsplit = filePath.split('/');
//     matches = !!pathsplit.pop().match(/^(.+?)_.+?\.(.+)$/i);

//     if (matches) {
//       paths = _.map(config.get('IMAGE_SIZES'), function(size) {
//         return pathsplit.join('/') + '/' + (matches[1] + '_' + size + '.' + matches[2]);
//       });
//     }

//     // delete the files from the filesystem
//     _.each(paths, function(filePath) {
//       unlink(filePath, cb);
//     });
//   }

//   private generateRandomFilename() {
//     // create pseudo random bytes
//     let bytes = pseudoRandomBytes(32);

//     // create the md5 hash of the random bytes
//     let checksum = createHash('MD5').update(bytes).digest('hex');

//     // return as filename the hash with the output extension
//     return checksum + '.' + this.options.output;
//   };



//   // this creates a Writable stream for a filepath
//   private createOutputStream(filepath: string, imageInfo: ImageInfo, cb: (err: any, result: FileStreamOutputResult) => void) {
//     // create a writable stream from the filepath
//     let output = createWriteStream(filepath);

//     if (imageInfo.exif !== undefined) {
//       imageInfo.created = imageInfo.exif.DateTimeOriginal || imageInfo.exif.CreateDate;
//       imageInfo.deviceInfo = {
//         model: imageInfo.exif.Make,
//         make: imageInfo.exif.Model
//       };
//       imageInfo.orientation = imageInfo.exif.Orientation;
//     }

//     // set callback fn as handler for the error event
//     output.on('error', cb);

//     // set handler for the finish event
//     output.on('finish', () => {
//       cb(null, {
//         destination: this.uploadPath,
//         baseUrl: config.get('LOCAL_UPLOADS_BASE_URL'),
//         filename: basename(filepath),
//         storage: this.options.storage,
//         imageInfo: imageInfo
//       });
//     });

//     // return the output stream
//     return output;
//   }

//   // this processes the Jimp image buffer
//   private processImage(image: Jimp, cb: (err: any, result: FileStreamOutputResult) => void) {
//     let batch: { stream: WriteStream, image: Jimp }[] = [];

//     let imageInfo: ImageInfo = {
//       aspect: image.bitmap.height ? (image.bitmap.width / image.bitmap.height) : 0,
//       exif: image['_exif'] ? image['_exif'].tags : {}
//     }
    
//     let filename = this.generateRandomFilename();
    
//     let mime: string = Jimp.MIME_PNG;
    
//     // create a clone of the Jimp image
//     let clone = image.clone();
    
//     // fetch the Jimp image dimensions
//     let width = clone.bitmap.width;
//     let height = clone.bitmap.height;
//     let square = Math.min(width, height);
//     let threshold = this.options.threshold;
    
//     // resolve the Jimp output mime type
//     switch (this.options.output) {
//       case 'jpg':
//         mime = Jimp.MIME_JPEG;
//         break;

//       case 'png':
//         default:
//         mime = Jimp.MIME_PNG;
//         break;
//     }
    
//     // crop the image to a square if enabled
//     if (this.options.square) {
//       if (threshold) {
//         // auto scale the image dimensions to fit the threshold requirement
//         if (square > threshold) {
//           clone = (square == width) ? clone.resize(threshold, Jimp.AUTO) : clone.resize(Jimp.AUTO, threshold);
//         }

//         square = Math.min(square, threshold);
//       }
      
//       // fetch the new image dimensions and crop
//       clone = clone.crop(
//         (clone.bitmap.width - square) / 2, 
//         (clone.bitmap.height - square) / 2,
//         square, 
//         square
//       );
//     }
    
//     // convert the image to greyscale if enabled
//     if (this.options.greyscale) {
//       clone = clone.greyscale();
//     }
    
//     // set the image output quality
//     clone = clone.quality(this.options.quality);
    
//     let filepathParts = filename.split('.');
//     // map through the responsive sizes and push them to the batch
//     batch = _.map(config.get('IMAGE_SIZES'), (size) => {
//       let image: Jimp = null;
      
//       // create the complete filepath and create a writable stream for it
//       let filepath = filepathParts[0] + '_' + size + '.' + filepathParts[1];
//       filepath = join(this.uploadPath, filepath);
//       let outputStream = this.createOutputStream(filepath, imageInfo, cb);
      
//       // scale the image based on the size
//       if (square === width) {
//         image = clone.clone().resize(size, Jimp.AUTO);
//       } else {
//         image = clone.clone().resize(Jimp.AUTO, size);
//       }
      
//       // return an object of the stream and the Jimp image
//       return {
//         stream: outputStream,
//         image: image
//       };
//     });

//     batch.push({
//       stream: this.createOutputStream( join(this.uploadPathOriginal, filename), imageInfo, cb),
//       image: image
//     });
    
//     // process the batch sequence
//     _.each(batch, (current) => {
//       // get the buffer of the Jimp image using the output mime type
//       current.image.getBuffer(mime, (err, buffer) => {
//         if (this.options.storage == 'local') {
//           // create a read stream from the buffer and pipe it to the output stream
//           streamifier.createReadStream(buffer).pipe(current.stream);
//         }
//       });
//     });
//   }
// }
