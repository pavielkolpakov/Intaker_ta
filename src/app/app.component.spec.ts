import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { WeatherService, WeatherData } from './services/weather.service';
import { signal } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FavoritesService } from './services/favorites.service';

describe('AppComponent', () => {
  let weatherService: jasmine.SpyObj<WeatherService>;
  let favoritesService: jasmine.SpyObj<FavoritesService>;

  const mockWeatherData: WeatherData = {
    name: 'London',
    main: {
      temp: 20,
      humidity: 65,
      temp_min: 18,
      temp_max: 22,
      feels_like: 19,
      pressure: 1013
    },
    weather: [{
      description: 'clear sky',
      main: 'Clear',
      icon: '01d'
    }],
    wind: {
      speed: 5
    },
    sys: {
      country: 'GB'
    }
  };

  beforeEach(async () => {
    const weatherServiceSpy = jasmine.createSpyObj('WeatherService', ['searchCity'], {
      currentWeather: signal<WeatherData | null>(null),
      forecast: signal(null),
      loading: signal(false),
      dailyForecast: signal([])
    });

    const favoritesServiceSpy = jasmine.createSpyObj('FavoritesService',
      ['addFavorite', 'removeFavorite', 'isFavorite'],
      {
        favorites: signal([]),
        favoritesWithWeather: signal([])
      }
    );

    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule],
      providers: [
        { provide: WeatherService, useValue: weatherServiceSpy },
        { provide: FavoritesService, useValue: favoritesServiceSpy }
      ]
    }).compileComponents();

    weatherService = TestBed.inject(WeatherService) as jasmine.SpyObj<WeatherService>;
    favoritesService = TestBed.inject(FavoritesService) as jasmine.SpyObj<FavoritesService>;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have weatherService injected', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.weatherService).toBeDefined();
  });

  it('should return "clear" when no weather data is available', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    weatherService.currentWeather.set(null);

    expect(app.weatherCondition()).toBe('clear');
  });

  it('should return "rainy" for rain weather condition', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const rainyWeather = { ...mockWeatherData };
    rainyWeather.weather = [{ description: 'light rain', main: 'Rain', icon: '10d' }];
    weatherService.currentWeather.set(rainyWeather);

    expect(app.weatherCondition()).toBe('rainy');
  });

  it('should return "rainy" for drizzle weather condition', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const drizzleWeather = { ...mockWeatherData };
    drizzleWeather.weather = [{ description: 'light drizzle', main: 'Drizzle', icon: '09d' }];
    weatherService.currentWeather.set(drizzleWeather);

    expect(app.weatherCondition()).toBe('rainy');
  });

  it('should return "snowy" for snow weather condition', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const snowyWeather = { ...mockWeatherData };
    snowyWeather.weather = [{ description: 'light snow', main: 'Snow', icon: '13d' }];
    weatherService.currentWeather.set(snowyWeather);

    expect(app.weatherCondition()).toBe('snowy');
  });

  it('should return "cloudy" for cloud weather condition', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const cloudyWeather = { ...mockWeatherData };
    cloudyWeather.weather = [{ description: 'few clouds', main: 'Clouds', icon: '02d' }];
    weatherService.currentWeather.set(cloudyWeather);

    expect(app.weatherCondition()).toBe('cloudy');
  });

  it('should return "clear" for clear weather condition', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    weatherService.currentWeather.set(mockWeatherData);

    expect(app.weatherCondition()).toBe('clear');
  });

  it('should return "rainy" for thunderstorm weather condition', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const thunderWeather = { ...mockWeatherData };
    thunderWeather.weather = [{ description: 'thunderstorm', main: 'Thunderstorm', icon: '11d' }];
    weatherService.currentWeather.set(thunderWeather);

    expect(app.weatherCondition()).toBe('rainy');
  });

  it('should return "clear" for unknown weather condition', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const unknownWeather = { ...mockWeatherData };
    unknownWeather.weather = [{ description: 'unknown', main: 'Unknown', icon: 'xx' }];
    weatherService.currentWeather.set(unknownWeather);

    expect(app.weatherCondition()).toBe('clear');
  });

  it('should be case insensitive when checking weather conditions', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const mixedCaseWeather = { ...mockWeatherData };
    mixedCaseWeather.weather = [{ description: 'RAIN', main: 'RAIN', icon: '10d' }];
    weatherService.currentWeather.set(mixedCaseWeather);

    expect(app.weatherCondition()).toBe('rainy');
  });

  it('should render all child components', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('app-weather-search')).toBeTruthy();
    expect(compiled.querySelector('app-current-weather')).toBeTruthy();
    expect(compiled.querySelector('app-forecast')).toBeTruthy();
    expect(compiled.querySelector('app-favorite-cities')).toBeTruthy();
  });

  it('should have correct data-weather attribute on weather background', () => {
    const fixture = TestBed.createComponent(AppComponent);
    weatherService.currentWeather.set(mockWeatherData);
    fixture.detectChanges();

    const weatherBackground = fixture.nativeElement.querySelector('.weather-background');
    expect(weatherBackground.getAttribute('data-weather')).toBe('clear');
  });

  it('should update data-weather attribute when weather changes', () => {
    const fixture = TestBed.createComponent(AppComponent);

    weatherService.currentWeather.set(mockWeatherData);
    fixture.detectChanges();
    let weatherBackground = fixture.nativeElement.querySelector('.weather-background');
    expect(weatherBackground.getAttribute('data-weather')).toBe('clear');

    const rainyWeather = { ...mockWeatherData };
    rainyWeather.weather = [{ description: 'rain', main: 'Rain', icon: '10d' }];
    weatherService.currentWeather.set(rainyWeather);
    fixture.detectChanges();

    weatherBackground = fixture.nativeElement.querySelector('.weather-background');
    expect(weatherBackground.getAttribute('data-weather')).toBe('rainy');
  });
});
