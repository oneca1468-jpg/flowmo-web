'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type EventSummary = {
  id: number;
  titulo: string;
  dataHora: string;
  localTexto: string;
};

type RSVPPageProps = {
  params: Promise<{ id: string }>;
};

export default function RSVPPage({ params }: RSVPPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [event, setEvent] = useState<EventSummary | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const { id } = await params;
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao carregar evento.');
        setEvent({
          id: data.id,
          titulo: data.titulo,
          dataHora: data.dataHora,
          localTexto: data.localTexto,
        });
      } catch (err) {
        console.error(err);
        setMessage('Não foi possível carregar os detalhes do evento.');
      } finally {
        setLoadingEvent(false);
      }
    }
    load();
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          name,
          email,
        }),
      });

      const out = await res.json();

      if (!res.ok) {
        setMessage(out.error || 'Erro ao confirmar presença.');
        return;
      }

      // guardar email
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('flowmo_user_email', email);
      }

      // redirecionar para página "as minhas inscrições"
      router.push(`/my-events?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error(err);
      setMessage('Erro inesperado ao confirmar presença.');
    } finally {
      setSubmitting(false);
    }
  }

  const dateLabel =
    event &&
    new Date(event.dataHora).toLocaleString('pt-PT', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Cabeçalho */}
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Reserva de vaga
          </p>
          <h1 className="text-xl font-semibold">
            {loadingEvent ? 'A carregar evento...' : event?.titulo || 'Evento'}
          </h1>
          {event && (
            <p className="text-xs text-zinc-400">
              {dateLabel} · 📍 {event.localTexto}
            </p>
          )}
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Nome</label>
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-400"
              type="text"
              placeholder="O teu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Email</label>
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-400"
              type="email"
              placeholder="Para receberes lembretes e o QR"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Foto opcional fica para v1.1, não compliques agora */}

          {message && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !event}
            className="w-full text-sm font-semibold py-3 rounded-xl bg-white text-black hover:bg-zinc-100 disabled:bg-zinc-700 disabled:text-zinc-400 transition"
          >
            {submitting ? 'A confirmar...' : 'Confirmar presença'}
          </button>

          <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
            Após confirmar, vais conseguir ver todas as tuas inscrições na página
            <span className="font-semibold"> “As minhas corridas”</span> e
            receber lembretes antes do evento.
          </p>
        </form>
      </div>
    </main>
  );
}
