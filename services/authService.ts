
import { UserRole } from '../App';

export interface AuthData {
  token: string;
  role: UserRole;
}

const AUTH_KEY = 'progredire-auth';
const IMPERSONATION_ORIGIN_KEY = 'progredire-impersonation-origin';


const login = (role: UserRole, email?: string): Promise<AuthData> => {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      // Staff-specific validation
      if (role === 'staff') {
        if (!email) {
          return reject(new Error('Email é obrigatório para acesso Staff.'));
        }
        const allowedStaffEmails = [
          'paula.progredire@gmail.com',
          'natieli.progredire@gmail.com',
          'leonardo.progredire@gmail.com'
        ];
        if (!allowedStaffEmails.includes(email.toLowerCase())) {
          return reject(new Error('Acesso negado. Email não autorizado.'));
        }
      }

      // Simulate a possible failure
      if (Math.random() > 0.95) { // 5% chance of failure
        reject(new Error('Falha na autenticação. Tente novamente.'));
        return;
      }

      // On success, create mock auth data
      const authData: AuthData = {
        token: `mock_token_${role}_${Date.now()}`,
        role: role,
      };

      try {
        localStorage.removeItem(IMPERSONATION_ORIGIN_KEY); // Clear any old impersonation
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        resolve(authData);
      } catch (error) {
        console.error('Failed to save auth data to localStorage', error);
        reject(new Error('Não foi possível salvar a sessão. Verifique as permissões do seu navegador.'));
      }
    }, 1000); // 1 second delay
  });
};

const logout = (): void => {
  try {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(IMPERSONATION_ORIGIN_KEY);
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
