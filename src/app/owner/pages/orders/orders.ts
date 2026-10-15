import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Customer, Order } from '../../models';
import { CustomersService } from '../../services/customers';
import { OrdersService } from '../../services/orders';
import { RULES } from '../../owner.config';

@Component({
  selector: 'app-orders',
  imports: [FormsModule, RouterLink],
  templateUrl: './orders.html',
})
export class Orders {
  private ordersApi = inject(OrdersService);
  private customersApi = inject(CustomersService);

  readonly orders = signal<Order[]>([]);
  readonly customers = signal<Customer[]>([]);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');

  readonly editingId = signal<number | null>(null);
  readonly customerId = signal<number | null>(null);
  readonly boxes = signal(1);
  readonly simCount = signal(25);

  readonly totalBoxes = computed(() => this.orders().reduce((a, o) => a + o.boxes, 0));
  readonly boxOptions = [1, 2, 3];

  constructor() { this.load(); }

  async load() {
    this.loading.set(true);
    try {
      const [o, c] = await Promise.all([this.ordersApi.list(), this.customersApi.list()]);
      this.orders.set(o);
      this.customers.set(c);
    } catch { this.error.set('โหลดข้อมูลไม่สำเร็จ (ตรวจสอบ API)'); }
    this.loading.set(false);
  }

  edit(o: Order) {
    this.editingId.set(o.id);
    this.customerId.set(o.customer_id);
    this.boxes.set(o.boxes);
    this.error.set('');
  }

  reset() { this.editingId.set(null); this.customerId.set(null); this.boxes.set(1); this.error.set(''); }

  async save() {
    const cid = this.customerId();
    if (cid === null) return this.error.set('เลือกลูกค้าก่อน');
    const body = { customer_id: Number(cid), boxes: Number(this.boxes()) };
    this.error.set('');
    try {
      const id = this.editingId();
      if (id === null) await this.ordersApi.create(body);
      else await this.ordersApi.update(id, body);
      this.reset();
      await this.load();
    } catch { this.error.set('บันทึกไม่สำเร็จ'); }
  }

  async remove(o: Order) {
    try { await this.ordersApi.remove(o.id); if (this.editingId() === o.id) this.reset(); await this.load(); }
    catch { this.error.set('ลบไม่สำเร็จ'); }
  }

  /** ล้างออเดอร์เดิมแล้วสุ่มออเดอร์ใหม่ (ลูกค้าละ 1 ออเดอร์ 1–3 กล่อง) */
  async simulate() {
    const n = Math.max(1, Math.min(Number(this.simCount()) || 0, this.customers().length));
    if (this.orders().length && !confirm(`ออเดอร์เดิม ${this.orders().length} รายการจะถูกลบแล้วสร้างใหม่ ${n} รายการ ดำเนินการต่อ?`)) return;
    this.busy.set(true);
    this.error.set('');
    try {
      for (const o of this.orders()) await this.ordersApi.remove(o.id);
      const pool = [...this.customers()].sort(() => Math.random() - 0.5).slice(0, n);
      for (const c of pool) {
        await this.ordersApi.create({ customer_id: c.id, boxes: 1 + Math.floor(Math.random() * RULES.maxOrdersPerRider) });
      }
      this.reset();
      await this.load();
    } catch { this.error.set('จำลองออเดอร์ไม่สำเร็จ'); }
    this.busy.set(false);
  }

  async clearAll() {
    if (!confirm('ลบออเดอร์ทั้งหมด?')) return;
    this.busy.set(true);
    try { for (const o of this.orders()) await this.ordersApi.remove(o.id); await this.load(); }
    catch { this.error.set('ลบไม่สำเร็จ'); }
    this.busy.set(false);
  }
}
