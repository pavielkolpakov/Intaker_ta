import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { NotificationService } from './notification.service';

interface Weather {
    description: string;
    main: string;
    icon: string;
}

export interface WeatherData {
    name: string;
    main: {
        temp: number;
        humidity: number;
        temp_min: number;
        temp_max: number;
        feels_like: number;
        pressure: number;
    };
    weather: Weather[];
    wind: {
        speed: number;
    };
    sys: {
        country: string;
    };
}

export interface ForecastData {
    list: Array<{
        dt: number;
        dt_txt: string;
        main: {
            temp: number;
            temp_min: number;
            temp_max: number;
            humidity: number;
            pressure: number;
        };
        weather: Weather[];
    }>;
    city: {
        name: string;
        country: string;
    };
}

export interface DailyForecast {
    date: Date;
    temp_min: number;
    temp_max: number;
    description: string;
    icon: string;
    main: string;
}

interface CachedWeatherData {
    currentWeather: WeatherData;
    forecast: ForecastData;
    timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class WeatherService {
    private readonly http = inject(HttpClient);
    private readonly notificationService = inject(NotificationService);

    private readonly API_KEY = '16bcc1df0a626a6fca1e51c79314c085';
    private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';
    private readonly CACHE_DURATION_MS = 60 * 60 * 1000;

    private readonly weatherCache = new Map<string, CachedWeatherData>();

    currentWeather = signal<WeatherData | null>(null);
    forecast = signal<ForecastData | null>(null);
    loading = signal<boolean>(false);

    readonly dailyForecast = computed<DailyForecast[]>(() => {
        const forecast = this.forecast();
        if (!forecast) return [];

        const dailyMap = new Map<string, DailyForecast>();

        forecast.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toDateString();

            if (!dailyMap.has(dateKey)) {
                dailyMap.set(dateKey, {
                    date: date,
                    temp_min: item.main.temp_min,
                    temp_max: item.main.temp_max,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    main: item.weather[0].main
                });
            } else {
                const existing = dailyMap.get(dateKey)!;
                existing.temp_min = Math.min(existing.temp_min, item.main.temp_min);
                existing.temp_max = Math.max(existing.temp_max, item.main.temp_max);
            }
        });

        return Array.from(dailyMap.values()).slice(1, 6);
    });

    searchCity(cityName: string): void {
        if (!cityName.trim()) {
            this.notificationService.showNotification('Please enter a city name');
            return;
        }

        const cacheKey = cityName.toLowerCase().trim();
        const cachedData = this.getCachedData(cacheKey);
        const currentTime = Date.now();

        if (cachedData && (currentTime - cachedData.timestamp) < this.CACHE_DURATION_MS) {
            this.currentWeather.set(cachedData.currentWeather);
            this.forecast.set(cachedData.forecast);
            this.notificationService.showNotification('Weather data loaded from cache');
            return;
        }

        this.loading.set(true);

        this.http.get<WeatherData>(`${this.BASE_URL}/weather?q=${cityName}&units=metric&appid=${this.API_KEY}`).pipe(
            catchError(error => {
                if (error.status === 404) {
                    this.notificationService.showNotification('City not found. Please try another city.');
                } else if (error.status === 401) {
                    this.notificationService.showNotification('Invalid API key. Please check your configuration.');
                } else {
                    this.notificationService.showNotification('Failed to fetch weather data. Please try again.');
                }
                this.loading.set(false);
                return of(null);
            })
        ).subscribe(data => {
            console.log('subscribe');
            if (data) {
                this.currentWeather.set(data);
                this.fetchForecast(cityName);
            }
        });
    }

    private fetchForecast(cityName: string): void {
        this.http.get<ForecastData>(`${this.BASE_URL}/forecast?q=${cityName}&units=metric&appid=${this.API_KEY}`).pipe(
            catchError(error => {
                this.notificationService.showNotification('Failed to fetch forecast data. Please try again.');
                this.loading.set(false);
                return of(null);
            })
        ).subscribe(data => {
            if (data) {
                this.forecast.set(data);

                const currentWeatherData = this.currentWeather();
                if (currentWeatherData) {
                    const cacheKey = cityName.toLowerCase().trim();
                    this.setCachedData(cacheKey, {
                        currentWeather: currentWeatherData,
                        forecast: data,
                        timestamp: Date.now()
                    });
                }
            }
            this.loading.set(false);
        });
    }

    getWeatherIconUrl(iconCode: string): string {
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    private getCachedData(cityKey: string): CachedWeatherData | null {
        return this.weatherCache.get(cityKey) || null;
    }

    private setCachedData(cityKey: string, data: CachedWeatherData): void {
        this.weatherCache.set(cityKey, data);
    }
}

