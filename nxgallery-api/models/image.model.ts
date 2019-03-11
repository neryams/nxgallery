import { set, Schema, Document, model as createModel, Query, Types, DocumentQuery } from 'mongoose';
import * as _ from 'lodash';

import { BaseDatabase } from './base.model';
 
import { Album, ImageData, ErrorCodes } from '../../shared';

set('useFindAndModify', false);

interface IImageDocument extends ImageData, Document {};
interface IAlbumDocument extends Album, Document {};

const counterSchema = new Schema({
  _id: {type: String, required: true},
  seq: { type: Number, default: 0 }
});
const Counter = createModel<{ seq: number } & Document>('counter', counterSchema);

const imageSchema = new Schema({
  title: String,
  imageUrls: {
    type: Map,
    of: String
  },
  sortOrder: Number,
  uploaded: Date,
  created: Date,
  tags: [String],
  info: {
    caption: String,
    aspect: Number,
    position: {
      x: Number,
      y: Number
    },
    orientation: Number,
    deviceInfo: {
      make: String,
      model: String
    },
    exif: {}
  }
});
imageSchema.pre('save', function(next) {
  let doc = <IImageDocument>this;
  Counter.findByIdAndUpdate({_id: 'images'}, {$inc: { seq: 1} }, {new: true, upsert: true})
    .then(function(count) {
      doc.sortOrder = count.seq;
      next();
    })
    .catch(function(error) {
      console.error('counter error', error);
      throw error;
    });
});
const Image = createModel<IImageDocument>('Image', imageSchema);

const albumSchema = new Schema({
  name: String,
  owner: { type: Types.ObjectId, ref: 'User' },
  parent: { type: Types.ObjectId, ref: 'Album' },
  settings: {
    theme: String
  },
  images: [ imageSchema ]
});
export const AlbumModel = createModel<IAlbumDocument>('Album', albumSchema);

export class ImageDatabase extends BaseDatabase {
  constructor() {
    super();
  }

  getAlbum(albumId: string, pageSize?: number): Promise<IAlbumDocument> {
    if (typeof pageSize !== 'undefined') {
      return this.getAlbumWithSortedImages({ _id: albumId }, pageSize);
    } else {
      return this.getAlbumWithSortedImages({ _id: albumId });
    }
  }

  getRootAlbum(pageSize?: number): Promise<IAlbumDocument> {
    if (typeof pageSize !== 'undefined') {
      return this.getAlbumWithSortedImages({ parent: { $exists: false } }, pageSize);
    } else {
      return this.getAlbumWithSortedImages({ parent: { $exists: false } })
    }
  }

  getImagesByCreated(albumId: string, pageSize: number, index: number) {
    return this.getImages(albumId, { 'created': 'desc' }, pageSize, index);
  }

  getImagesBySort(albumId: string, pageSize: number, index: number) {
    return this.getImages(albumId, { 'sortOrder': 'desc' }, pageSize, index);
  }

  saveImagePositions(albumId: string, data: Array<{ _id: string, sortOrder: number, position: { x: number, y: number } }>) {
    return data.map(image => {
      return AlbumModel.findOneAndUpdate(
        { '_id': albumId, 'images._id': image._id },
        { 
          $set: {
            'images.$.info.position': image.position,
            'images.$.sortOrder': image.sortOrder
          }
        }
      ).exec();
    })
  }

  saveImageInfo(_id: string, albumId: string, { caption }: { caption: string}) {
    return AlbumModel.findOneAndUpdate(
      { '_id': albumId, 'images._id': _id },
      { 
        $set: {
          'images.$.info.caption': caption
        }
      }
    ).exec();
  }

  saveAlbumInfo(albumId: string, { name, settings }: Partial<{ name: string, settings: { theme: string }}>) {
    const payload: any = {};
    if (name) {
      payload['name'] = name;
    }
    if (settings && settings.theme) {
      payload['settings.theme'] = settings.theme
    }

    return AlbumModel.findOneAndUpdate(
      { '_id': albumId },
      { 
        $set: payload
      },
      { new: true }
    ).exec();
  }

  saveImageData(data: ImageData, albumId: string) {
    const saveData = _.extend({}, data);
    let image = new Image(saveData);

    // to fetch the root album, use AlbumModel.findOneAndUpdate({ parent: { $exists: false } }, { $push: { images: image } });
    return AlbumModel.findOneAndUpdate(
      { '_id': albumId },
      { $push: { images: image } },
    ).then((album) => {
      if(!album || !album.toObject()) {
        throw Error(ErrorCodes.albumNotFound.code);
      }
      return image.toJSON() as IImageDocument
    });
  }

  private getAlbumWithSortedImages(matchArg: any, pageSize?: number) {
    return AlbumModel.findOne(matchArg, { images: { $slice: 1 } }).then(result => {
      if (result.images.length === 0) {
        return result;
      }

      let query = AlbumModel.aggregate()
        .match(matchArg)
        .unwind('images')
        .sort({ 'images.sortOrder': 'desc' });
      
        if (pageSize) {
          query = query.limit(pageSize)
        }
  
        return query.group({ _id: '$_id', images: { $push: '$images'}, settings: { $first: '$settings' }, name: { $first: '$name' } })
        .limit(1)
        .exec()
        .then(result => result[0]);
    });
  }

  private getImages(albumId: string, sort: any, pageSize, index = 0): Promise<IImageDocument[]> {
    if (index < 0) {
      index = 0;
    }
    
    let query: Query<any>;

    if(pageSize === null) {
      query = AlbumModel.findById(albumId, { images: { $sort: sort } })
        .select('-info.exif -info.deviceInfo').lean();
    } else {
      query = AlbumModel.findById(albumId, { images: { $sort: sort, $slice: pageSize, $skip: index } })
        .select('-info.exif -info.deviceInfo').lean();
    }
    return query.exec();
  }
}