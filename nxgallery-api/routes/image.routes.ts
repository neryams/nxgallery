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

    this.router.get('/getByCreatedDate/:perPage,:page',
      (req: express.Request, res: express.Response) => imageController.getImages(req, res).byCreated()
    );

    this.router.get('/getBySort/:perPage,:page',
      (req: express.Request, res: express.Response) => imageController.getImages(req, res).bySort()
    );

    // Secured Routes

    this.router.get('/getAll', jwt({secret: config.get('JWT_SECRET')}),
      (req: express.Request, res: express.Response) => imageController.getImages(req, res).all()
    );

    this.router.put('/positions', jwt({secret: config.get('JWT_SECRET')}),
      (req: express.Request, res: express.Response) => imageController.updatePositions(req, res),
    );

    this.router.put('/:id/info', jwt({secret: config.get('JWT_SECRET')}),
      (req: express.Request, res: express.Response) => imageController.saveImageInfo(req, res),
    );

    this.router.post('/upload', jwt({secret: config.get('JWT_SECRET')}),
      (req: express.Request, res: express.Response) => imageController.upload(req, res)
    );

  }
}

export const imageRouter = new ImageRoutes().router;