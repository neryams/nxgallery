import { AuthLoader, AuthStaticLoader } from '@ngx-auth/core';

const STORAGE_KEY = 'currentUser';
export const LOGIN_URL = '/api/users/authenticate';

// tslint:disable-next-line:only-arrow-functions
export function authFactory(): AuthLoader {
  return new AuthStaticLoader({
    backend: {
      endpoint: LOGIN_URL,
      params: []
    },
    storage: localStorage,
    storageKey: STORAGE_KEY,
    loginRoute: ['/manage/login'],
    defaultUrl: '/manage/dashboard'
  });
}

// tslint:disable-next-line:only-arrow-functions
export function getCurrentToken(): string {
  try {
    const authData = localStorage.getItem(STORAGE_KEY);
    if (!authData) {
      return undefined;
    }
  
    const parsedAuthData = JSON.parse(authData);

    return parsedAuthData.token;
  } catch(e) {
    return undefined;
  }
}