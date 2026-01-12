// utils/date.ts

// แปลง Date Object -> String "YYYY-MM-DD"
export const formatDateToISO = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// พระเอกของเรา: คำนวณ "วันนี้" โดยอิงเวลาไทย + ตัดรอบตี 05:00
export const getBangkokCurrentDate = (cutoffHour = 5): string => {
  const now = new Date();
  
  // 1. แปลงเวลาเครื่องเป็น UTC
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  
  // 2. บวก 7 ชั่วโมงเพื่อเป็นเวลาไทย (Bangkok)
  const bangkokTime = new Date(utc + (3600000 * 7));
  
  // 3. Logic ตัดวัน: ถ้าเวลายังไม่ถึง 05:00 น. ให้ถือว่าเป็น "เมื่อวาน"
  if (bangkokTime.getHours() < cutoffHour) {
    bangkokTime.setDate(bangkokTime.getDate() - 1);
  }
  
  return formatDateToISO(bangkokTime);
};

// ฟังก์ชันบวก/ลบวัน
export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateToISO(date);
};