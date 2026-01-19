export interface User {
  id: string;
  email: string;
  role: string;
}

export interface BackendAuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshUser: (token?: string) => Promise<void>;
}
