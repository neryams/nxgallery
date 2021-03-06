export const API_PORT = 16906;

export default {
  API_PORT: API_PORT,
  CLIENT_PORT: 4000,
  MONGODB_PORT: 27017,

  // Relative to the cwd path.
  // Prefixing with a ~ will make the path relative to the project root (the parent folder of this config file's folder)
  LOCAL_STORAGE: '~/uploads/images',
  LOCAL_ORIGINAL_STORAGE: '~/uploads/original',
  
  LOCAL_UPLOADS_BASE_URL: `\/\/localhost:${API_PORT}/images/`,
  MAX_UPLOAD_SIZE: 20 * 1024 * 1024,
  IMAGE_SIZES: [
    300,
    600,
    1200
  ],

  JWT_SECRET: 'wow very secret, much secure' // Change this (wow)
}