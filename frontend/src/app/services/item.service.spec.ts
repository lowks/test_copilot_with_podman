import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ItemService } from './item.service';
import { Item } from '../models/item.model';
import { environment } from '../../environments/environment';

describe('ItemService', () => {
  let service: ItemService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/items`;

  const mockItems: Item[] = [
    { id: 1, name: 'Item One', description: 'First item' },
    { id: 2, name: 'Item Two', description: 'Second item' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ItemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getItems()', () => {
    it('should return an array of items', () => {
      service.getItems().subscribe((items) => {
        expect(items).toEqual(mockItems);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockItems });
    });
  });

  describe('getItem()', () => {
    it('should return a single item by id', () => {
      service.getItem(1).subscribe((item) => {
        expect(item).toEqual(mockItems[0]);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockItems[0] });
    });
  });

  describe('createItem()', () => {
    it('should POST and return the created item', () => {
      const newItem = { name: 'New Item', description: 'A new item' };
      const createdItem: Item = { id: 3, ...newItem };

      service.createItem(newItem).subscribe((item) => {
        expect(item).toEqual(createdItem);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newItem);
      req.flush({ data: createdItem });
    });
  });

  describe('updateItem()', () => {
    it('should PUT and return the updated item', () => {
      const updatedData = { name: 'Updated Item', description: 'Updated description' };
      const updatedItem: Item = { id: 1, ...updatedData };

      service.updateItem(1, updatedData).subscribe((item) => {
        expect(item).toEqual(updatedItem);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedData);
      req.flush({ data: updatedItem });
    });
  });

  describe('deleteItem()', () => {
    it('should DELETE the item', () => {
      service.deleteItem(1).subscribe((result) => {
        expect(result).toBeUndefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
