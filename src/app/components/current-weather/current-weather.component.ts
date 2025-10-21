import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { WeatherService } from '../../services/weather.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
    selector: 'app-current-weather',
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatDividerModule,
        MatButtonModule
    ],
    templateUrl: './current-weather.component.html',
    styleUrl: './current-weather.component.scss'
})
export class CurrentWeatherComponent {
    readonly weatherService = inject(WeatherService);
    readonly favoritesService = inject(FavoritesService);

    readonly currentDate = new Date();

    temperature = computed(() => {
        const weather = this.weatherService.currentWeather();
        return weather ? Math.round(weather.main.temp) : null;
    });

    feelsLike = computed(() => {
        const weather = this.weatherService.currentWeather();
        return weather ? Math.round(weather.main.feels_like) : null;
    });

    tempMin = computed(() => {
        const weather = this.weatherService.currentWeather();
        return weather ? Math.round(weather.main.temp_min) : null;
    });

    tempMax = computed(() => {
        const weather = this.weatherService.currentWeather();
        return weather ? Math.round(weather.main.temp_max) : null;
    });

    humidity = computed(() => {
        return this.weatherService.currentWeather()?.main.humidity;
    });

    description = computed(() => {
        return this.weatherService.currentWeather()?.weather[0].description;
    });

    cityName = computed(() => {
        const weather = this.weatherService.currentWeather();
        return weather ? `${weather.name}, ${weather.sys.country}` : null;
    });

    windSpeed = computed(() => {
        return this.weatherService.currentWeather()?.wind.speed;
    });

    isFavorite = computed(() => {
        const weather = this.weatherService.currentWeather();
        if (!weather) return false;
        return this.favoritesService.isFavorite(weather.name, weather.sys.country);
    });

    toggleFavorite(): void {
        const weather = this.weatherService.currentWeather();
        if (!weather) return;

        if (this.isFavorite()) {
            this.favoritesService.removeFavorite(weather.name, weather.sys.country);
        } else {
            this.favoritesService.addFavorite(weather.name, weather.sys.country);
        }
    }
}

