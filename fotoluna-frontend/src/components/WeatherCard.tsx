import React, { useEffect, useState } from 'react';

interface WeatherData {
    description: string;
    temp: number | null;
    loading: boolean;
    error: string | null;
}

const WeatherCard: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData>({
        description: 'Cargando clima...',
        temp: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const API_KEY = import.meta.env.VITE_WEATHER_API_KEY?.trim();
                const LAT = (import.meta.env.VITE_WEATHER_LAT || '4.441038036549305').trim();
                const LON = (import.meta.env.VITE_WEATHER_LON || '-75.22695195303584').trim();

                console.log('Weather Config:', { API_KEY: API_KEY ? '***' : 'MISSING', LAT, LON });

                if (!API_KEY) {
                    console.error('❌ VITE_WEATHER_API_KEY no está configurada en .env');
                    setWeather({
                        description: 'Configurar API key en .env',
                        temp: null,
                        loading: false,
                        error: 'Falta VITE_WEATHER_API_KEY',
                    });
                    return;
                }

                // Cache de 10 minutos
                const cacheKey = 'weather_cache_v1';
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - parsed.ts < 10 * 60 * 1000) {
                        console.log('📦 Usando clima en cache');
                        setWeather({
                            description: parsed.data.description,
                            temp: parsed.data.temp,
                            loading: false,
                            error: null,
                        });
                        return;
                    }
                }

                console.log(`🔄 Obteniendo clima: lat=${LAT}, lon=${LON}`);

                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&lang=es&appid=${API_KEY}`;
                console.log('URL:', url.replace(API_KEY, '***'));

                const response = await fetch(url);

                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error('❌ OpenWeatherMap error:', response.status, errorData);
                    throw new Error(`HTTP ${response.status}: ${errorData}`);
                }

                const data = await response.json();
                console.log('✅ Datos recibidos:', data);

                const description = data.weather?.[0]?.main || 'Desconocido';
                const temp = Math.round(data.main?.temp || 0);

                // Cache resultado
                localStorage.setItem(
                    cacheKey,
                    JSON.stringify({
                        ts: Date.now(),
                        data: { description, temp },
                    })
                );

                setWeather({
                    description,
                    temp,
                    loading: false,
                    error: null,
                });
            } catch (err) {
                console.error('❌ Error en WeatherCard:', err);
                setWeather({
                    description: 'No disponible',
                    temp: null,
                    loading: false,
                    error: String(err),
                });
            }
        };

        fetchWeather();
    }, []);

    // Mapear condición a emoji
    const getWeatherEmoji = (description: string): string => {
        const desc = description.toLowerCase();
        if (desc.includes('lluvia') || desc.includes('rain')) return '🌧️';
        if (desc.includes('nublado') || desc.includes('nube') || desc.includes('cloud')) return '☁️';
        if (desc.includes('despejado') || desc.includes('soleado') || desc.includes('clear') || desc.includes('sunny')) return '☀️';
        if (desc.includes('tormenta') || desc.includes('thunder')) return '⛈️';
        if (desc.includes('nieve') || desc.includes('snow')) return '❄️';
        if (desc.includes('niebla') || desc.includes('bruma') || desc.includes('mist') || desc.includes('fog')) return '🌫️';
        return '🌤️';
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: '#f5d5ff',
                borderRadius: '8px',
                minWidth: '240px',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
        >
            <span style={{ fontSize: '24px' }}>{getWeatherEmoji(weather.description)}</span>
            <div>
                <p style={{ margin: '0', fontSize: '12px', color: '#666', fontWeight: '500' }}>
                    {weather.description}
                </p>
                {weather.temp !== null && (
                    <p style={{ margin: '0', fontSize: '14px', color: '#333', fontWeight: '600' }}>
                        {weather.temp}°C
                    </p>
                )}
            </div>
        </div>
    );
};

export default WeatherCard;
