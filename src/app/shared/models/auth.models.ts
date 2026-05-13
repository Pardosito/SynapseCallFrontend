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
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    logoUrl?: string;
    isOwner: boolean;
  };
};

export type ApiMessageResponse = {
  message: string;
};

export type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
};

export type GooglePayload = {
  credential: string;
}