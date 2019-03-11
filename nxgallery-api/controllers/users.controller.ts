import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as config from 'config';
import * as multer from 'multer';

import { UsersDatabase } from './../models/users.model';
import { User, ErrorCodes } from './../../shared';

export interface UserAuthInput {
  username: string,
  password: string,
  email?: string
}

import { TemplateStorage, FileStreamOutputResult } from '../helpers/TemplateStorage';

const templateStorage = new TemplateStorage();

const limits = {
  files: 1, // allow only 1 file per request
  fileSize: config.get('MAX_UPLOAD_SIZE'),
};

export const templateHandler = multer({
  storage: templateStorage,
  limits: limits
});

export class UsersController {
  usersDatabase: UsersDatabase;

  constructor() {
    this.usersDatabase = new UsersDatabase();
  }

  getUser(req: Request, res: Response) {
    res.status(200).send({
      message: "GET request successful!!"
    });
  }

  setup(req: Request, res: Response) {
    const body: UserAuthInput = req.body;
    if (!body.username || !body.password) {
      res.status(ErrorCodes.missingRequiredFields.status).json(ErrorCodes.missingRequiredFields);
    } else {
      this.usersDatabase.createUser(body).then(response => {
        res.json(response);
      }, (err) => {
        if (err.message === ErrorCodes.userAlreadyCreated.code) {
          res.status(ErrorCodes.userAlreadyCreated.status).json(ErrorCodes.userAlreadyCreated);
        } else {
          res.status(500).json({ message: 'Error creating user', err: err });
        }
      });
    }
    console.log(req.body);
  }

  authenticate(req: Request, res: Response) {
    const body: UserAuthInput = req.body;
    this.usersDatabase.authenticate(body).then((response: User) => {
      let token = jwt.sign(response, config.get('JWT_SECRET'), { expiresIn: '7d' });
      res.json({ token });
    }, (err) => {
      if (err.message === ErrorCodes.notAuthenticated.code) {
        res.status(ErrorCodes.notAuthenticated.status).json(ErrorCodes.notAuthenticated);
      } else {
        res.status(500).json({ message: 'Error logging you in.', err: err });
      }
    })
  }

  uploadTheme(req: Request, res: Response) {
    let fileHandlerUploader = templateHandler.single('theme');

    fileHandlerUploader(req, res, (err) => {
      if(err) {
        res.status(500).send({ message: 'Could not upload theme', err: err });
      } else {
        if(!req['user']) {
          res.status(401).send({ message: 'Could not save image data', err: err });
          return;
        }

        const file = <Express.Multer.File & FileStreamOutputResult> req.file;
        console.log(file.destination);
    
        this.usersDatabase.setTheme(req['user'], file.destination).then((result) => {
          res.json(result);
        }, (err: any) => {
          if (err.message === ErrorCodes.albumNotFound.code) {
            res.status(ErrorCodes.albumNotFound.status).json(ErrorCodes.albumNotFound);
          } else {
            res.status(500).send({ message: 'Could not save image data', err: err });
          }
        });
      }
    });
  }
}

export const usersController = new UsersController();
