import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Sem user = sem eventos, mas não é erro
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    const rsvps = await prisma.rSVP.findMany({
      where: { userId: user.id },
      include: {
        event: true,
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    const events = rsvps.map((rsvp) => ({
      rsvpId: rsvp.id,
      estado: rsvp.estado,
      checkin: rsvp.checkin,
      criadoEm: rsvp.criadoEm,
      event: {
        id: rsvp.event.id,
        titulo: rsvp.event.titulo,
        dataHora: rsvp.event.dataHora,
        localTexto: rsvp.event.localTexto,
        capacidadeMax: rsvp.event.capacidadeMax,
      },
    }));

    return NextResponse.json({ events }, { status: 200 });
  } catch (err) {
    console.error('Erro em /api/user/events:', err);
    return NextResponse.json(
      { error: 'Erro interno a obter eventos do utilizador.' },
      { status: 500 }
    );
  }
}
