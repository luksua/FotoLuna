import { useEffect, useState } from 'react';
import { getWeather, mapWeatherIcon, type WeatherData } from '../services/weatherService';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const data = await getWeather();
        setWeather(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener el clima');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Refrescar cada 30 minutos
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const iconClass = weather ? mapWeatherIcon(weather.icon) : 'bi-cloud-sun-fill';
  const description = weather?.description || 'Parcialmente nublado';

  return { weather, loading, error, iconClass, description };
};
