import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentWeatherComponent } from './current-weather.component';
import { WeatherService, WeatherData } from '../../services/weather.service';
import { FavoritesService } from '../../services/favorites.service';
import { signal } from '@angular/core';

describe('CurrentWeatherComponent', () => {
    let component: CurrentWeatherComponent;
    let fixture: ComponentFixture<CurrentWeatherComponent>;
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
        const weatherServiceSpy = jasmine.createSpyObj('WeatherService', [], {
            currentWeather: signal<WeatherData | null>(null)
        });

        const favoritesServiceSpy = jasmine.createSpyObj('FavoritesService',
            ['addFavorite', 'removeFavorite', 'isFavorite']
        );

        await TestBed.configureTestingModule({
            imports: [CurrentWeatherComponent],
            providers: [
                { provide: WeatherService, useValue: weatherServiceSpy },
                { provide: FavoritesService, useValue: favoritesServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(CurrentWeatherComponent);
        component = fixture.componentInstance;
        weatherService = TestBed.inject(WeatherService) as jasmine.SpyObj<WeatherService>;
        favoritesService = TestBed.inject(FavoritesService) as jasmine.SpyObj<FavoritesService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should compute temperature correctly', () => {
        weatherService.currentWeather.set(mockWeatherData);
        expect(component.temperature()).toBe(20);
    });

    it('should compute feels like temperature', () => {
        weatherService.currentWeather.set(mockWeatherData);
        expect(component.feelsLike()).toBe(19);
    });

    it('should compute temperature range', () => {
        weatherService.currentWeather.set(mockWeatherData);
        expect(component.tempMin()).toBe(18);
        expect(component.tempMax()).toBe(22);
    });

    it('should compute city name with country', () => {
        weatherService.currentWeather.set(mockWeatherData);
        expect(component.cityName()).toBe('London, GB');
    });

    it('should compute humidity', () => {
        weatherService.currentWeather.set(mockWeatherData);
        expect(component.humidity()).toBe(65);
    });

    it('should compute weather description', () => {
        weatherService.currentWeather.set(mockWeatherData);
        expect(component.description()).toBe('clear sky');
    });

    it('should compute wind speed', () => {
        weatherService.currentWeather.set(mockWeatherData);
        expect(component.windSpeed()).toBe(5);
    });

    it('should check if city is favorite', () => {
        weatherService.currentWeather.set(mockWeatherData);
        favoritesService.isFavorite.and.returnValue(true);

        expect(component.isFavorite()).toBe(true);
        expect(favoritesService.isFavorite).toHaveBeenCalledWith('London', 'GB');
    });

    it('should add city to favorites when toggling from non-favorite', () => {
        weatherService.currentWeather.set(mockWeatherData);
        favoritesService.isFavorite.and.returnValue(false);

        component.toggleFavorite();

        expect(favoritesService.addFavorite).toHaveBeenCalledWith('London', 'GB');
    });

    it('should remove city from favorites when toggling from favorite', () => {
        weatherService.currentWeather.set(mockWeatherData);
        favoritesService.isFavorite.and.returnValue(true);

        component.toggleFavorite();

        expect(favoritesService.removeFavorite).toHaveBeenCalledWith('London', 'GB');
    });

    it('should not toggle favorite when weather data is null', () => {
        weatherService.currentWeather.set(null);

        component.toggleFavorite();

        expect(favoritesService.addFavorite).not.toHaveBeenCalled();
        expect(favoritesService.removeFavorite).not.toHaveBeenCalled();
    });
});

