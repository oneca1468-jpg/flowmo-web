import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CancelRsvpButton } from './CancelRsvpButton';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MyEventDetailPage({ params }: PageProps) {
  // Next 16: params é uma Promise → é obrigatório fazer await
  const { id } = await params;
  const rsvpId = Number(id);

  if (!rsvpId || Number.isNaN(rsvpId)) {
    notFound();
  }

  const rsvp = await prisma.rSVP.findUnique({
    where: { id: rsvpId },
    include: {
      event: {
        include: {
          host: true,
        },
      },
      user: true,
    },
  });

  if (!rsvp) {
    notFound();
  }

  const { event, user } = rsvp;

  const date = new Date(event.dataHora);
  const formattedDate = date.toLocaleDateString('pt-PT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const formattedTime = date.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  let estadoLabel = '';
  if (rsvp.estado === 'confirmado' && !rsvp.checkin) {
    estadoLabel = 'Reserva confirmada';
  } else if (rsvp.estado === 'confirmado' && rsvp.checkin) {
    estadoLabel = 'Presença registada';
  } else if (rsvp.estado === 'lista_espera') {
    estadoLabel = 'Lista de espera';
  } else if (rsvp.estado === 'cancelado') {
    estadoLabel = 'Reserva cancelada';
  }

  const hostName = event.host?.nome ?? 'Host desconhecido';
  const contactUrl = (event as any).contactUrl ?? null;
  const podeCancelar = rsvp.estado !== 'cancelado' && !rsvp.checkin;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-black text-white">
      <div className="w-full max-w-xl space-y-6 border border-zinc-800 rounded-xl p-6 bg-zinc-900/80">
        <header className="space-y-1">
          <p className="text-xs text-zinc-400 uppercase tracking-wide">
            A tua reserva
          </p>
          <h1 className="text-2xl font-bold">{event.titulo}</h1>
          <p className="text-sm text-zinc-400">
            {formattedDate} · {formattedTime} · {event.localTexto}
          </p>
        </header>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Estado</span>
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-zinc-800">
              {estadoLabel}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Host</span>
            <span className="font-medium text-zinc-200">{hostName}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Capacidade</span>
            <span className="font-medium text-zinc-200">
              {event.capacidadeMax} pessoas
            </span>
          </div>
        </section>

        <section className="space-y-2 border-t border-zinc-800 pt-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wide">
            Os teus dados
          </p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-zinc-400">Nome:</span>{' '}
              <span className="font-medium">{user.nome}</span>
            </p>
            <p>
              <span className="text-zinc-400">Email:</span>{' '}
              <span className="font-medium">{user.email}</span>
            </p>
          </div>
        </section>

        <section className="space-y-3 border-t border-zinc-800 pt-4 text-sm">
          <p className="text-xs text-zinc-400 uppercase tracking-wide">
            Ações rápidas
          </p>

          <div className="flex flex-col gap-2">
            <a
              href={buildCalendarLink(
                event.titulo,
                event.dataHora as unknown as string,
                event.localTexto,
              )}
              target="_blank"
              rel="noreferrer"
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-center font-semibold bg-white text-black hover:bg-zinc-100 transition"
            >
              Adicionar ao calendário
            </a>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                event.localTexto,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full border border-zinc-800 rounded-lg px-3 py-2 text-center text-xs hover:bg-zinc-800/60 transition"
            >
              Ver localização no mapa
            </a>

            {contactUrl && (
              <a
                href={contactUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full border border-zinc-800 rounded-lg px-3 py-2 text-center text-xs hover:bg-zinc-800/60 transition"
              >
                Falar com o host
              </a>
            )}

            {podeCancelar && <CancelRsvpButton rsvpId={rsvp.id} />}
          </div>
        </section>

        <footer className="pt-2">
          <Link href="/my-events" className="text-xs text-zinc-400 underline">
            Voltar às minhas reservas
          </Link>
        </footer>
      </div>
    </main>
  );
}

function buildCalendarLink(title: string, isoDate: string, location: string) {
  const start = new Date(isoDate);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // +1h

  const format = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const details = encodeURIComponent(
    'Reserva feita via Flowmo. Chega 10 minutos antes para aquecer.',
  );

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${format(start)}/${format(end)}`,
    details,
    location,
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}
