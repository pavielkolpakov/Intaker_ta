import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeatherSearchComponent } from './weather-search.component';
import { WeatherService } from '../../services/weather.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('WeatherSearchComponent', () => {
    let component: WeatherSearchComponent;
    let fixture: ComponentFixture<WeatherSearchComponent>;
    let weatherService: jasmine.SpyObj<WeatherService>;

    beforeEach(async () => {
        const weatherServiceSpy = jasmine.createSpyObj('WeatherService', ['searchCity'], {
            loading: jasmine.createSpy().and.returnValue(false)
        });

        await TestBed.configureTestingModule({
            imports: [
                WeatherSearchComponent,
                FormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatIconModule,
                BrowserAnimationsModule
            ],
            providers: [
                { provide: WeatherService, useValue: weatherServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(WeatherSearchComponent);
        component = fixture.componentInstance;
        weatherService = TestBed.inject(WeatherService) as jasmine.SpyObj<WeatherService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with empty city name', () => {
        expect(component.cityName()).toBe('');
    });

    it('should call searchCity when onSearch is triggered with valid city', () => {
        component.cityName.set('London');
        component.onSearch();

        expect(weatherService.searchCity).toHaveBeenCalledWith('London');
    });

    it('should not call searchCity when city name is empty', () => {
        component.cityName.set('   ');
        component.onSearch();

        expect(weatherService.searchCity).not.toHaveBeenCalled();
    });

    it('should trim city name before searching', () => {
        component.cityName.set('  London  ');
        component.onSearch();

        expect(weatherService.searchCity).toHaveBeenCalledWith('London');
    });
});

