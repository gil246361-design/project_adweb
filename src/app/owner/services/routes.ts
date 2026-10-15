import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { API_ENDPOINT, USE_MOCK } from '../owner.config';
import { ApiRes, RoutePlan } from '../models';
import { mockDb } from './mock-db';
import { buildMockPlan } from './mock-routing';

// endpoint จัดเส้นทาง (ชื่อและรูปแบบยังเป็นข้อเสนอ — ตกลงกับคนทำ API):
//   POST /api/routes/plan  body: { attempt: number }  →  { success, message, data: RoutePlan }
// attempt = ครั้งที่คำนวณ ใช้ให้ฝั่ง API เสนอเส้นทางที่ต่างจากครั้งก่อนเมื่อกด "คำนวณใหม่"
@Injectable({ providedIn: 'root' })
export class RoutesService {
  private http = inject(HttpClient);
  private attempt = 0;

  async plan(fresh: boolean): Promise<RoutePlan> {
    this.attempt = fresh ? 1 : this.attempt + 1;
    if (USE_MOCK) {
      const items = mockDb.snapshotForRouting();
      if (!items.length) throw new Error('ยังไม่มีออเดอร์ให้จัดเส้นทาง');
      await new Promise((r) => setTimeout(r, 400));
      return buildMockPlan(items, this.attempt);
    }
    const res = await lastValueFrom(
      this.http.post<ApiRes<RoutePlan>>(`${API_ENDPOINT}/api/routes/plan`, { attempt: this.attempt }),
    );
    return res.data;
  }
}
