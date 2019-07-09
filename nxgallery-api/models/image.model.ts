import { set, Schema, Document, model as createModel, Query, Types } from 'mongoose';
import * as _ from 'lodash';

import { BaseDatabase } from './base.model';
 
import { Album, AlbumInfoOnly, ImageData, ErrorCodes } from '../../shared';
import { IUserDocument } from './users.model';

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
  childAlbumId: { type: Types.ObjectId, ref: 'Album' },
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
  primaryImage: { type: Types.ObjectId, ref: 'Image' },
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
  getAllAlbumInfo(): Promise<Array<AlbumInfoOnly>> {
    return AlbumModel.find({}).select('-images').lean().exec();
  }

  getAlbum(albumId: string, pageSize?: number): Promise<IAlbumDocument> {
    if (typeof pageSize !== 'undefined') {
      return this.getAlbumWithSortedImages({ _id: new Types.ObjectId(albumId) }, pageSize);
    } else {
      return this.getAlbumWithSortedImages({ _id: new Types.ObjectId(albumId) });
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
    //return this.getImages(albumId, { 'created': 'desc' }, pageSize, index);
  }

  getImagesBySort(albumId: string, pageSize: number, index: number) {
    return this.getAlbumWithSortedImages({ _id: new Types.ObjectId(albumId) }, pageSize, index).then(res => {
      return res;
    });
  }

  setImageAsPrimary(albumId: string, imageId: string) {
    return AlbumModel.find({ '_id': new Types.ObjectId(albumId), 'images._id': new Types.ObjectId(imageId) }, { 'parent': 1, 'images.$': 1 }).then(res => {
      if (res.length === 0 || res[0].images.length === 0) {
        return null;
      } else {
        const childAlbum = res[0];
        const primaryImage = res[0].images[0];
        return this.saveImageInfo(
          { childAlbumId: childAlbum._id },
          childAlbum.parent,
          { imageUrls: primaryImage.imageUrls, aspect: primaryImage.info.aspect }
        ).then(res => {
          return AlbumModel.findOneAndUpdate(
            { '_id': childAlbum._id },
            { 'primaryImage': primaryImage._id }
          ).exec();
        })
      }
    });
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

  saveImageInfo(
    imageQueryObj: { _id?: string, childAlbumId?: string },
    albumId: string,
    {
      title,
      caption, 
      imageUrls, 
      aspect
    }: {
      title?: string,
      caption?: string,
      imageUrls?: ImageData['imageUrls'],
      aspect?: number }
  ) {
    const queryParamPayload: any = { '_id': albumId };
    const querySetPayload = {};
    for (let queryOption in imageQueryObj) {
      queryParamPayload[`images.${queryOption}`] = imageQueryObj[queryOption];
    }
    if (title) {
      querySetPayload['images.$.title'] = title;
    }
    if (caption) {
      querySetPayload['images.$.info.caption'] = caption;
    }
    if (imageUrls) {
      querySetPayload['images.$.imageUrls'] = imageUrls;
    }
    if (aspect) {
      querySetPayload['images.$.info.aspect'] = aspect;
    }
    return AlbumModel.findOneAndUpdate(
      queryParamPayload,
      { $set: querySetPayload },
      { new: true }
    ).exec().then(foundAlbum => {
      const editingImage = foundAlbum.images.find(image => image['id'] === imageQueryObj._id);

      if(editingImage && editingImage.childAlbumId) {
        return AlbumModel.findOneAndUpdate(
          { '_id': editingImage.childAlbumId },
          { $set: { 'name': title } }
        ).exec().then(() => {
          return foundAlbum;
        })
      }

      return foundAlbum;
    });
  }

  deleteImage(_id: string, albumId: string) {
    return AlbumModel.findOneAndUpdate(
      { '_id': albumId },
      { $pull: { 'images': { _id } } }
    ).exec();
  }

  createAlbum(parentAlbumId: string, user: IUserDocument) {
    let newUserRootAlbum = new AlbumModel({
      name: 'New Album',
      owner: user._id,
      parent: parentAlbumId,
      images: []
    });
    
    return newUserRootAlbum.save().then((newAlbum: IAlbumDocument) => {
      return this.addImageToAlbum(
        {
          title: newAlbum.name,
          imageUrls: [],
          childAlbumId: newAlbum._id,
          uploaded: null,
          created: new Date().valueOf(),
          info: {
            aspect: 1
          }
        },
        parentAlbumId
      )
    });
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
    ).exec().then(foundAlbum => {
      if(foundAlbum.parent) {
        return this.saveImageInfo({childAlbumId: albumId}, foundAlbum.parent, { title: name }).then(() => {
          return foundAlbum;
        });
      }
      
      return foundAlbum;
    });
  }

  addImageToAlbum(data: ImageData, albumId: string) {
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
      // Root album doesn't have a primary image
      if (album.parent && !album.primaryImage) {
        return this.setImageAsPrimary(album._id, image._id).then(() => image.toJSON() as IImageDocument);
      } else {
        return image.toJSON() as IImageDocument
      }
    });
  }

  private getAlbumWithSortedImages(matchArg: any, pageSize?: number, skip?: number): Promise<IAlbumDocument> {
    const returnObj = {
      _id: '$_id',
      images: { $push: '$images'},

      ...(skip ? {} : {
        settings: { $first: '$settings' },
        name: { $first: '$name' },
        parent: { $first: '$parent' },
        primaryImage: { $first: '$primaryImage' }
      })
    };

    return AlbumModel.findOne(matchArg, { images: { $slice: 2 } }).then(result => {
      if (result.images.length < 2 ) {
        return result;
      }

      let facet: { totalData: Array<any>, totalCount: Array<any> } = {
        "totalData": [
          { "$sort": { 'images.sortOrder': -1 } }
        ],
        "totalCount": [
          { "$count": "count" }
        ]
      }
      
      if (skip) {
        facet.totalData.push({ "$skip": skip });
      }
      if (pageSize) {
        facet.totalData.push({ "$limit": pageSize });
      }

      facet.totalData.push({ "$group": returnObj }, { "$limit": 1 });

      return AlbumModel.aggregate([
        { "$match": matchArg },
        { "$unwind": '$images' },
        { "$facet": facet }
      ]).exec()
        .then(result => { 
          return { imageCount: result[0].totalCount[0].count, ...result[0].totalData[0] };
        });
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