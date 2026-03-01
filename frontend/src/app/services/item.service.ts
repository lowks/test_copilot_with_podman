import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Item, ApiResponse } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/items`;

  getItems(): Observable<Item[]> {
    return this.http
      .get<ApiResponse<Item[]>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  getItem(id: number): Observable<Item> {
    return this.http
      .get<ApiResponse<Item>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  createItem(item: Omit<Item, 'id'>): Observable<Item> {
    return this.http
      .post<ApiResponse<Item>>(this.baseUrl, item)
      .pipe(map((res) => res.data));
  }

  updateItem(id: number, item: Omit<Item, 'id'>): Observable<Item> {
    return this.http
      .put<ApiResponse<Item>>(`${this.baseUrl}/${id}`, item)
      .pipe(map((res) => res.data));
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(map(() => void 0));
  }
}
