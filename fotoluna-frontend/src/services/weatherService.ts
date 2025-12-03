/**
 * Servicio para obtener información del clima
 * Usa OpenWeatherMap API
 */

export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

export const getWeather = async (): Promise<WeatherData | null> => {
  try {
    const lat = import.meta.env.VITE_WEATHER_LAT;
    const lon = import.meta.env.VITE_WEATHER_LON;
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

    if (!lat || !lon || !apiKey) {
      console.warn('Faltan variables de entorno para el clima');
      return null;
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`
    );

    if (!response.ok) {
      console.error('Error al obtener clima:', response.statusText);
      return null;
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      description: data.weather[0].main,
      icon: data.weather[0].icon,
      city: data.name,
    };
  } catch (error) {
    console.error('Error en getWeather:', error);
    return null;
  }
};

/**
 * Mapea el código de icono de OpenWeatherMap a Bootstrap Icons
 */
export const mapWeatherIcon = (iconCode: string): string => {
  const iconMap: { [key: string]: string } = {
    '01d': 'bi-sun-fill', // clear sky day
    '01n': 'bi-moon-stars-fill', // clear sky night
    '02d': 'bi-cloud-sun-fill', // few clouds day
    '02n': 'bi-cloud-moon-fill', // few clouds night
    '03d': 'bi-cloud-fill', // scattered clouds day
    '03n': 'bi-cloud-fill', // scattered clouds night
    '04d': 'bi-cloud-fill', // broken clouds day
    '04n': 'bi-cloud-fill', // broken clouds night
    '09d': 'bi-cloud-rain-fill', // shower rain day
    '09n': 'bi-cloud-rain-fill', // shower rain night
    '10d': 'bi-cloud-rain-fill', // rain day
    '10n': 'bi-cloud-rain-fill', // rain night
    '11d': 'bi-cloud-lightning-fill', // thunderstorm day
    '11n': 'bi-cloud-lightning-fill', // thunderstorm night
    '13d': 'bi-snow', // snow day
    '13n': 'bi-snow', // snow night
    '50d': 'bi-cloud-haze-fill', // mist day
    '50n': 'bi-cloud-haze-fill', // mist night
  };

  return iconMap[iconCode] || 'bi-cloud-sun-fill';
};
