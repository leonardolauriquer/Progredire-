import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            companyId: any;
            company: any;
        };
    }>;
    validateUser(payload: any): Promise<{
        company: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            cnpj: string;
            razaoSocial: string;
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
