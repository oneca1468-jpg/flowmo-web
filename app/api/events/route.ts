import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      hostEmail,
      hostName,
      titulo,
      descricao,
      dataHora,
      localTexto,
      capacidadeMax,
    } = body;

    if (
      !hostEmail ||
      !hostName ||
      !titulo ||
      !dataHora ||
      !localTexto ||
      !capacidadeMax
    ) {
      return NextResponse.json(
        { error: 'Campos obrigatórios em falta.' },
        { status: 400 }
      );
    }

    const capacidade = Number(capacidadeMax);
    if (Number.isNaN(capacidade) || capacidade <= 0) {
      return NextResponse.json(
        { error: 'Capacidade inválida.' },
        { status: 400 }
      );
    }

    const host = await prisma.user.upsert({
      where: { email: hostEmail },
      update: { nome: hostName },
      create: {
        nome: hostName,
        email: hostEmail,
      },
    });

    const event = await prisma.event.create({
      data: {
        hostId: host.id,
        titulo,
        descricao,
        dataHora: new Date(dataHora),
        localTexto,
        capacidadeMax: capacidade,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar evento.' },
      { status: 500 }
    );
  }
}
