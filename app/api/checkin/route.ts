import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { eventId, email } = await request.json();

    if (!eventId || !email) {
      return NextResponse.json(
        { error: 'eventId e email são obrigatórios.' },
        { status: 400 }
      );
    }

    const eventIdNumber = Number(eventId);
    if (Number.isNaN(eventIdNumber)) {
      return NextResponse.json(
        { error: 'eventId inválido.' },
        { status: 400 }
      );
    }

    // encontrar RSVP para este evento + email
    const rsvp = await prisma.rSVP.findFirst({
      where: {
        eventId: eventIdNumber,
        user: {
          email,
        },
        estado: 'confirmado',
      },
      include: {
        user: true,
        event: true,
      },
    });

    if (!rsvp) {
      return NextResponse.json(
        { error: 'Reserva não encontrada para este email.' },
        { status: 404 }
      );
    }

    if (rsvp.checkin) {
      return NextResponse.json({
        message: 'Presença já registada.',
      });
    }

    await prisma.rSVP.update({
      where: { id: rsvp.id },
      data: { checkin: true },
    });

    return NextResponse.json({
      message: 'Check-in confirmado. Boa corrida! 🏃‍♂️',
    });
  } catch (err) {
    console.error('Erro no check-in:', err);
    return NextResponse.json(
      { error: 'Erro interno no check-in.' },
      { status: 500 }
    );
  }
}
