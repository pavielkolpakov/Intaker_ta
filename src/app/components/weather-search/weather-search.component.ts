import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WeatherService } from '../../services/weather.service';

@Component({
    selector: 'app-weather-search',
    imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './weather-search.component.html',
    styleUrl: './weather-search.component.scss'
})
export class WeatherSearchComponent {
    readonly weatherService = inject(WeatherService);
    cityName = model<string>('');

    onSearch(): void {
        const city = this.cityName().trim();
        if (city) {
            this.weatherService.searchCity(city);
        }
    }
}

