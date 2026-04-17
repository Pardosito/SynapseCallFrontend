export type LoginPayload = {
  email: string;
  password_hash: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password_hash: string;
};

export type AuthResponse = {
  message: string;
  accessToken?: string;
  user?: AuthUser;
};

export type AuthUser = {
  id?: string;
  name?: string;
  email: string;
};

export type ApiMessageResponse = {
  message: string;
};

export type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
};

export type GooglePayload = {
  googleId: string,
  email: string,
  name: string
}