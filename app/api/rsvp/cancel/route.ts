// app/api/rsvp/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { rsvpId } = await request.json();

    if (!rsvpId) {
      return NextResponse.json(
        { error: 'rsvpId é obrigatório.' },
        { status: 400 },
      );
    }

    const updated = await prisma.rSVP.update({
      where: { id: Number(rsvpId) },
      data: {
        estado: 'cancelado',
        checkin: false,
      },
    });

    return NextResponse.json(
      { success: true, id: updated.id },
      { status: 200 },
    );
  } catch (error) {
    console.error('Erro a cancelar RSVP', error);
    return NextResponse.json(
      { error: 'Erro interno ao cancelar reserva.' },
      { status: 500 },
    );
  }
}
