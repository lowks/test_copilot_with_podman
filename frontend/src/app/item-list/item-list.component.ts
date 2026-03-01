import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../services/item.service';
import { Item } from '../models/item.model';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="item-list">
      <h2>Items</h2>

      <div *ngIf="loading" class="loading">Loading items...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <form class="create-form" (ngSubmit)="createItem()">
        <input
          [(ngModel)]="newItemName"
          name="newItemName"
          placeholder="Item name"
          required
        />
        <input
          [(ngModel)]="newItemDescription"
          name="newItemDescription"
          placeholder="Description"
        />
        <button type="submit" [disabled]="!newItemName">Add Item</button>
      </form>

      <ul *ngIf="!loading && items.length > 0">
        <li *ngFor="let item of items" class="item-card">
          <span class="item-name">{{ item.name }}</span>
          <span class="item-description">{{ item.description }}</span>
          <button (click)="deleteItem(item.id)" class="delete-btn">Delete</button>
        </li>
      </ul>

      <p *ngIf="!loading && items.length === 0 && !error">No items found.</p>
    </div>
  `,
  styles: [`
    .item-list { padding: 1rem; }
    h2 { margin-bottom: 1rem; }
    .loading { color: #666; font-style: italic; }
    .error { color: #c0392b; margin-bottom: 0.5rem; }
    .create-form { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .create-form input { padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; }
    .create-form button { padding: 0.4rem 0.8rem; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .create-form button:disabled { background: #aaa; cursor: not-allowed; }
    ul { list-style: none; }
    .item-card { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 0.5rem; background: white; }
    .item-name { font-weight: 600; min-width: 120px; }
    .item-description { flex: 1; color: #555; }
    .delete-btn { padding: 0.3rem 0.6rem; background: #e53935; color: white; border: none; border-radius: 4px; cursor: pointer; }
  `]
})
export class ItemListComponent implements OnInit {
  private readonly itemService = inject(ItemService);

  items: Item[] = [];
  loading = false;
  error = '';
  newItemName = '';
  newItemDescription = '';

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.error = '';
    this.itemService.getItems().subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load items.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  createItem(): void {
    if (!this.newItemName) return;
    this.itemService
      .createItem({ name: this.newItemName, description: this.newItemDescription })
      .subscribe({
        next: (item) => {
          this.items = [...this.items, item];
          this.newItemName = '';
          this.newItemDescription = '';
        },
        error: (err) => {
          this.error = 'Failed to create item.';
          console.error(err);
        }
      });
  }

  deleteItem(id: number): void {
    this.itemService.deleteItem(id).subscribe({
      next: () => {
        this.items = this.items.filter((i) => i.id !== id);
      },
      error: (err) => {
        this.error = 'Failed to delete item.';
        console.error(err);
      }
    });
  }
}
