import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {

  const { id } = await context.params;

  const idNumber = Number(id);

  if (Number.isNaN(idNumber)) {
    return NextResponse.json(
      { error: 'ID de evento inválido.' },
      { status: 400 }
    );
  }

  const event = await prisma.event.findUnique({
    where: { id: idNumber },
    include: {
      host: true,
      rsvps: true,
    },
  });

  if (!event) {
    return NextResponse.json(
      { error: 'Evento não encontrado.' },
      { status: 404 }
    );
  }

  const inscritosConfirmados = event.rsvps.filter(
    (r) => r.estado === 'confirmado'
  ).length;

  const lugaresDisponiveis = event.capacidadeMax - inscritosConfirmados;

  return NextResponse.json({
    id: event.id,
    titulo: event.titulo,
    descricao: event.descricao,
    dataHora: event.dataHora,
    localTexto: event.localTexto,
    capacidadeMax: event.capacidadeMax,
    host: {
      id: event.host.id,
      nome: event.host.nome,
      email: event.host.email,
      fotoUrl: event.host.fotoUrl,
    },
    inscritosConfirmados,
    lugaresDisponiveis,
  });
}
