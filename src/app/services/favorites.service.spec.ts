import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
    let service: FavoritesService;
    let httpMock: HttpTestingController;
    let localStorageSpy: jasmine.SpyObj<Storage>;

    beforeEach(() => {
        const localStorageMock = {
            getItem: jasmine.createSpy('getItem').and.returnValue(null),
            setItem: jasmine.createSpy('setItem'),
            removeItem: jasmine.createSpy('removeItem'),
            clear: jasmine.createSpy('clear')
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [FavoritesService]
        });

        service = TestBed.inject(FavoritesService);
        httpMock = TestBed.inject(HttpTestingController);

        spyOn(localStorage, 'getItem').and.returnValue(null);
        spyOn(localStorage, 'setItem');
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with empty favorites', () => {
        expect(service.favorites().length).toBe(0);
        expect(service.favoritesWithWeather().length).toBe(0);
    });

    it('should add a favorite city', () => {
        service.addFavorite('London', 'GB');

        expect(service.favorites().length).toBe(1);
        expect(service.favorites()[0].name).toBe('London');
        expect(service.favorites()[0].country).toBe('GB');
        expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should not add duplicate favorites', () => {
        service.addFavorite('London', 'GB');
        service.addFavorite('London', 'GB');

        expect(service.favorites().length).toBe(1);
    });

    it('should remove a favorite city', () => {
        service.addFavorite('London', 'GB');
        service.addFavorite('Paris', 'FR');

        expect(service.favorites().length).toBe(2);

        service.removeFavorite('London', 'GB');

        expect(service.favorites().length).toBe(1);
        expect(service.favorites()[0].name).toBe('Paris');
    });

    it('should check if city is favorite', () => {
        service.addFavorite('London', 'GB');

        expect(service.isFavorite('London', 'GB')).toBe(true);
        expect(service.isFavorite('Paris', 'FR')).toBe(false);
    });

    it('should be case insensitive when checking favorites', () => {
        service.addFavorite('London', 'GB');

        expect(service.isFavorite('london', 'GB')).toBe(true);
        expect(service.isFavorite('LONDON', 'GB')).toBe(true);
    });

    it('should load favorites from localStorage on init', () => {
        const storedFavorites = JSON.stringify([
            { name: 'London', country: 'GB' },
            { name: 'Paris', country: 'FR' }
        ]);

        (localStorage.getItem as jasmine.Spy).and.returnValue(storedFavorites);

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [FavoritesService]
        });

        const newService = TestBed.inject(FavoritesService);

        expect(newService.favorites().length).toBe(2);
    });

    it('should handle localStorage errors gracefully', () => {
        spyOn(console, 'error');
        (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [FavoritesService]
        });

        expect(() => {
            TestBed.inject(FavoritesService);
        }).not.toThrow();

        expect(console.error).toHaveBeenCalled();
    });
});

