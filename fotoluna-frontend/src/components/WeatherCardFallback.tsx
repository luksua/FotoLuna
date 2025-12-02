import React, { useEffect, useState } from 'react';

interface WeatherData {
  description: string;
  temp: number | null;
  loading: boolean;
}

/**
 * Alternativa sin API key: usa Open-Meteo (libre, sin límites)
 * https://open-meteo.com
 */
const WeatherCardFallback: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    description: 'Cargando clima...',
    temp: null,
    loading: true,
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const LAT = (import.meta.env.VITE_WEATHER_LAT || '4.441038036549305').trim();
        const LON = (import.meta.env.VITE_WEATHER_LON || '-75.22695195303584').trim();

        console.log(`🔄 [WeatherCardFallback] Obteniendo clima: lat=${LAT}, lon=${LON}`);

        // Open-Meteo: NO requiere API key, es libre
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code,relative_humidity_2m&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Datos Open-Meteo:', data);

        const temp = Math.round(data.current?.temperature_2m || 0);
        const weatherCode = data.current?.weather_code;

        // Mapear WMO weather codes a descripción
        const descriptionMap: { [key: number]: string } = {
          0: 'Despejado',
          1: 'Mayormente despejado',
          2: 'Parcialmente nublado',
          3: 'Nublado',
          45: 'Niebla',
          48: 'Niebla helada',
          51: 'Llovizna leve',
          53: 'Llovizna moderada',
          55: 'Llovizna densa',
          61: 'Lluvia leve',
          63: 'Lluvia moderada',
          65: 'Lluvia fuerte',
          71: 'Nieve leve',
          73: 'Nieve moderada',
          75: 'Nieve fuerte',
          80: 'Lluvia ligera',
          81: 'Lluvia moderada',
          82: 'Lluvia fuerte',
          85: 'Lluvia nival leve',
          86: 'Lluvia nival fuerte',
          95: 'Tormenta',
          96: 'Tormenta con granizo leve',
          99: 'Tormenta con granizo fuerte',
        };

        const description = descriptionMap[weatherCode] || 'Desconocido';

        setWeather({
          description,
          temp,
          loading: false,
        });
      } catch (err) {
        console.error('❌ Error Open-Meteo:', err);
        setWeather({
          description: 'No disponible',
          temp: null,
          loading: false,
        });
      }
    };

    fetchWeather();
  }, []);

  const getWeatherEmoji = (description: string): string => {
    const desc = description.toLowerCase();
    if (desc.includes('lluvia') || desc.includes('llovizna')) return '🌧️';
    if (desc.includes('nublado') || desc.includes('nube')) return '☁️';
    if (desc.includes('despejado') || desc.includes('soleado')) return '☀️';
    if (desc.includes('tormenta')) return '⛈️';
    if (desc.includes('nieve') || desc.includes('nival')) return '❄️';
    if (desc.includes('niebla')) return '🌫️';
    if (desc.includes('mayormente')) return '🌤️';
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

export default WeatherCardFallback;
