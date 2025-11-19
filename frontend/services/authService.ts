import { UserRole } from '../App';
import { apiClient } from './apiClient';

export interface AuthData {
  token: string;
  role: UserRole;
}

const AUTH_KEY = 'progredire-auth';
const IMPERSONATION_ORIGIN_KEY = 'progredire-impersonation-origin';

interface LoginCredentials {
    role: UserRole;
    email?: string;
    password?: string;
    cpf?: string;
}

const login = async (credentials: LoginCredentials): Promise<AuthData> => {
    try {
        const roleMap: Record<UserRole, string> = {
            'staff': 'STAFF',
            'company': 'COMPANY',
            'collaborator': 'COLLABORATOR'
        };

        const backendRole = roleMap[credentials.role];
        
        const response = await apiClient.post('/auth/login', {
            email: credentials.email,
            password: credentials.password,
            cpf: credentials.cpf,
            role: backendRole
        });

        const { access_token, user } = response.data;
        
        const authData: AuthData = {
            token: access_token,
            role: credentials.role,
        };

        localStorage.setItem('token', access_token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.removeItem(IMPERSONATION_ORIGIN_KEY);
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        
        return authData;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
        throw new Error(errorMessage);
    }
};


const logout = (): void => {
  try {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(IMPERSONATION_ORIGIN_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  } catch (error) {
    console.error('Failed to remove auth data from localStorage', error);
  }
};

const getAuth = (): AuthData | null => {
  try {
    const authDataString = localStorage.getItem(AUTH_KEY);
    if (!authDataString) {
      return null;
    }
    return JSON.parse(authDataString) as AuthData;
  } catch (error) {
    console.error('Failed to retrieve auth data from localStorage', error);
    return null;
  }
};

const impersonateLogin = (role: UserRole): Promise<AuthData> => {
    return new Promise((resolve) => {
        const originalAuth = getAuth();
        if (originalAuth && originalAuth.role === 'staff') {
            localStorage.setItem(IMPERSONATION_ORIGIN_KEY, JSON.stringify(originalAuth));
        }

        const newAuthData: AuthData = {
            token: `impersonated_token_${role}_${Date.now()}`,
            role: role,
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(newAuthData));
        resolve(newAuthData);
    });
};

const stopImpersonation = (): Promise<AuthData> => {
    return new Promise((resolve, reject) => {
        const originalAuthString = localStorage.getItem(IMPERSONATION_ORIGIN_KEY);
        if (originalAuthString) {
            const originalAuthData = JSON.parse(originalAuthString);
            localStorage.setItem(AUTH_KEY, originalAuthString);
            localStorage.removeItem(IMPERSONATION_ORIGIN_KEY);
            resolve(originalAuthData);
        } else {
            reject(new Error("Nenhuma sessão de personificação encontrada para parar."));
        }
    });
};

const getImpersonationOrigin = (): AuthData | null => {
    try {
        const dataString = localStorage.getItem(IMPERSONATION_ORIGIN_KEY);
        return dataString ? JSON.parse(dataString) : null;
    } catch {
        return null;
    }
};

export const authService = {
  login,
  logout,
  getAuth,
  impersonateLogin,
  stopImpersonation,
  getImpersonationOrigin,
};