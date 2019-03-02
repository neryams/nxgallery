import * as express from 'express';
import * as jwt from 'express-jwt';
import { usersController } from '../controllers/users.controller';
import * as config from 'config';


class UsersRoutes {
  public router: express.Router = express.Router();

  constructor() {
    this.config();
  }

  private config(): void {
    this.router.post('/setup', (req: express.Request, res: express.Response) =>
      usersController.setup(req, res)
    );

    this.router.post('/authenticate', (req: express.Request, res: express.Response) =>
      usersController.authenticate(req, res)
    );

    this.router.get('/currentUser', jwt({secret: config.get('JWT_SECRET')}), (req: express.Request, res: express.Response) =>
      res.json(req['user'])
    );

    this.router.post('/uploadTheme', jwt({secret: config.get('JWT_SECRET')}), (req: express.Request, res: express.Response) =>
      usersController.uploadTheme(req, res)
    );
  }
}

export const usersRouter = new UsersRoutes().router;