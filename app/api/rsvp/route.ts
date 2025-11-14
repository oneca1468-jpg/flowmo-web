import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';


export async function POST(request: NextRequest) {
  try {
    const { eventId, name, email } = await request.json();

    if (!eventId || !name || !email) {
      return NextResponse.json(
        { error: 'Dados incompletos.' },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { rsvps: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento não existe.' }, { status: 404 });
    }

    const confirmed = event.rsvps.filter((r) => r.estado === 'confirmado').length;
    const hasSpace = confirmed < event.capacidadeMax;

const rsvp = await prisma.rSVP.create({
  data: {
    estado: hasSpace ? 'confirmado' : 'lista_espera',

    // liga o RSVP ao evento existente
    event: {
      connect: { id: eventId },
    },

    // liga/cria o user pelo email
    user: {
      connectOrCreate: {
        where: { email },
        create: { nome: name, email },
      },
    },
  },
});



    return NextResponse.json({
      message: hasSpace
        ? 'Reserva confirmada!'
        : 'Evento cheio. Ficaste em lista de espera!',
      rsvp,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
