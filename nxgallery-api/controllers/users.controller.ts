import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as config from 'config';

import { UsersDatabase } from './../models/users.model';
import { User, ErrorCodes } from './../../shared';

export interface UserAuthInput {
  username: string,
  password: string,
  email?: string
}

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
}

export const usersController = new UsersController();
