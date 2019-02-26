export interface ImageData {
  title: string,
  imageUrls: { [key: number]: string };
  sortOrder?: number;
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