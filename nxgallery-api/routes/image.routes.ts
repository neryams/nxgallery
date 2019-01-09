import * as express from 'express';
import * as jwt from 'express-jwt';
import { imageController, fileHandler } from '../controllers/image.controller';

import { JWT_SECRET } from './../../config/env';

class ImageRoutes {
  public router: express.Router = express.Router();

  constructor() {
    this.init();
  }

  private init(): void {
    let fileHandlerUploader = fileHandler.single('image');

    // Public Routes

    this.router.get('/getByCreatedDate/:perPage,:page',
      (req: express.Request, res: express.Response) => imageController.getImages(req, res).byCreated()
    );

    this.router.get('/getBySort/:perPage,:page',
      (req: express.Request, res: express.Response) => imageController.getImages(req, res).bySort()
    );

    // Secured Routes

    this.router.get('/getAll', jwt({secret: JWT_SECRET}),
      (req: express.Request, res: express.Response) => imageController.getImages(req, res).all()
    );

    this.router.post('/updatePositions', jwt({secret: JWT_SECRET}),
      (req: express.Request, res: express.Response) => imageController.updatePositions(req, res),
    );

    this.router.post('/upload', jwt({secret: JWT_SECRET}),
      (req: express.Request, res: express.Response) => {
        fileHandlerUploader(req, res, (err) => {
          if(err) {
            res.status(500).send({ message: 'Could not generate images', err: err });
          } else {
            imageController.upload(req, res);
          }
        });
      },
    );

  }
}

export const imageRouter = new ImageRoutes().router;