import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { WeatherService } from './weather.service';

export interface FavoriteCity {
    name: string;
    country: string;
}

export interface FavoriteCityWithWeather extends FavoriteCity {
    temp: number;
    temp_min: number;
    temp_max: number;
    description: string;
    icon: string;
    main: string;
    loading?: boolean;
}

interface WeatherData {
    name: string;
    main: {
        temp: number;
        temp_min: number;
        temp_max: number;
    };
    weather: Array<{
        description: string;
        icon: string;
        main: string;
    }>;
    sys: {
        country: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class FavoritesService {
    private readonly http = inject(HttpClient);
    private readonly weatherService = inject(WeatherService);
    private readonly STORAGE_KEY = 'favorite_cities';
    private readonly API_KEY = '16bcc1df0a626a6fca1e51c79314c085';
    private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';

    favorites = signal<FavoriteCity[]>([]);
    favoritesWithWeather = signal<FavoriteCityWithWeather[]>([]);

    constructor() {
        this.loadFavorites();
        this.fetchWeatherForAllFavorites();
    }

    private loadFavorites(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                this.favorites.set(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }

    private saveFavorites(): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.favorites()));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }

    private fetchWeatherForAllFavorites(): void {
        const favorites = this.favorites();

        if (favorites.length === 0) {
            this.favoritesWithWeather.set([]);
            return;
        }

        const favoritesWithWeatherData: FavoriteCityWithWeather[] = [];

        favorites.forEach((fav, index) => {
            this.http.get<WeatherData>(`${this.BASE_URL}/weather?q=${fav.name}&units=metric&appid=${this.API_KEY}`).pipe(
                catchError(() => of(null))).subscribe(data => {
                if (data) {
                    favoritesWithWeatherData.push({
                        name: data.name,
                        country: data.sys.country,
                        temp: Math.round(data.main.temp),
                        temp_min: Math.round(data.main.temp_min),
                        temp_max: Math.round(data.main.temp_max),
                        description: data.weather[0].description,
                        icon: data.weather[0].icon,
                        main: data.weather[0].main,
                        loading: false
                    });
                }
            });
        });
        this.favoritesWithWeather.set(favoritesWithWeatherData);
    }

    addFavorite(cityName: string, country: string): void {
        const current = this.favorites();
        const exists = current.find(
            fav => fav.name.toLowerCase() === cityName.toLowerCase() &&
                fav.country === country
        );

        if (!exists) {
            this.favorites.set([...current, { name: cityName, country }]);
            const currentWeather = this.weatherService.currentWeather();
            if (currentWeather) {
                this.favoritesWithWeather.set([...this.favoritesWithWeather(), {
                    name: currentWeather.name,
                    country: currentWeather.sys.country,
                    temp: Math.round(currentWeather.main.temp),
                    temp_min: Math.round(currentWeather.main.temp_min),
                    temp_max: Math.round(currentWeather.main.temp_max),
                    description: currentWeather.weather[0].description,
                    icon: currentWeather.weather[0].icon,
                    main: currentWeather.weather[0].main,
                    loading: false
                }]);
            }
            this.saveFavorites();
        }
    }

    removeFavorite(cityName: string, country: string): void {
        const current = this.favorites();
        const filtered = current.filter(
            fav => !(fav.name.toLowerCase() === cityName.toLowerCase() && fav.country === country)
        );
        this.favorites.set(filtered);
        this.favoritesWithWeather.set(this.favoritesWithWeather().filter(fav => fav.name !== cityName && fav.country !== country));
        this.saveFavorites();
    }

    isFavorite(cityName: string, country: string): boolean {
        return this.favorites().some(
            fav => fav.name.toLowerCase() === cityName.toLowerCase() && fav.country === country
        );
    }
}
