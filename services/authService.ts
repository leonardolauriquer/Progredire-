import { UserRole } from '../App';
import { findCompanyUserByEmail, findEmployeeByCpf } from './dataService';

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

const login = (credentials: LoginCredentials): Promise<AuthData> => {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(async () => {
            try {
                if (credentials.role === 'staff') {
                    if (!credentials.email) {
                        return reject(new Error('Email é obrigatório para acesso Staff.'));
                    }
                    const allowedStaffEmails = [
                        'paula.progredire@gmail.com',
                        'natieli.progredire@gmail.com',
                        'leonardo.progredire@gmail.com'
                    ];
                    if (!allowedStaffEmails.includes(credentials.email.toLowerCase())) {
                        return reject(new Error('Acesso negado. Email não autorizado.'));
                    }
                    // For mock purposes, staff login doesn't check password
                } else if (credentials.role === 'collaborator') {
                    if (!credentials.cpf || !credentials.password) {
                        return reject(new Error('CPF e senha são obrigatórios.'));
                    }
                    // Find user by CPF and check password
                    const user = await findEmployeeByCpf(credentials.cpf);
                    if (!user || user.password !== credentials.password) {
                        return reject(new Error('CPF ou senha inválidos.'));
                    }
                } else if (credentials.role === 'company') {
                    if (!credentials.email || !credentials.password) {
                        return reject(new Error('Email e senha são obrigatórios.'));
                    }
                     // Find user by email and check password
                    const user = await findCompanyUserByEmail(credentials.email);
                    if (!user || user.password !== credentials.password) {
                        return reject(new Error('Email ou senha inválidos.'));
                    }
                } else {
                     // Default mock for old company/collaborator login without credentials
                     console.warn(`Login sem credenciais para ${credentials.role}. Usando mock.`);
                }
                
                // On success, create mock auth data
                const authData: AuthData = {
                    token: `mock_token_${credentials.role}_${Date.now()}`,
                    role: credentials.role,
                };

                localStorage.removeItem(IMPERSONATION_ORIGIN_KEY); // Clear any old impersonation
                localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
                resolve(authData);
            } catch (error) {
                console.error('Login process failed', error);
                reject(new Error('Ocorreu um erro inesperado durante o login.'));
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