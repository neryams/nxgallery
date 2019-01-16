import { connect } from 'mongoose';
import * as config from 'config';
    
connect('mongodb://localhost' + (config.get('MONGODB_PORT') ? `:${config.get('MONGODB_PORT')}` : '') + '/nxgallery', { useNewUrlParser: true }).then(() => {
  console.log('Connection Successful');
}, (err: any) => {
  console.error('Connection Failed: ', err);
});

export class BaseDatabase {
  constructor() {
  }
}