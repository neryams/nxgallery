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
   `LOCAL_STORAGE` is where images will be uploaded relative to the api server code. This path should be publicly accessible.  
   `LOCAL_ORIGINAL_STORAGE` is where the original images will be uploaded relative to the api server code (for later retrieval, potentially printing, making new thumbnails, etc). **This path should not be publicly accessible**  
   `LOCAL_BASE_URL` is the public path that will be used to access the image thumbnails (the public path from d.)  
   `MAX_UPLOAD_SIZE` is the maximum number of megabytes an uploaded image can be  
   `IMAGE_SIZES` is an array of sizes that thumbnails will be generated for. This array can be any length, and the generated image paths will be stored in the database.  
   `JWT_SECRET` is **your** secret key for generating JWT tokens for user login into the maangement panel. You should generate a random hexadecimal UUID using https://www.random.org/bytes/ or something similar and use that.  
3. Navigate to `./nxgallery-api` and run the following: 
   ```sh
   $ yarn install
   $ yarn build
   $ node dist/nxgallery-api/app
   ```
4. Navigate to `./nxgallery-ui` and run 
   ```sh
   $ yarn install
   $ yarn build:ssr
   $ node dist/nxgallery-ui/server
   ```
5. Use Postman to set up the administrator account. Make a `POST` request to `localhost:<API_PORT>/api/users/setup` with the following payload.
   ```json
   {
     "username": "test",
     "password": "password"
   }
   ```
   Once the administator account is created, the setup route is disabled and will only return an error message. Currently to reset the account or password the `users` collection needs to be dropped. The password is SHA512 hashed with a salt in the database.

You can run the build commands above locally, then copy the compiled `dist` folders from both projects folders to your server. That will allow you to run the `node dist` commands directly on the server to host the applications without needing to rebuild. NGINX can be used to forward the requests to the nxgallery-ui server.
In this case Yarn will not be required on the server - you will only need Node.js and MongoDB.

## For development
1. Fork and clone the repository
2. Set up environments config as in deployment
3. `yarn install` in both directories
4. `yarn start` in `nxgallery-api` to run server
5. `yarn start` in `nxgallery-ui` to run the client
   Note: If you change the `API_PORT` config, you need to update the path to the local development api server for the dev proxy inside `nxgallery-ui/proxy/proxy.conf.json`

## New Features to add!
- Dragging images to reorder in dashboard
- Optionally integrate with AWS, Google Cloud, Azure, etc, adding platform deployment keys and info to the config
- Add tags to image database with fulltext search
- Add captions to images
- Add album functionality, album ids to images
- Responsive thumbnail resolution
- Fullscreen lightbox on view
- Horizontal gallery option
