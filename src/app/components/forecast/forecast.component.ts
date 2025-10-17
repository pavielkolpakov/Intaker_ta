import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { WeatherService } from '../../services/weather.service';

@Component({
    selector: 'app-forecast',
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './forecast.component.html',
    styleUrl: './forecast.component.scss'
})
export class ForecastComponent {
    readonly weatherService = inject(WeatherService);
    readonly Math = Math;

    getDayName(date: Date): string {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
}

