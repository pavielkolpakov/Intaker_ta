import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WeatherService, WeatherData, ForecastData } from './weather.service';
import { NotificationService } from './notification.service';

describe('WeatherService', () => {
    let service: WeatherService;
    let httpMock: HttpTestingController;
    let notificationService: jasmine.SpyObj<NotificationService>;

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

    const mockForecastData: ForecastData = {
        list: [
            {
                dt: 1609459200,
                dt_txt: '2021-01-01 00:00:00',
                main: {
                    temp: 20,
                    temp_min: 18,
                    temp_max: 22,
                    humidity: 65,
                    pressure: 1013
                },
                weather: [{
                    description: 'clear sky',
                    main: 'Clear',
                    icon: '01d'
                }]
            }
        ],
        city: {
            name: 'London',
            country: 'GB'
        }
    };

    beforeEach(() => {
        const notificationSpy = jasmine.createSpyObj('NotificationService', ['showNotification']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                WeatherService,
                { provide: NotificationService, useValue: notificationSpy }
            ]
        });

        service = TestBed.inject(WeatherService);
        httpMock = TestBed.inject(HttpTestingController);
        notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with null weather data', () => {
        expect(service.currentWeather()).toBeNull();
        expect(service.forecast()).toBeNull();
        expect(service.loading()).toBe(false);
    });

    it('should fetch weather data for a city', () => {
        service.searchCity('London');

        expect(service.loading()).toBe(true);

        const weatherReq = httpMock.expectOne(req => req.url.includes('/weather?q=London'));
        expect(weatherReq.request.method).toBe('GET');
        weatherReq.flush(mockWeatherData);

        expect(service.currentWeather()).toEqual(mockWeatherData);

        const forecastReq = httpMock.expectOne(req => req.url.includes('/forecast?q=London'));
        forecastReq.flush(mockForecastData);

        expect(service.forecast()).toEqual(mockForecastData);
        expect(service.loading()).toBe(false);
    });

    it('should show error notification when city is not found', () => {
        service.searchCity('InvalidCity');

        const req = httpMock.expectOne(req => req.url.includes('/weather?q=InvalidCity'));
        req.flush('Not found', { status: 404, statusText: 'Not Found' });

        expect(notificationService.showNotification).toHaveBeenCalledWith('City not found. Please try another city.');
        expect(service.loading()).toBe(false);
    });

    it('should show error notification for empty city name', () => {
        service.searchCity('');

        expect(notificationService.showNotification).toHaveBeenCalledWith('Please enter a city name');
        httpMock.expectNone(req => req.url.includes('/weather'));
    });

    it('should use cached data when available and valid', () => {
        service.searchCity('London');

        const weatherReq = httpMock.expectOne(req => req.url.includes('/weather?q=London'));
        weatherReq.flush(mockWeatherData);

        const forecastReq = httpMock.expectOne(req => req.url.includes('/forecast?q=London'));
        forecastReq.flush(mockForecastData);

        service.searchCity('London');

        expect(notificationService.showNotification).toHaveBeenCalledWith('Weather data loaded from cache');
        httpMock.expectNone(req => req.url.includes('/weather?q=London'));
    });

    it('should compute daily forecast from forecast data', () => {
        service.searchCity('London');

        const weatherReq = httpMock.expectOne(req => req.url.includes('/weather'));
        weatherReq.flush(mockWeatherData);

        const forecastReq = httpMock.expectOne(req => req.url.includes('/forecast'));
        forecastReq.flush(mockForecastData);

        const dailyForecast = service.dailyForecast();
        expect(Array.isArray(dailyForecast)).toBe(true);
    });

    it('should return weather icon URL', () => {
        const iconUrl = service.getWeatherIconUrl('01d');
        expect(iconUrl).toBe('https://openweathermap.org/img/wn/01d@2x.png');
    });

    it('should handle API errors gracefully', () => {
        service.searchCity('London');

        const req = httpMock.expectOne(req => req.url.includes('/weather?q=London'));
        req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

        expect(notificationService.showNotification).toHaveBeenCalledWith('Failed to fetch weather data. Please try again.');
        expect(service.loading()).toBe(false);
    });
});

