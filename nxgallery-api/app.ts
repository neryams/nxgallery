import * as createError from 'http-errors';
import * as jwt from 'express-jwt';
import * as express from 'express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as config from 'config';
import { BASE_DIR, getAbsolutePath } from './helpers/PathFixer';

import { imageRouter } from './routes/image.routes';
import { usersRouter } from './routes/users.routes';

const app = express();

app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'dist')));

app.use('/images', express.static(getAbsolutePath(config.get('LOCAL_STORAGE'))));
app.use('/themes', express.static(getAbsolutePath(config.get('LOCAL_THEME_STORAGE'))));

app.use('/api/image', imageRouter);
app.use('/api/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req: express.Request, res: express.Response, next) {
  next(createError(404));
});

// error handler
app.use(function(err: any, req: express.Request, res: express.Response) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var server = app.listen(16906, function() {
  console.log(
    'Server is running on port ' + server.address()['port']
  );
});

module.exports = app;
