/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useMercadoPagoPreference.ts
import { useState } from 'react';

type PreferenceResponse = {
    id: string;
    init_point: string;
};

export function useMercadoPagoPreference() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createPreference = async (params: {
        title: string;
        quantity: number;
        unit_price: number;
        currency_id: string;
        payer_email: string;
    }): Promise<PreferenceResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/mercadopago/preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            if (!res.ok) {
                throw new Error('Error al crear preferencia');
            }

            const data = (await res.json()) as PreferenceResponse;
            return data;
        } catch (err: any) {
            setError(err.message ?? 'Error desconocido');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { createPreference, loading, error };
}
