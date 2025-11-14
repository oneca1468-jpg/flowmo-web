import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email do host é obrigatório.' },
        { status: 400 }
      );
    }

    const host = await prisma.user.findUnique({
      where: { email },
    });

    if (!host) {
      // Sem host = sem eventos, mas não é erro
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    const events = await prisma.event.findMany({
      where: { hostId: host.id },
      orderBy: { dataHora: 'desc' },
      include: {
        rsvps: true,
      },
    });

    const result = events.map((event) => {
      const inscritosConfirmados = event.rsvps.filter(
        (r) => r.estado === 'confirmado'
      ).length;

      const presentes = event.rsvps.filter(
        (r) => r.estado === 'confirmado' && r.checkin
      ).length;

      return {
        id: event.id,
        titulo: event.titulo,
        dataHora: event.dataHora,
        localTexto: event.localTexto,
        capacidadeMax: event.capacidadeMax,
        inscritosConfirmados,
        presentes,
      };
    });

    return NextResponse.json({ events: result }, { status: 200 });
  } catch (err) {
    console.error('Erro em /api/host/events:', err);
    return NextResponse.json(
      { error: 'Erro interno a obter eventos.' },
      { status: 500 }
    );
  }
}
