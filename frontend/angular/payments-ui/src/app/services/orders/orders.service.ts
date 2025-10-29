// src/app/services/orders/orders.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  id: string;
  description: string;
  amount: string;
  status: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api/orders';

  constructor(private http: HttpClient) {}

  /** 🔹 Listado paginado de órdenes */
  getOrders(page: number, pageSize: number): Observable<{
    success: boolean;
    message: string;
    data: {
      results: Order[];
      page: number;
      page_size: number;
      total_pages: number;
      total_items: number;
    };
  }> {
    return this.http.get<{
      success: boolean;
      message: string;
      data: {
        results: Order[];
        page: number;
        page_size: number;
        total_pages: number;
        total_items: number;
      };
    }>(`${this.baseUrl}?page=${page}&page_size=${pageSize}`);
  }

  /** 🔹 Obtener una orden por su ID (detalle) */
  getOrderById(id: string): Observable<{
    success: boolean;
    message: string;
    data: Order;
  }> {
    return this.http.get<{
      success: boolean;
      message: string;
      data: Order;
    }>(`${this.baseUrl}/${id}`);
  }
}
