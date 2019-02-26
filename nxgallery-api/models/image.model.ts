import { Schema, Document, model as createModel, Query } from 'mongoose';
import * as _ from 'lodash';

import { BaseDatabase } from './base.model';

import { ImageData } from '../../shared';

interface IImageDocument extends ImageData, Document {};

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
      console.error("counter error", error);
      throw error;
    });
});
const Image = createModel<IImageDocument>('Image', imageSchema);

export class ImageDatabase extends BaseDatabase {
  constructor() {
    super();
  }

  getImagesByCreated(pageSize: number, index: number) {
    return this.getImages({ created: 'desc' }, pageSize, index);
  }

  getImagesBySort(pageSize: number, index: number) {
    return this.getImages({ sortOrder: 'desc' }, pageSize, index);
  }

  saveImagePositions(data: Array<{ _id: string, sortOrder: number, position: { x: number, y: number } }>) {
    return data.map(image => {
      return Image.updateOne({ _id: image._id}, { $set: {
        'info.position': image.position,
        'sortOrder': image.sortOrder
      }}).exec();
    })
  }

  saveImageInfo(_id: string, { caption }: { caption: string}) {
    return Image.updateOne({ _id: _id}, { $set: {
      'info.caption': caption
    }}).exec();
  }

  saveImageData(data: ImageData) {
    const saveData = _.extend({}, data);
    let image = new Image(saveData);

    return image.save();
  }

  private getImages(sort: any, pageSize, index = 0): Promise<IImageDocument[]> {
    if (index < 0) {
      index = 0;
    }
    
    let query: Query<any>;

    if(pageSize === null) {
      query = Image.find().sort(sort).select('-info.exif -info.deviceInfo').lean();
    } else {
      query = Image.find().sort(sort).limit(pageSize).skip(index).select('-info.exif -info.deviceInfo').lean();
    }
    return query.exec();
  }
}