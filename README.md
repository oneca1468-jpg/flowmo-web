This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy na Vercel + Neon

Para que as APIs (`/api/events`, `/api/host/events`, etc.) funcionem na Vercel é indispensável que o Prisma consiga falar com o Postgres do Neon:

1. **Variáveis de ambiente**
   - `DATABASE_URL`: usa a connection string do *pooler* do Neon e certifica-te de que não tem aspas. O código normaliza automaticamente `sslmode=require`, `pgbouncer=true`, `connect_timeout=15` e remove `channel_binding=require` (que não é suportado pelo driver do Prisma).
   - `NEXT_PUBLIC_BASE_URL`: define para `https://<teu-domínio>.vercel.app` para que os fetches feitos em SSR funcionem em produção.
2. **Migrações**
   - Com `DATABASE_URL` a apontar para o Neon, corre `npx prisma migrate deploy --schema prisma/schema.prisma` antes de cada deploy (ou adiciona este comando antes do `next build` na Vercel) para garantir que as tabelas `User`, `Event` e `RSVP` existem.
3. **Verificação**
   - Depois do deploy, valida as endpoints diretamente (`/api/events`, `/api/host/events?email=...`). Se surgir algum 500, consulta o log da function correspondente em *Deployments → Functions* para ler a stack do Prisma.

Sem estes passos a app não consegue criar nem listar eventos porque o Prisma não encontra a base de dados ou as tabelas necessárias.
