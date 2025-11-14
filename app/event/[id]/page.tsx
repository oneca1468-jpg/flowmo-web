import { notFound } from 'next/navigation';

type EventApiResponse = {
  id: number;
  titulo: string;
  descricao: string | null;
  dataHora: string;
  localTexto: string;
  capacidadeMax: number;
  inscritosConfirmados: number;
  lugaresDisponiveis: number;
  host?: {
    nome: string | null;
    email: string;
    fotoUrl?: string | null;
  } | null;
};

type EventPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;

   const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/events/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error('Erro ao carregar evento.');
  }

  const data: EventApiResponse = await res.json();

  const {
    titulo,
    descricao,
    dataHora,
    localTexto,
    capacidadeMax,
    inscritosConfirmados,
    lugaresDisponiveis,
    host,
  } = data;

  const date = new Date(dataHora);
  const formattedDate = date.toLocaleDateString('pt-PT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const formattedTime = date.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isFull = lugaresDisponiveis <= 0;
  const progress = Math.min(
    100,
    Math.round((inscritosConfirmados / Math.max(capacidadeMax, 1)) * 100)
  );

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-400">
            <span className="h-[1px] w-6 bg-zinc-500" />
            Evento Flowmo
          </p>
          <h1 className="text-2xl font-semibold leading-snug">{titulo}</h1>

          {host && (
            <div className="flex items-center gap-3 mt-3">
              <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold">
                {host.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={host.fotoUrl}
                    alt={host.nome ?? host.email}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  (host.nome ?? host.email)?.charAt(0)?.toUpperCase()
                )}
              </div>
              <div className="flex flex-col text-xs text-zinc-400">
                <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Host
                </span>
                <span className="text-sm text-zinc-100">
                  {host.nome || host.email.split('@')[0]}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Data & hora
            </p>
            <p className="font-medium">
              {formattedDate} · {formattedTime}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Local
            </p>
            <p className="font-medium truncate" title={localTexto}>
              📍 {localTexto}
            </p>
          </div>
        </div>

        {/* Capacidade */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Vagas
            </span>
            <span className="text-xs font-medium">
              {inscritosConfirmados} / {capacidadeMax} preenchidas
            </span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isFull ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400">
            {isFull ? (
              <span className="text-red-400 font-medium">Evento cheio. </span>
            ) : (
              <span className="text-emerald-400 font-medium">
                {lugaresDisponiveis} vagas disponíveis.{' '}
              </span>
            )}
            Reserva rápida, sem criar conta.
          </p>
        </div>

        {/* Descrição */}
        {descricao && (
          <div className="border-t border-zinc-800 pt-4 text-sm text-zinc-300 leading-relaxed">
            {descricao}
          </div>
        )}

        {/* CTA */}
        <div className="space-y-2 border-t border-zinc-800 pt-4">
          {!isFull ? (
            <a
              href={`/rsvp/${id}`}
              className="block w-full text-center text-sm font-semibold py-3 rounded-xl bg-white text-black hover:bg-zinc-200 transition"
            >
              Reservar vaga
            </a>
          ) : (
            <button
              disabled
              className="block w-full text-center text-sm font-semibold py-3 rounded-xl bg-zinc-800 text-zinc-400 cursor-not-allowed"
            >
              Entrar na lista de espera (em breve)
            </button>
          )}
          <p className="text-[11px] text-zinc-500 text-center">
            Ao reservar, recebes lembretes e o QR de check-in antes da corrida.
          </p>
        </div>
      </div>
    </main>
  );
}
