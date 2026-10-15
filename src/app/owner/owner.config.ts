// ตั้งค่าฝั่งเจ้าของร้าน
// TODO: ถ้าทีมมี config/api.ts กลางแล้ว ให้ย้ายสองค่านี้ไปใช้ไฟล์นั้นแทน
export const API_ENDPOINT = 'http://localhost:3000'; // ใส่ Base URL ของ API ที่ deploy แล้ว
export const USE_MOCK = true; // true = ข้อมูลจำลอง, false = เรียก API จริง

// พิกัดร้าน (แถว ม.มหาสารคาม) ใช้ค่าเดียวกับฝั่งไรเดอร์
export const SHOP = { lat: 16.2465, lng: 103.2535 };

// กติกาธุรกิจตาม Project.pdf (ยังรอตกลงกับอาจารย์ว่ายึดฉบับไหน)
export const RULES = {
  maxOrdersPerRider: 3,
  pricePerBox: 65,
  costPerBox: 40,
  riderFeePerTrip: 15,
  feePerKmPerBox: 2,
  speedKmh: 30,
  deadlineMin: 60, // ออก 11:30 ต้องถึงก่อน 12:30
  departHour: 11,
  departMin: 30,
};
