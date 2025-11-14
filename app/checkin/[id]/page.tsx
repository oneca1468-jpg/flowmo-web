'use client';

import { useEffect, useState } from 'react';

export default function CheckinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { id } = await params;
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) {
        setEvent(null);
      } else {
        const data = await res.json();
        setEvent(data);
      }
      setLoading(false);
    }
    load();
  }, [params]);

  async function handleCheckin(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!event) return;

    setMessage('A confirmar presença...');

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Erro no check-in.');
        return;
      }

      setMessage(data.message || 'Check-in confirmado!');
    } catch (err) {
      console.error(err);
      setMessage('Erro inesperado no check-in.');
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>A carregar evento...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Evento não encontrado.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 border rounded-xl p-6">
        <h1 className="text-2xl font-bold text-center">Check-in Flowmo</h1>

        <div className="text-sm text-gray-300 space-y-1 text-center">
          <p>
            <span className="font-semibold">Evento:</span> {event.titulo}
          </p>
          <p>
            <span className="font-semibold">Local:</span> {event.localTexto}
          </p>
        </div>

        <form onSubmit={handleCheckin} className="space-y-3">
          <p className="text-sm text-gray-300 text-center">
            Introduz o email com que reservaste a vaga:
          </p>

          <input
            className="w-full border px-2 py-1 rounded"
            type="email"
            required
            placeholder="o-teu-email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            className="w-full border rounded py-2 font-semibold"
          >
            Estou aqui
          </button>
        </form>

        {message && (
          <p className="text-sm text-center mt-2">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
