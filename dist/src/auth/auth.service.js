"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma.service");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        const { email, password, cpf, role } = loginDto;
        let user;
        if (role === 'COLLABORATOR') {
            if (!cpf) {
                throw new common_1.UnauthorizedException('CPF é obrigatório para colaboradores');
            }
            if (email || password) {
                throw new common_1.UnauthorizedException('Colaboradores devem usar apenas CPF');
            }
            user = await this.prisma.user.findFirst({
                where: { cpf, role: 'COLLABORATOR' },
                include: { company: true },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Colaborador não encontrado');
            }
        }
        else {
            if (!email) {
                throw new common_1.UnauthorizedException('Email é obrigatório para STAFF e COMPANY');
            }
            if (!password) {
                throw new common_1.UnauthorizedException('Senha é obrigatória');
            }
            if (cpf) {
                throw new common_1.UnauthorizedException('CPF não deve ser fornecido para STAFF ou COMPANY');
            }
            user = await this.prisma.user.findFirst({
                where: { email, role },
                include: { company: true },
            });
            if (!user || !user.passwordHash) {
                throw new common_1.UnauthorizedException('Credenciais inválidas');
            }
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Credenciais inválidas');
            }
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
            name: user.name,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyId: user.companyId,
                company: user.company,
            },
        };
    }
    async validateUser(payload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: { company: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map