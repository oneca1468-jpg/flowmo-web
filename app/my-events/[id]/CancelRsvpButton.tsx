// app/my-events/[id]/CancelRsvpButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  rsvpId: number;
  disabled?: boolean;
};

export function CancelRsvpButton({ rsvpId, disabled = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [localDisabled, setLocalDisabled] = useState(disabled);
  const router = useRouter();

  async function handleCancel() {
    if (localDisabled || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/rsvp/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvpId }),
      });

      if (!res.ok) {
        console.error('Falha ao cancelar reserva');
        return;
      }

      // marca como cancelado no UI e refresca dados
      setLocalDisabled(true);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (localDisabled) {
    return (
      <button
        disabled
        className="w-full border border-zinc-800 rounded-lg px-3 py-2 text-center text-xs text-zinc-500 cursor-not-allowed"
      >
        Reserva já cancelada
      </button>
    );
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="w-full border border-red-500 text-red-500 rounded-lg px-3 py-2 text-center text-xs hover:bg-red-500/10 transition"
    >
      {loading ? 'A cancelar...' : 'Cancelar reserva'}
    </button>
  );
}
