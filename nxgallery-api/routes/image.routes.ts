import * as express from 'express';
import * as jwt from 'express-jwt';
import { imageController } from '../controllers/image.controller';
import * as config from 'config';


class ImageRoutes {
  public router: express.Router = express.Router();

  constructor() {
    this.init();
  }

  private init(): void {

    // Public Routes

    this.router.get('/albums',
      (req: express.Request, res: express.Response) => imageController.getAllAlbumInfo(req, res)
    );

    this.router.get('/root/:perPage',
      (req: express.Request, res: express.Response) => imageController.getAlbum(req, res)
    );

    this.router.get('/album/:albumId/:perPage,:page',
      (req: express.Request, res: express.Response) => imageController.getImages(req, res).bySort()
    );

    // this.router.get('/album/:albumId/:perPage,:page',
    //   (req: express.Request, res: express.Response) => imageController.getImages(req, res).byCreated()
    // );

    this.router.get('/album/:albumId/:perPage',
      (req: express.Request, res: express.Response) => imageController.getAlbum(req, res)
    );

    // Secured Routes

    this.router.get('/manage/root', jwt({secret: config.get('JWT_SECRET')}),
      (req: express.Request, res: express.Response) => imageController.getAlbum(req, res)
    );

    this.router.post('/manage/newAlbum/:parentAlbumId', jwt({secret: config.get('JWT_SECRET')}),
      (req: express.Request, res: express.Response) => imageController.createAlbum(req, res)
    );

    this.router.get('/manage/:albumId', jwt({secret: config.get('JWT_SECRET')}),
      (req: express.Request, res: express.Response) => imageController.getAlbum(req, res)
    );

    this.router.put('/manage/:albumId/primary', jwt({secret: config.get('JWT_SECRET')}),
      (req: express.Request, res: express.Response) => imageController.setImageAsPrimary(req, res)
    );

    this.router.put('/manage/:albumId/positions', jwt({secret: config.get('JWT_SECRET')}),
      (req: express.Request, res: express.Response) => imageController.updatePositions(req, res),
    );

    this.router.put('/manage/:albumId/info', jwt({secret: config.get('JWT_SECRET')}),
      (req: express.Request, res: express.Response) => imageController.saveAlbumInfo(req, res),
    );

    this.router.delete('/manage/:albumId/:id', jwt({secret: config.get('JWT_SECRET')}),
      (req: express.Request, res: express.Response) => imageController.deleteImage(req, res),
    );

    this.router.put('/manage/:albumId/:id/info', jwt({secret: config.get('JWT_SECRET')}),
      (req: express.Request, res: express.Response) => imageController.saveImageInfo(req, res),
    );

    this.router.post('/manage/:albumId/upload', jwt({secret: config.get('JWT_SECRET')}),
      (req: express.Request, res: express.Response) => imageController.upload(req, res)
    );

  }
}

export const imageRouter = new ImageRoutes().router;