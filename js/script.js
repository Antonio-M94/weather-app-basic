// Seleccionar elementos del DOM
const cityInput = document.querySelector('.city-input');
const searchButton = document.querySelector('.search-btn');
const locationButton = document.querySelector('.location-btn');
const currentWeatherDiv = document.querySelector('.current-weather');
const weatherCardsDiv = document.querySelector('.weather-cards');

// Clave de la API de OpenWeatherMap
const API_KEY = '24a01dab159a73a155df15cb9edaddfb';

// Función para manejar el clima actual
const handleCurrentWeather = (cityName, data) => {
  return `
    <div class="details">
    <h2>${cityName} - current weather</h2>

      <h4>Temperature: ${data.main.temp.toFixed(2)}°C</h4>
      <h4>Wind: ${data.wind.speed.toFixed(2)} M/S</h4> 
      <h4>Humidity: ${data.main.humidity}%</h4>
    </div>
    <div class="icon">
      <img src="https://openweathermap.org/img/wn/${
        data.weather[0].icon
      }@4x.png" alt="Weather-icon">
      <h4>${data.weather[0].description}</h4>
    </div>`;
};

// Función para manejar el pronóstico futuro del clima
const handleFutureWeather = (weatherItem) => {
  return `<li class="card">
    <h3>(${weatherItem.dt_txt.split(' ')[0]})</h3>
    <img src="https://openweathermap.org/img/wn/${
      weatherItem.weather[0].icon
    }@2x.png" alt="Weather-icon">
    <h4>Temp: ${weatherItem.main.temp.toFixed(2)}°C</h4>
    <h4>Wind: ${weatherItem.wind.speed.toFixed(2)} M/S</h4>
    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
  </li>`;
};

// Función para obtener detalles del clima actual
const getCurrentWeatherDetails = async (cityName) => {
  try {
    const CURRENT_WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`;
    const data = await fetchData(CURRENT_WEATHER_API_URL);

    // Limpiar contenido previo
    currentWeatherDiv.innerHTML = '';

    // Insertar detalles del clima actual
    currentWeatherDiv.insertAdjacentHTML(
      'beforeend',
      handleCurrentWeather(cityName, data)
    );
  } catch (error) {
    // Manejar errores
    console.error('Error fetching current weather data:', error.message);
    alert('An error occurred while fetching the current weather!');
  }
};

// Función para obtener el pronóstico futuro del clima
const getFutureWeatherDetails = async (cityName, lat, lon) => {
  try {
    const FUTURE_WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const data = await fetchData(FUTURE_WEATHER_API_URL);
    console.log(data);
    const uniqueForecastDays = [];
    const fiveDaysForecast = data.list.filter((forecast) => {
      const forecastDate = new Date(forecast.dt_txt).getDate();
      if (
        !uniqueForecastDays.includes(forecastDate) &&
        uniqueForecastDays.length < 5
      ) {
        uniqueForecastDays.push(forecastDate);
        return true;
      }
      return false;
    });

    // Limpiar contenido previo
    weatherCardsDiv.innerHTML = '';

    // Insertar pronóstico futuro del clima
    fiveDaysForecast.forEach((weatherItem) => {
      weatherCardsDiv.insertAdjacentHTML(
        'beforeend',
        handleFutureWeather(weatherItem)
      );
    });
  } catch (error) {
    // Manejar errores
    console.error('Error fetching future weather data:', error.message);
    alert('An error occurred while fetching the future weather forecast!');
  }
};

// Función para obtener detalles del clima
const getWeatherDetails = async (cityName, lat, lon) => {
  try {
    await getCurrentWeatherDetails(cityName);
    await getFutureWeatherDetails(cityName, lat, lon);
  } catch (error) {
    // Manejar errores
    console.error('Error fetching weather data:', error.message);
    alert('An error occurred while fetching the weather forecast!');
  }
};

// Función para realizar solicitudes fetch con manejo de errores
const fetchData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

// Función para obtener coordenadas de la ciudad ingresada por el usuario
const getCityCoordinates = async () => {
  try {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&units=metric&appid=${API_KEY}`;

    const data = await fetchData(GEOCODING_API_URL);

    if (!data.length) return;
    const { lat, lon } = data[0];
    await getWeatherDetails(cityName, lat, lon);

    // Limpiar el input después de buscar
    cityInput.value = '';
  } catch (error) {
    // Manejar errores
    console.error('Error fetching coordinates:', error.message);
    alert('An error occurred while fetching the coordinates!');
  }
};

// Función para obtener coordenadas del usuario actual
const getUserCoordinates = async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude, longitude } = position.coords;
    const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&units=metric&appid=${API_KEY}`;

    const data = await fetchData(REVERSE_GEOCODING_URL);

    const { name } = data[0];
    await getWeatherDetails(name, latitude, longitude);
  } catch (error) {
    // Manejar errores
    console.error('Error fetching coordinates:', error.message);
    alert('An error occurred while fetching the city!');
  }
};

// Event Listeners
locationButton.addEventListener('click', getUserCoordinates);
searchButton.addEventListener('click', getCityCoordinates);
cityInput.addEventListener(
  'keyup',
  (e) => e.key === 'Enter' && getCityCoordinates()
);
// Llama a la función para obtener las coordenadas del usuario al cargar la página
window.onload = () => {
  getUserCoordinates();
};
