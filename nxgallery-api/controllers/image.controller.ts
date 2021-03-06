import { IImageDocument } from './../../shared/interfaces/imageData';
import { Document } from 'mongoose';
import { ImageDatabase } from './../models/image.model';
import { FileStreamOutputResult } from './../helpers/ImageStorage';
import { Request, Response } from 'express';
import * as config from 'config';

import * as _ from 'lodash';
import * as multer from 'multer';

import { ImageStorage } from '../helpers/ImageStorage';
import { ImageData } from './../../shared';

// setup a new instance of the AvatarStorage engine 
const storage = new ImageStorage({
  quality: 90,
  output: 'jpg'
});

const limits = {
  files: 1, // allow only 1 file per request
  fileSize: config.get('MAX_UPLOAD_SIZE'),
};

// setup multer
export const fileHandler = multer({
  storage: storage,
  limits: limits,
  fileFilter: (req, file, cb) => {
    // supported image file mimetypes
    const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];
  
    if (_.includes(allowedMimes, file.mimetype)) {
      // allow supported image files
      cb(null, true);
    } else {
      // throw error for invalid files
      cb(new Error('Invalid file type. Only jpg, png and gif image files are allowed.'), false);
    }
  }
});

export class ImageController {
  imageDatabase: ImageDatabase;

  constructor() {
    this.imageDatabase = new ImageDatabase();
  }

  getImages(req: Request, res: Response) {
    let perPage = req.params.perPage ? parseInt(req.params.perPage) : 50;
    let page = req.params.page ? parseInt(req.params.page) : 1;

    return {
      all: () => this.getImageHandler(res, this.imageDatabase.getImagesBySort(null, 0)),
      bySort: () => this.getImageHandler(res, this.imageDatabase.getImagesBySort(perPage, (page - 1) * perPage)),
      byCreated: () => this.getImageHandler(res, this.imageDatabase.getImagesByCreated(perPage, (page - 1) * perPage))
    };
  }

  updatePositions(req: Request, res: Response) {
    Promise.all(this.imageDatabase.saveImagePositions(req.body)).then(result => {
      res.json(true);
    }, (err) => {
      res.status(500).json({ message: 'Could not update image positions', err: err });
    })
  }

  saveImageInfo(req: Request, res: Response) {
    this.imageDatabase.saveImageInfo(req.params.id, req.body).then(result => {
      res.json(true);
    }, (err) => {
      res.status(500).json({ message: 'Could not update image info', err: err });
    })
  }

  upload(req: Request, res: Response) {
    let fileHandlerUploader = fileHandler.single('image');

    fileHandlerUploader(req, res, (err) => {
      if(err) {
        res.status(500).send({ message: 'Could not generate images', err: err });
      } else {
        const file = <Express.Multer.File & FileStreamOutputResult> req.file;
    
        let response: ImageData = {
          title: file.filename,
          imageUrls: file.thumbFilePaths,
          uploaded: new Date().valueOf(),
          // default exif is unix epoch seconds
          created: file.imageInfo.created ? (file.imageInfo.created * 1000) : null,
          info: file.imageInfo
        }
    
        this.imageDatabase.saveImageData(response).then((result) => {
          res.json(result.toJSON());
        }, (err: any) => {
          res.status(500).send({ message: 'Could not save image data', err: err });
        });
      }
    });
  }

  private getImageHandler(res: Response, query: Promise<IImageDocument[]>) {
    query.then(result => {
      res.json({ images: result });
    }, err =>
      res.status(500).json({ message: 'Could not fetch images', err: err })
    )
  }
}

export const imageController = new ImageController();
