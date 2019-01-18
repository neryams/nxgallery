# NXGallery
NXGallery is a next-generation gallery manager. It comes with a server module to resize image thumbnails and maintain the database, and a front end module to serve the images and offer a management dashboard.

## System Requirements
- Node.js (Tested with node version 8.9.3)
- Yarn (or NPM)
- MongoDB (Tested with version 4.0.5)

## To Build for deployment
1. Clone or download the respository
2. Set up configuration options inside `./config/env.ts`  
    `API_PORT` is the port the server will be running on  
    `CLIENT_PORT` is the port the angular client will be served on (when running the compiled version; the dev build follows the rules in angular.json)  
    `MONGODB_PORT` is the port your MongoDB is running on (default is 27017)  
    `LOCAL_STORAGE` is where images will be uploaded relative to the api server code. This path should be publicly accessible. By default the Express api server will expose `LOCAL_STORAGE` at `/images/`.  
    `LOCAL_ORIGINAL_STORAGE` is where the original images will be uploaded relative to the api server code (for later retrieval, potentially printing, making new thumbnails, etc). **This path should not be publicly accessible!**  
    `LOCAL_UPLOADS_BASE_URL` is the absolute public path that will be used to access the image thumbnails (the public path corresponding to `LOCAL_STORAGE`)  
    `MAX_UPLOAD_SIZE` is the maximum number of megabytes an uploaded image can be  
    `IMAGE_SIZES` is an array of sizes that thumbnails will be generated for. This array can be any length, and the generated image paths will be stored in the database.  
    `JWT_SECRET` is **your** secret key for generating JWT tokens for user login into the maangement panel. You should generate a random hexadecimal UUID using https://www.random.org/bytes/ or something similar and use that.  
3. In the repository root, run the following: 
    ```sh
    $ yarn install
    $ yarn build:prod
    $ yarn run:prod
    ```
    Note: You can use `build` instead of `build:prod` for testing, as it builds a lot faster; but the latter command will build a smaller application.
4. Use Postman to set up the administrator account. Make a `POST` request to `<IP_ADDRESS>:<API_PORT>/api/users/setup` with the following raw JSON payload.
    ```json
    {
        "username": "test",
        "password": "password"
    }
    ```
    Once the administator account is created, the setup route is disabled and will only return an error message. Currently to reset the account or password the `users` collection needs to be dropped. The password is SHA512 hashed with a salt in the database.

## Deploying to production
You can run the `yarn install` and `yarn build` commands above locally, the run the following command from the same directory as this README to copy the necessary files to your server:
```sh
rsync -avP -e "ssh -p <SSH_PORT (default 22)>" --relative ./ --filter="merge rsync" <REMOTE_USERNAME>@<REMOTE_HOST>:~/<REMOTE_TARGET_DIRECTORY>
```
That way you can avoid performing the typescript and angular compilations on the server.
Then on the server, just run
```sh
yarn install --production
yarn run:prod
```
NODE_ENV should be set to production. Running `yarn run:prod` will set it automatically for that local script but you will need to set it manually if the apps are run manually; otherwise the configuration files will be loaded incorrectly.

## For development
1. Fork and clone the repository
2. Set up environments config as in deployment
3. `yarn install` in both directories
4. `yarn start` (`yarn start:prod` for testing production settings) in `nxgallery-api` to run server
5. `yarn start` (or `yarn start:prod`) in `nxgallery-ui` to run the client  
    Note: If you change the `API_PORT` config, you need to update the path to the local development api server for the dev proxy inside `nxgallery-ui/proxy/proxy.conf.json`

* To run unit tests, run `yarn test` 
* To run e2e tests, run `yarn e2e`

## New Features to add! (rough order of priority)
- Speed up image conversion, try https://github.com/lovell/sharp
- Responsive thumbnail resolution
- Dragging images to reorder in dashboard
- Add tags to image database with fulltext search
- Fullscreen lightbox on view
- Add captions to images
- Add album functionality, album ids to images
- Optionally integrate with AWS, Google Cloud, Azure, etc, adding platform deployment keys and info to the config
- Setup UI allowing user to set mongodb information, environment variables, and admin account
- Horizontal gallery option
