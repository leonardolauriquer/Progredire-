import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private authService;
    constructor(configService: ConfigService, authService: AuthService);
    validate(payload: any): Promise<{
        company: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            razaoSocial: string;
            cnpj: string;
            setor: string;
            numColaboradores: number;
            contatoPrincipalNome: string;
            contatoPrincipalEmail: string;
        };
    } & {
        id: string;
        email: string;
        cpf: string | null;
        name: string;
        passwordHash: string | null;
        role: import(".prisma/client").$Enums.Role;
        companyId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
