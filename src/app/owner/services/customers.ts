import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { API_ENDPOINT, USE_MOCK } from '../owner.config';
import { ApiRes, Customer, CustomerBody } from '../models';
import { mockDb } from './mock-db';

// endpoint (เดาตามรูปแบบทั่วไป — เทียบกับ Backend.pdf อีกครั้ง):
//   GET /api/customers · POST /api/customers · PUT /api/customers/:id · DELETE /api/customers/:id
@Injectable({ providedIn: 'root' })
export class CustomersService {
  private http = inject(HttpClient);
  private url = `${API_ENDPOINT}/api/customers`;

  async list(): Promise<Customer[]> {
    if (USE_MOCK) return mockDb.listCustomers();
    return (await lastValueFrom(this.http.get<ApiRes<Customer[]>>(this.url))).data;
  }
  async create(body: CustomerBody): Promise<Customer> {
    if (USE_MOCK) return mockDb.createCustomer(body);
    return (await lastValueFrom(this.http.post<ApiRes<Customer>>(this.url, body))).data;
  }
  async update(id: number, body: CustomerBody): Promise<Customer> {
    if (USE_MOCK) return mockDb.updateCustomer(id, body);
    return (await lastValueFrom(this.http.put<ApiRes<Customer>>(`${this.url}/${id}`, body))).data;
  }
  async remove(id: number): Promise<void> {
    if (USE_MOCK) return mockDb.removeCustomer(id);
    await lastValueFrom(this.http.delete<ApiRes<unknown>>(`${this.url}/${id}`));
  }
}
