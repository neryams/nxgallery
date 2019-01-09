import { MONGODB_PORT } from './../../config/env';
import { connect } from 'mongoose';

connect('mongodb://localhost' + (MONGODB_PORT ? `:${MONGODB_PORT}` : '') + '/nxgallery', { useNewUrlParser: true }).then(() => {
  console.log('Connection Successful');
}, (err: any) => {
  console.error('Connection Failed: ', err);
});

export class BaseDatabase {
  constructor() {

  }
}