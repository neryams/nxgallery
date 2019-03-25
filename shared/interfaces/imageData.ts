export interface Album {
  name: string;
  user: string;
  primaryImage?: string;
  parent?: string;
  settings: {
    theme: string
  };
  images: Array<IImageDocument>;
  imageCount?: number;
}

export interface IAlbumDocument extends Album {
  _id: string;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type AlbumInfoOnly = Omit<IAlbumDocument, 'images'>;

export interface ImageData {
  title: string;
  imageUrls: { [key: number]: string };
  childAlbumId?: string;
  sortOrder?: number;
  tags?: Array<string>;
  uploaded: number;
  created: number; // Important that created is on the document root as it will be the primary sort 99% of the time
  info: ImageInfo
}

export interface IImageDocument extends ImageData {
  _id: string
}

export interface ImageInfo {
  aspect?: number;
  caption?: string;
  position?: { x: number; y: number };
  created?: number;
  orientation?: number;
  deviceInfo?: {
    make: string;
    model: string;
  },
  exif?: any;
}