import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { API_ENDPOINT, USE_MOCK } from '../owner.config';
import { ApiRes, Order, OrderBody } from '../models';
import { mockDb } from './mock-db';

// endpoint: GET /api/orders · POST /api/orders · PUT /api/orders/:id · DELETE /api/orders/:id
@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);
  private url = `${API_ENDPOINT}/api/orders`;

  async list(): Promise<Order[]> {
    if (USE_MOCK) return mockDb.listOrders();
    return (await lastValueFrom(this.http.get<ApiRes<Order[]>>(this.url))).data;
  }
  async create(body: OrderBody): Promise<Order> {
    if (USE_MOCK) return mockDb.createOrder(body);
    return (await lastValueFrom(this.http.post<ApiRes<Order>>(this.url, body))).data;
  }
  async update(id: number, body: OrderBody): Promise<Order> {
    if (USE_MOCK) return mockDb.updateOrder(id, body);
    return (await lastValueFrom(this.http.put<ApiRes<Order>>(`${this.url}/${id}`, body))).data;
  }
  async remove(id: number): Promise<void> {
    if (USE_MOCK) return mockDb.removeOrder(id);
    await lastValueFrom(this.http.delete<ApiRes<unknown>>(`${this.url}/${id}`));
  }
}
