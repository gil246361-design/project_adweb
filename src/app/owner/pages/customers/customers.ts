import { Component, DestroyRef, ElementRef, afterNextRender, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { Customer } from '../../models';
import { CustomersService } from '../../services/customers';
import { createMap, pin, shopPin } from '../../map.util';

@Component({
  selector: 'app-customers',
  imports: [FormsModule],
  templateUrl: './customers.html',
})
export class Customers {
  private api = inject(CustomersService);
  private mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');
  private map?: L.Map;
  private layer = L.layerGroup();
  private picked?: L.Marker;

  readonly customers = signal<Customer[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  // ฟอร์ม
  readonly editingId = signal<number | null>(null);
  readonly name = signal('');
  readonly phone = signal('');
  readonly lat = signal<number | null>(null);
  readonly lng = signal<number | null>(null);

  constructor() {
    afterNextRender(() => {
      this.map = createMap(this.mapEl().nativeElement);
      this.layer.addTo(this.map);
      this.map.on('click', (e: L.LeafletMouseEvent) => this.setPoint(e.latlng.lat, e.latlng.lng));
      this.draw();
    });
    effect(() => { this.customers(); this.draw(); });
    inject(DestroyRef).onDestroy(() => this.map?.remove());
    this.load();
  }

  private async load() {
    this.loading.set(true);
    try { this.customers.set(await this.api.list()); }
    catch { this.error.set('โหลดข้อมูลลูกค้าไม่สำเร็จ (ตรวจสอบ API)'); }
    this.loading.set(false);
  }

  private draw() {
    if (!this.map) return;
    this.layer.clearLayers();
    shopPin().addTo(this.layer);
    for (const c of this.customers()) {
      pin(c.lat, c.lng, '#2563eb', '', 14)
        .bindTooltip(`${c.name} · ${c.phone}`)
        .on('click', () => this.edit(c))
        .addTo(this.layer);
    }
  }

  /** คลิกแผนที่ = ตั้งพิกัดบ้านลูกค้าในฟอร์ม */
  private setPoint(lat: number, lng: number) {
    this.lat.set(+lat.toFixed(6));
    this.lng.set(+lng.toFixed(6));
    this.showPicked();
  }

  private showPicked() {
    this.picked?.remove();
    this.picked = undefined;
    const la = this.lat(), ln = this.lng();
    if (this.map && la !== null && ln !== null) {
      this.picked = pin(la, ln, '#dc2626', '📍', 30).addTo(this.map);
    }
  }

  onCoordChange() { this.showPicked(); }

  edit(c: Customer) {
    this.editingId.set(c.id);
    this.name.set(c.name);
    this.phone.set(c.phone);
    this.lat.set(c.lat);
    this.lng.set(c.lng);
    this.error.set('');
    this.showPicked();
    this.map?.flyTo([c.lat, c.lng], 16);
  }

  reset() {
    this.editingId.set(null);
    this.name.set(''); this.phone.set('');
    this.lat.set(null); this.lng.set(null);
    this.error.set('');
    this.showPicked();
  }

  async save() {
    const name = this.name().trim(), phone = this.phone().trim();
    const lat = this.lat(), lng = this.lng();
    if (!name) return this.error.set('กรอกชื่อลูกค้า');
    if (!/^\d{9,10}$/.test(phone)) return this.error.set('เบอร์โทรต้องเป็นตัวเลข 9–10 หลัก');
    if (lat === null || lng === null || lat < -90 || lat > 90 || lng < -180 || lng > 180)
      return this.error.set('คลิกบนแผนที่หรือกรอกพิกัดบ้านให้ถูกต้อง');

    this.error.set('');
    try {
      const id = this.editingId();
      if (id === null) await this.api.create({ name, phone, lat, lng });
      else await this.api.update(id, { name, phone, lat, lng });
      this.reset();
      await this.load();
    } catch { this.error.set('บันทึกไม่สำเร็จ'); }
  }

  async remove(c: Customer) {
    if (!confirm(`ลบลูกค้า "${c.name}" ? (ออเดอร์ของลูกค้านี้อาจถูกลบด้วย)`)) return;
    try {
      await this.api.remove(c.id);
      if (this.editingId() === c.id) this.reset();
      await this.load();
    } catch { this.error.set('ลบไม่สำเร็จ'); }
  }
}
