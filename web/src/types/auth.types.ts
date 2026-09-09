export type Role = 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'INACTIVE';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  accountStatus?: AccountStatus;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}
