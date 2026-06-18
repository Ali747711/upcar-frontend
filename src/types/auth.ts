export interface User {
  id: string
  email: string
  name?: string
}

export interface AuthData {
  user: User
  token: string
}
