// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

type CreateEventBody = {
  hostNome?: string;
  hostEmail: string;
  titulo: string;
  descricao?: string;
  dataHora: string;
  localTexto: string;
  capacidadeMax: number | string;
  contactUrl?: string | null;
};

// POST /api/events  → criar novo evento
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateEventBody;

    const {
      hostEmail,
      hostNome,
      titulo,
      descricao,
      dataHora,
      localTexto,
      capacidadeMax,
      contactUrl,
    } = body;

    // validação básica
    if (!hostEmail || !titulo || !dataHora || !localTexto || !capacidadeMax) {
      return NextResponse.json(
        { error: 'Campos obrigatórios em falta.' },
        { status: 400 },
      );
    }

    const capacidadeNum = Number(capacidadeMax);
    if (!Number.isFinite(capacidadeNum) || capacidadeNum <= 0) {
      return NextResponse.json(
        { error: 'Capacidade inválida.' },
        { status: 400 },
      );
    }

    // upsert do host (cria se não existir, atualiza nome se já existir)
const safeName =
  hostNome && hostNome.trim().length > 0
    ? hostNome.trim()
    : hostEmail; // fallback: usa o email como "nome" se vier vazio

const host = await prisma.user.upsert({
  where: { email: hostEmail },
  update: {
    nome: safeName,
  },
  create: {
    email: hostEmail,
    nome: safeName, // nunca é null
  },
});


    // criar evento com contactUrl incluído
    const event = await prisma.event.create({
      data: {
        hostId: host.id,
        titulo,
        descricao: descricao ?? null,
        dataHora: new Date(dataHora),
        localTexto,
        capacidadeMax: capacidadeNum,
        contactUrl: contactUrl ?? null, // <- AQUI GRAVAMOS O LINK
      },
    });

    return NextResponse.json(
      {
        id: event.id,
        link: `/event/${event.id}`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Erro ao criar evento', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar evento.' },
      { status: 500 },
    );
  }
}

// (opcional) GET /api/events  → listar eventos (útil para debug/painel simples)
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { dataHora: 'asc' },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Erro ao listar eventos', error);
    return NextResponse.json(
      { error: 'Erro interno ao listar eventos.' },
      { status: 500 },
    );
  }
}
