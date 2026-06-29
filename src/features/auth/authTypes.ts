export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'USER' | 'ADMIN' | 'SUPPORT';
  status: 'ACTIVE' | 'SUSPENDED';
  avatar?: string;
  mobileVerified?: boolean;
  emailVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
