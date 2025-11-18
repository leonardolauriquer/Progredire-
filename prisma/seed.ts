import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('senha123', 10);

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@progredire.com' },
    update: {},
    create: {
      email: 'staff@progredire.com',
      name: 'Admin Staff',
      passwordHash: hashedPassword,
      role: 'STAFF',
    },
  });

  const company = await prisma.company.upsert({
    where: { cnpj: '12345678000190' },
    update: {},
    create: {
      name: 'Empresa Demo',
      razaoSocial: 'Empresa Demo Ltda',
      cnpj: '12345678000190',
      setor: 'Tecnologia',
      numColaboradores: 50,
      contatoPrincipalNome: 'João Silva',
      contatoPrincipalEmail: 'joao@empresademo.com',
    },
  });

  const companyUser = await prisma.user.upsert({
    where: { email: 'empresa@demo.com' },
    update: {},
    create: {
      email: 'empresa@demo.com',
      name: 'Gestor RH',
      passwordHash: hashedPassword,
      role: 'COMPANY',
      companyId: company.id,
    },
  });

  const collaboratorUser = await prisma.user.upsert({
    where: { cpf: '12345678900' },
    update: {},
    create: {
      email: 'colaborador@demo.com',
      name: 'Maria Santos',
      cpf: '12345678900',
      role: 'COLLABORATOR',
      companyId: company.id,
    },
  });

  console.log('Seed completed!');
  console.log('---');
  console.log('Staff:', staffUser.email, '/ senha123');
  console.log('Company:', companyUser.email, '/ senha123');
  console.log('Collaborator CPF:', collaboratorUser.cpf);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
