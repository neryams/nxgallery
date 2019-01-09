export interface User {
  username: string,
  email: string,
  passwordHash?: string,
  passwordSalt?: string
}