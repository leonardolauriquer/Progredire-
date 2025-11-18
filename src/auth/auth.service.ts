import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password, cpf, role } = loginDto;

    let user;

    if (role === 'COLLABORATOR') {
      if (!cpf) {
        throw new UnauthorizedException('CPF é obrigatório para colaboradores');
      }
      if (email || password) {
        throw new UnauthorizedException('Colaboradores devem usar apenas CPF');
      }
      user = await this.prisma.user.findFirst({
        where: { cpf, role: 'COLLABORATOR' },
        include: { company: true },
      });
      
      if (!user) {
        throw new UnauthorizedException('Colaborador não encontrado');
      }
    } else {
      if (!email) {
        throw new UnauthorizedException('Email é obrigatório para STAFF e COMPANY');
      }
      if (!password) {
        throw new UnauthorizedException('Senha é obrigatória');
      }
      if (cpf) {
        throw new UnauthorizedException('CPF não deve ser fornecido para STAFF ou COMPANY');
      }
      
      user = await this.prisma.user.findFirst({
        where: { email, role },
        include: { company: true },
      });

      if (!user || !user.passwordHash) {
        throw new UnauthorizedException('Credenciais inválidas');
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
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

  async validateUser(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { company: true },
    });
    
    if (!user) {
      throw new UnauthorizedException();
    }
    
    return user;
  }
}
