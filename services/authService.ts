
import { UserRole } from '../App';

export interface AuthData {
  token: string;
  role: UserRole;
}

const AUTH_KEY = 'progredire-auth';

const login = (role: UserRole): Promise<AuthData> => {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      // Simulate a possible failure
      if (Math.random() > 0.9) { // 10% chance of failure
        reject(new Error('Falha na autenticação. Tente novamente.'));
        return;
      }

      // On success, create mock auth data
      const authData: AuthData = {
        token: `mock_token_${role}_${Date.now()}`,
        role: role,
      };

      try {
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

export const authService = {
  login,
  logout,
  getAuth,
};
