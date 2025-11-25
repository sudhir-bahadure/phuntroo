/**
 * Weather Service using Open-Meteo API (Free, No Key required)
 */

class WeatherService {
    constructor() {
        this.baseUrl = 'https://api.open-meteo.com/v1/forecast';
        this.cache = null;
        this.lastFetch = 0;
        this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    }

    /**
     * Get current weather for a location
     * Defaults to London if geolocation fails/denied
     */
    async getCurrentWeather() {
        try {
            // Check cache
            if (this.cache && (Date.now() - this.lastFetch < this.CACHE_DURATION)) {
                return this.cache;
            }

            const coords = await this.getCoordinates();
            const weather = await this.fetchWeather(coords.latitude, coords.longitude);

            this.cache = weather;
            this.lastFetch = Date.now();

            return weather;
        } catch (error) {
            console.warn('Weather fetch failed:', error);
            return { condition: 'unknown', temperature: 20, isDay: true };
        }
    }

    /**
     * Get user coordinates via browser API
     */
    getCoordinates() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({ latitude: 51.5074, longitude: -0.1278 }); // Default London
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.log('Geolocation denied/failed, using default');
                    resolve({ latitude: 51.5074, longitude: -0.1278 });
                }
            );
        });
    }

    /**
     * Fetch weather from Open-Meteo
     */
    async fetchWeather(lat, lon) {
        const url = `${this.baseUrl}?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code`;
        const response = await fetch(url);
        const data = await response.json();

        const current = data.current;
        return {
            temperature: current.temperature_2m,
            isDay: !!current.is_day,
            condition: this.decodeWeatherCode(current.weather_code),
            code: current.weather_code
        };
    }

    /**
     * Map WMO codes to simple conditions
     */
    decodeWeatherCode(code) {
        // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
        if (code === 0) return 'clear';
        if (code >= 1 && code <= 3) return 'cloudy';
        if (code >= 45 && code <= 48) return 'foggy';
        if (code >= 51 && code <= 67) return 'rainy';
        if (code >= 71 && code <= 77) return 'snowy';
        if (code >= 80 && code <= 82) return 'rainy';
        if (code >= 85 && code <= 86) return 'snowy';
        if (code >= 95 && code <= 99) return 'stormy';
        return 'clear';
    }
}

export const weatherService = new WeatherService();
