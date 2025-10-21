import { Component, computed, inject } from '@angular/core';
import { WeatherSearchComponent } from './components/weather-search/weather-search.component';
import { CurrentWeatherComponent } from './components/current-weather/current-weather.component';
import { ForecastComponent } from './components/forecast/forecast.component';
import { FavoriteCitiesComponent } from './components/favorite-cities/favorite-cities.component';
import { WeatherService } from './services/weather.service';

@Component({
  selector: 'app-root',
  imports: [
    WeatherSearchComponent,
    CurrentWeatherComponent,
    ForecastComponent,
    FavoriteCitiesComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly weatherService = inject(WeatherService);

  readonly weatherCondition = computed(() => {
    const weather = this.weatherService.currentWeather();
    if (!weather) return 'clear';

    const main = weather.weather[0].main.toLowerCase();

    if (main.includes('rain') || main.includes('drizzle')) return 'rainy';
    if (main.includes('snow')) return 'snowy';
    if (main.includes('cloud')) return 'cloudy';
    if (main.includes('clear')) return 'clear';
    if (main.includes('thunder')) return 'rainy';

    return 'clear';
  });
}
