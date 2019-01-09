export const API_PORT = 16906;
export const CLIENT_PORT = 4000;
export const MONGODB_PORT = 27017;

export const LOCAL_STORAGE = 'uploads/images';
export const LOCAL_ORIGINAL_STORAGE = 'uploads/original';
export const LOCAL_BASE_URL = `http:\/\/localhost:${API_PORT}/images/`;
export const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;
export const IMAGE_SIZES = [
  300,
  600,
  1200
]

export const JWT_SECRET = 'wow very secret, much secure'; // Change this (wow)