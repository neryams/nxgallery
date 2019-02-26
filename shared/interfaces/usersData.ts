export interface User {
  username: string,
  email: string,
  displayName: string,
  passwordHash?: string,
  passwordSalt?: string,
  settings: {
    theme: string
  }
}