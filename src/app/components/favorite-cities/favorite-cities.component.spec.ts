import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoriteCitiesComponent } from './favorite-cities.component';
import { FavoritesService, FavoriteCityWithWeather } from '../../services/favorites.service';
import { WeatherService } from '../../services/weather.service';
import { signal } from '@angular/core';

describe('FavoriteCitiesComponent', () => {
    let component: FavoriteCitiesComponent;
    let fixture: ComponentFixture<FavoriteCitiesComponent>;
    let favoritesService: jasmine.SpyObj<FavoritesService>;
    let weatherService: jasmine.SpyObj<WeatherService>;

    const mockFavoritesWithWeather: FavoriteCityWithWeather[] = [
        {
            name: 'London',
            country: 'GB',
            temp: 20,
            temp_min: 18,
            temp_max: 22,
            description: 'clear sky',
            icon: '01d',
            main: 'Clear',
            loading: false
        },
        {
            name: 'Paris',
            country: 'FR',
            temp: 18,
            temp_min: 16,
            temp_max: 20,
            description: 'cloudy',
            icon: '02d',
            main: 'Clouds',
            loading: false
        }
    ];

    beforeEach(async () => {
        const favoritesServiceSpy = jasmine.createSpyObj('FavoritesService',
            ['removeFavorite'],
            {
                favoritesWithWeather: signal<FavoriteCityWithWeather[]>(mockFavoritesWithWeather)
            }
        );

        const weatherServiceSpy = jasmine.createSpyObj('WeatherService', ['searchCity']);

        await TestBed.configureTestingModule({
            imports: [FavoriteCitiesComponent],
            providers: [
                { provide: FavoritesService, useValue: favoritesServiceSpy },
                { provide: WeatherService, useValue: weatherServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FavoriteCitiesComponent);
        component = fixture.componentInstance;
        favoritesService = TestBed.inject(FavoritesService) as jasmine.SpyObj<FavoritesService>;
        weatherService = TestBed.inject(WeatherService) as jasmine.SpyObj<WeatherService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display favorites from service', () => {
        expect(component.favoritesService.favoritesWithWeather().length).toBe(2);
    });

    it('should call searchCity when clicking on a city', () => {
        component.onCityClick('London');

        expect(weatherService.searchCity).toHaveBeenCalledWith('London');
    });

    it('should remove favorite and stop event propagation', () => {
        const mockEvent = new Event('click');
        spyOn(mockEvent, 'stopPropagation');

        component.onRemoveFavorite(mockEvent, 'London', 'GB');

        expect(mockEvent.stopPropagation).toHaveBeenCalled();
        expect(favoritesService.removeFavorite).toHaveBeenCalledWith('London', 'GB');
    });
});

