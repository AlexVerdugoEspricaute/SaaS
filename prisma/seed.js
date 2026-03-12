const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Tenant: use findFirst/create because `name` is not unique in the schema
  const tenantName = 'Acme Inc';
  let tenant = await prisma.tenant.findFirst({ where: { name: tenantName } });
  if (!tenant) {
    tenant = await prisma.tenant.create({ data: { name: tenantName } });
  }

  // User: email is unique so upsert is fine
  const bcrypt = require('bcryptjs');
  const password = 'admin';
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@acme.test' },
    update: { name: 'Admin', tenantId: tenant.id, passwordHash, role: 'ADMIN', passwordMustChange: true },
    create: { email: 'admin@acme.test', name: 'Admin', tenantId: tenant.id, passwordHash, role: 'ADMIN', passwordMustChange: true }
  });

  // Project: ensure project for this tenant exists (name not unique globally)
  const projectName = 'Demo Project';
  let project = await prisma.project.findFirst({ where: { name: projectName, tenantId: tenant.id } });
  if (!project) {
    project = await prisma.project.create({ data: { name: projectName, tenantId: tenant.id } });
  }

  console.log({ tenant, user, project });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
