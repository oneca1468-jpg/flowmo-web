'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type UserEvent = {
  rsvpId: number;
  estado: 'confirmado' | 'lista_espera' | 'cancelado';
  checkin: boolean;
  criadoEm: string;
  event: {
    id: number;
    titulo: string;
    dataHora: string;
    localTexto: string;
    capacidadeMax: number;
  };
};

export default function MyEventsPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // carregar email do query param ou localStorage
  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    const storedEmail =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('flowmo_user_email')
        : null;

    const initial = emailFromQuery || storedEmail || '';
    if (initial) {
      setEmail(initial);
      fetchEvents(initial);
    }
  }, [searchParams]);

  async function fetchEvents(targetEmail: string) {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/user/events?email=${encodeURIComponent(targetEmail)}`
      );
      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error || 'Erro a carregar as tuas inscrições.');
        setEvents([]);
        return;
      }

      setEvents(json.events || []);
      if ((json.events || []).length === 0) {
        setMessage('Ainda não tens inscrições com este email.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Erro inesperado ao carregar as tuas inscrições.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // guardar email
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('flowmo_user_email', email);
    }
    fetchEvents(email);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6 border rounded-xl p-6">
        <h1 className="text-2xl font-bold text-center">
          As tuas inscrições · Flowmo
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-2 items-center justify-center"
        >
          <input
            className="w-full md:w-2/3 border px-2 py-1 rounded"
            type="email"
            placeholder="O teu email usado nas reservas"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full md:w-auto border rounded px-4 py-2 font-semibold"
          >
            Ver as minhas corridas
          </button>
        </form>

        {loading && <p className="text-sm text-gray-400">A carregar...</p>}

        {message && <p className="text-sm text-gray-400">{message}</p>}

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {events.map((item) => {
            const ev = item.event;
            const date = new Date(ev.dataHora);
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
            if (item.estado === 'confirmado' && !item.checkin) {
              estadoLabel = 'Confirmado';
            } else if (item.estado === 'confirmado' && item.checkin) {
              estadoLabel = 'Presença registada';
            } else if (item.estado === 'lista_espera') {
              estadoLabel = 'Lista de espera';
            } else if (item.estado === 'cancelado') {
              estadoLabel = 'Cancelado';
            }

            return (
              <div
                key={item.rsvpId}
                className="border rounded-lg p-3 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-sm">{ev.titulo}</h2>
                    <p className="text-xs text-gray-400">
                      {formattedDate} · {formattedTime}
                    </p>
                    <p className="text-xs text-gray-400">{ev.localTexto}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold">{estadoLabel}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <Link
                    href={`/event/${ev.id}`}
                    className="underline text-[11px]"
                  >
                    Ver detalhes do evento
                  </Link>
                  {item.checkin && (
                    <span className="text-[11px] text-green-400">
                      ✅ Check-in confirmado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
