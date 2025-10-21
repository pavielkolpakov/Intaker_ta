import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FavoritesService } from '../../services/favorites.service';
import { WeatherService } from '../../services/weather.service';

@Component({
    selector: 'app-favorite-cities',
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './favorite-cities.component.html',
    styleUrl: './favorite-cities.component.scss'
})
export class FavoriteCitiesComponent {
    readonly favoritesService = inject(FavoritesService);
    readonly weatherService = inject(WeatherService);

    onCityClick(cityName: string): void {
        this.weatherService.searchCity(cityName);
    }

    onRemoveFavorite(event: Event, cityName: string, country: string): void {
        event.stopPropagation();
        this.favoritesService.removeFavorite(cityName, country);
    }
}
