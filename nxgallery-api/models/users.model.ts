import { randomBytes, createHmac } from 'crypto';
import { Schema, Document, model as createModel } from 'mongoose';
import { resolve as urlResolve } from 'url';
import * as _ from 'lodash';
import * as config from 'config';

import { BaseDatabase } from './base.model';
import { User, ErrorCodes } from './../../shared';
import { UserAuthInput } from '../controllers/users.controller';
import { AlbumModel } from './image.model';

export interface IUserDocument extends User, Document {};

const THEMES_LIST = [{
  id: 'modern',
  path: 'modern'
}];

const userSchema = new Schema({
  username: String,
  email: String,
  displayName: String,
  passwordHash: String,
  passwordSalt: String
});
const User = createModel<IUserDocument>('User', userSchema);

export class UsersDatabase extends BaseDatabase {
  themeFetchPath: string;

  constructor() {
    super();
    this.themeFetchPath = config.get('LOCAL_THEMES_BASE_URL');
  }

  createUser(userData: UserAuthInput) {
    return User.countDocuments().exec().then((result) => {
      if(result > 0) {
        throw Error(ErrorCodes.userAlreadyCreated.code);
      } else {
        const passwordData = this.saltHashPassword(userData.password);

        let newUser = new User({
          username: userData.username,
          email: userData.email,
          displayName: userData.username,
          passwordHash: passwordData.passwordHash,
          passwordSalt: passwordData.salt
        } as User);

        return newUser.save().then((user) => {
          let newUserRootAlbum = new AlbumModel({
            owner: user._id,
            settings: {
              theme: this.getThemePath(THEMES_LIST[0])
            },
            images: []
          });
          
          newUserRootAlbum.save().then(() => {
            return user;
          })
        });
      }
    });
  }

  authenticate(userAuthData: UserAuthInput) {
    return User.findOne({ username: userAuthData.username }).exec().then(userDocument => {
      if(!userDocument) {
        throw(ErrorCodes.notAuthenticated.code);
      }
      
      const passwordChallenge = this.sha512(userAuthData.password, userDocument.passwordSalt);
      if(passwordChallenge !== userDocument.passwordHash) {
        throw(ErrorCodes.notAuthenticated.code);
      } else {
        return _.pick(userDocument, ['id', 'username', 'displayName']);
      }
    });
  }

  setTheme(user: IUserDocument, theme: string) {
    return AlbumModel.findOneAndUpdate(
      { parent: { $exists: false }, owner: user.id }, 
      { 
        $set: {
          'settings.theme': theme
        }
      },
      { new: true }
    );
  }
  
  getThemePath(targetTheme: string | typeof THEMES_LIST[0]) {
    if (typeof targetTheme === 'string') {
      let theme = THEMES_LIST.find(theme => theme.id === targetTheme);
      return urlResolve(this.themeFetchPath, theme.path);
    } else {
      return urlResolve(this.themeFetchPath, targetTheme.path);
    }
  }

  private genRandomString(length: number){
    return randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
  };

  /**
   * hash password with sha512.
   * @function
   * @param {string} password - List of required fields.
   * @param {string} salt - Data to be validated.
   */
  private sha512(password: string, salt: string){
    var hash = createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    return hash.digest('hex');
  };

  private saltHashPassword(userpassword: string) {
    const salt = this.genRandomString(16); /** Gives us salt of length 16 */
    const passwordHash = this.sha512(userpassword, salt);
    return {
      salt,
      passwordHash
    }
  }
}