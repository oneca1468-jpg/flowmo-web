import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório.' },
        { status: 400 },
      );
    }

    const rsvps = await prisma.rSVP.findMany({
      where: {
        user: { email },
      },
      include: {
        event: true,
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    const events = rsvps.map((r) => ({
      rsvpId: r.id,
      estado: r.estado,
      checkin: r.checkin,
      criadoEm: r.criadoEm,
      event: {
        id: r.event.id,
        titulo: r.event.titulo,
        dataHora: r.event.dataHora,
        localTexto: r.event.localTexto,
        capacidadeMax: r.event.capacidadeMax,
      },
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Erro a carregar eventos do utilizador', error);
    return NextResponse.json(
      { error: 'Erro interno a carregar eventos.' },
      { status: 500 },
    );
  }
}
