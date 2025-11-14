import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function normalizeDatabaseUrl(): string {
  const rawUrl = process.env.DATABASE_URL?.trim();

  if (!rawUrl) {
    throw new Error('DATABASE_URL não está definida no ambiente.');
  }

  const unquoted = rawUrl.replace(/^['"]+|['"]+$/g, '');

  let parsed: URL;
  try {
    parsed = new URL(unquoted);
  } catch (err) {
    throw new Error(`DATABASE_URL inválida: ${(err as Error).message}`);
  }

  if (parsed.searchParams.get('channel_binding') === 'require') {
    parsed.searchParams.delete('channel_binding');
  }

  if (!parsed.searchParams.has('sslmode')) {
    parsed.searchParams.set('sslmode', 'require');
  }

  if (parsed.hostname.includes('pooler')) {
    parsed.searchParams.set('pgbouncer', 'true');

    if (!parsed.searchParams.has('connect_timeout')) {
      parsed.searchParams.set('connect_timeout', '15');
    }

    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '15');
    }
  }

  return parsed.toString();
}

const datasourceUrl = normalizeDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: { url: datasourceUrl },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
