'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type HostEvent = {
  id: number;
  titulo: string;
  dataHora: string;
  localTexto: string;
  capacidadeMax: number;
  inscritosConfirmados: number;
  presentes: number;
};

export default function HostPage() {
  const [hostName, setHostName] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [localTexto, setLocalTexto] = useState('');
  const [contactUrl, setContactUrl] = useState('');
  const [capacidadeMax, setCapacidadeMax] = useState('10');
  const [message, setMessage] = useState<string | null>(null);
  const [events, setEvents] = useState<HostEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // carregar hostEmail/hostName do localStorage
  useEffect(() => {
    const storedEmail = window.localStorage.getItem('flowmo_host_email');
    const storedName = window.localStorage.getItem('flowmo_host_name');
    if (storedEmail) setHostEmail(storedEmail);
    if (storedName) setHostName(storedName);

    if (storedEmail) {
      fetchEvents(storedEmail);
    }
  }, []);

  async function fetchEvents(email: string) {
    try {
      setLoadingEvents(true);
      const res = await fetch(`/api/host/events?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (res.ok) {
        setEvents(json.events || []);
      } else {
        console.error(json.error || 'Erro a carregar eventos');
      }
    } catch (err) {
      console.error('Erro a buscar eventos:', err);
    } finally {
      setLoadingEvents(false);
    }
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName,
          hostEmail,
          titulo,
          descricao,
          dataHora,
          localTexto,
          capacidadeMax,
          contactUrl: contactUrl || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error || 'Erro ao criar evento.');
        return;
      }

     setMessage(`Evento criado com ID ${json.id}. Link: ${json.link}`);

window.localStorage.setItem('flowmo_host_email', hostEmail);
window.localStorage.setItem('flowmo_host_name', hostName || '');

      // limpa campos de evento
      setTitulo('');
      setDescricao('');
      setDataHora('');
      setLocalTexto('');
      setCapacidadeMax('10');

      // recarrega eventos
      fetchEvents(hostEmail);
    } catch (err) {
      console.error(err);
      setMessage('Erro inesperado.');
    }
  }

  return (
    <main className="min-h-screen flex justify-center p-4">
      <div className="w-full max-w-5xl grid gap-8 md:grid-cols-[1.2fr,1.8fr]">
        {/* Coluna esquerda: Identidade + Criar evento */}
        <section className="space-y-4 border rounded-xl p-6">
          <h1 className="text-2xl font-bold mb-2">Painel do Host · Flowmo</h1>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Identidade do Host</h2>
            <p className="text-xs text-gray-400">
              Usa sempre o mesmo email — é assim que associamos os eventos ao teu painel.
            </p>

            <div>
              <label className="block text-sm font-medium">Nome</label>
              <input
                className="w-full border px-2 py-1 rounded"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full border px-2 py-1 rounded"
                value={hostEmail}
                onChange={(e) => setHostEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
              <label className="text-xs text-zinc-300">
                Link de contacto (Instagram, WhatsApp, etc.)
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                placeholder="https://instagram.com/teu_run_club ou https://wa.me/..."
                value={contactUrl}
                onChange={(e) => setContactUrl(e.target.value)}
              />
            </div>  

          <hr className="my-4 opacity-40" />

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Criar novo evento</h2>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Título</label>
                <input
                  className="w-full border px-2 py-1 rounded"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  placeholder="Corrida aberta · 5km · Braga"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Descrição</label>
                <textarea
                  className="w-full border px-2 py-1 rounded"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Corrida leve, ritmo confortável. Ponto de encontro: ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Data e hora</label>
                <input
                  type="datetime-local"
                  className="w-full border px-2 py-1 rounded"
                  value={dataHora}
                  onChange={(e) => setDataHora(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Local (texto)</label>
                <input
                  className="w-full border px-2 py-1 rounded"
                  value={localTexto}
                  onChange={(e) => setLocalTexto(e.target.value)}
                  required
                  placeholder="Parque da Ponte, Braga"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Capacidade máxima
                </label>
                <input
                  type="number"
                  className="w-full border px-2 py-1 rounded"
                  value={capacidadeMax}
                  onChange={(e) => setCapacidadeMax(e.target.value)}
                  required
                  min={1}
                />
              </div>

              <button
                type="submit"
                className="w-full border rounded py-2 font-semibold mt-2"
              >
                Criar evento
              </button>
            </form>

            {message && (
              <p className="text-sm mt-2">
                {message}
              </p>
            )}
          </div>
        </section>

        {/* Coluna direita: Lista de eventos */}
        <section className="space-y-4 border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Os teus eventos</h2>
            {hostEmail && (
              <button
                className="text-xs underline"
                onClick={() => fetchEvents(hostEmail)}
              >
                Atualizar
              </button>
            )}
          </div>

          {!hostEmail && (
            <p className="text-sm text-gray-400">
              Introduz o email do host e cria pelo menos um evento para ver a lista aqui.
            </p>
          )}

          {hostEmail && loadingEvents && (
            <p className="text-sm text-gray-400">A carregar eventos...</p>
          )}

          {hostEmail && !loadingEvents && events.length === 0 && (
            <p className="text-sm text-gray-400">
              Ainda não tens eventos criados com este email.
            </p>
          )}

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {events.map((ev) => {
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

              return (
                <div
                  key={ev.id}
                  className="border rounded-lg p-3 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{ev.titulo}</h3>
                      <p className="text-xs text-gray-400">
                        {formattedDate} · {formattedTime}
                      </p>
                      <p className="text-xs text-gray-400">
                        {ev.localTexto}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p>
                        <span className="font-semibold">Inscritos:</span>{' '}
                        {ev.inscritosConfirmados} / {ev.capacidadeMax}
                      </p>
                      <p>
                        <span className="font-semibold">Presentes:</span>{' '}
                        {ev.presentes}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs mt-1">
                    <Link
                      href={`/event/${ev.id}`}
                      className="border px-2 py-1 rounded"
                    >
                      Página pública
                    </Link>
                    <Link
                      href={`/checkin/${ev.id}`}
                      className="border px-2 py-1 rounded"
                    >
                      Link check-in
                    </Link>
                    {/* Duplicar evento podemos fazer como próxima melhoria */}
                  </div>

                  <p className="text-[10px] text-gray-500 break-all">
                    Link público: {typeof window !== 'undefined'
                      ? `${window.location.origin}/event/${ev.id}`
                      : `/event/${ev.id}`}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
