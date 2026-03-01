import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ItemListComponent } from './item-list.component';
import { ItemService } from '../services/item.service';
import { Item } from '../models/item.model';

describe('ItemListComponent', () => {
  let component: ItemListComponent;
  let fixture: ComponentFixture<ItemListComponent>;
  let itemServiceSpy: jasmine.SpyObj<ItemService>;

  const mockItems: Item[] = [
    { id: 1, name: 'Item One', description: 'First item' },
    { id: 2, name: 'Item Two', description: 'Second item' }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ItemService', [
      'getItems',
      'createItem',
      'deleteItem'
    ]);
    spy.getItems.and.returnValue(of(mockItems));

    await TestBed.configureTestingModule({
      imports: [ItemListComponent],
      providers: [{ provide: ItemService, useValue: spy }]
    }).compileComponents();

    itemServiceSpy = TestBed.inject(ItemService) as jasmine.SpyObj<ItemService>;
    fixture = TestBed.createComponent(ItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load items on init', () => {
    expect(itemServiceSpy.getItems).toHaveBeenCalled();
    expect(component.items).toEqual(mockItems);
    expect(component.loading).toBeFalse();
  });

  it('should render item names in the list', () => {
    const listItems = fixture.nativeElement.querySelectorAll('.item-name');
    expect(listItems.length).toBe(2);
    expect(listItems[0].textContent).toContain('Item One');
    expect(listItems[1].textContent).toContain('Item Two');
  });

  it('should show error message when getItems fails', () => {
    itemServiceSpy.getItems.and.returnValue(throwError(() => new Error('Network error')));
    component.loadItems();
    fixture.detectChanges();
    expect(component.error).toBe('Failed to load items.');
    const errorEl = fixture.nativeElement.querySelector('.error');
    expect(errorEl?.textContent).toContain('Failed to load items.');
  });

  it('should create an item and add it to the list', () => {
    const newItem: Item = { id: 3, name: 'New Item', description: 'A new item' };
    itemServiceSpy.createItem = jasmine.createSpy().and.returnValue(of(newItem));

    component.newItemName = 'New Item';
    component.newItemDescription = 'A new item';
    component.createItem();

    expect(itemServiceSpy.createItem).toHaveBeenCalledWith({
      name: 'New Item',
      description: 'A new item'
    });
    expect(component.items.length).toBe(3);
    expect(component.items[2]).toEqual(newItem);
    expect(component.newItemName).toBe('');
    expect(component.newItemDescription).toBe('');
  });

  it('should not call createItem when name is empty', () => {
    itemServiceSpy.createItem = jasmine.createSpy();
    component.newItemName = '';
    component.createItem();
    expect(itemServiceSpy.createItem).not.toHaveBeenCalled();
  });

  it('should show error when createItem fails', () => {
    itemServiceSpy.createItem = jasmine.createSpy().and.returnValue(
      throwError(() => new Error('Server error'))
    );
    component.newItemName = 'Test';
    component.createItem();
    expect(component.error).toBe('Failed to create item.');
  });

  it('should delete an item and remove it from the list', () => {
    itemServiceSpy.deleteItem = jasmine.createSpy().and.returnValue(of(undefined));
    component.deleteItem(1);
    expect(itemServiceSpy.deleteItem).toHaveBeenCalledWith(1);
    expect(component.items.length).toBe(1);
    expect(component.items[0].id).toBe(2);
  });

  it('should show error when deleteItem fails', () => {
    itemServiceSpy.deleteItem = jasmine.createSpy().and.returnValue(
      throwError(() => new Error('Delete failed'))
    );
    component.deleteItem(1);
    expect(component.error).toBe('Failed to delete item.');
  });
});
