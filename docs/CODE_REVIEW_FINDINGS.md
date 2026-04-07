# Code Review Findings

เอกสารนี้สรุปจุดที่ควรแก้จากการ review โค้ดโปรเจกต์ `Lab-Score` โดยเน้น bug, ความเสี่ยงเชิงพฤติกรรม, และจุดที่อาจทำให้หน้าเว็บแสดงผลผิดจากที่ผู้ใช้คาดหวัง

## สรุปภาพรวม

- พบ bug หลักที่กระทบการใช้งานจริง 4 จุด
- จุดเสี่ยงสูงสุดอยู่ที่ state ของลีกไม่ sync, การใช้ timezone ไม่สอดคล้องกัน, และการ map สถานะแมตช์ผิด
- บางจุด build อาจยังผ่านได้ แต่พฤติกรรมหน้าเว็บจะผิดตอนใช้งานจริง

<!-- ## 1. State Management / Data Flow

### 1.1 Sidebar เลือกลีก แต่ข้อมูลที่ fetch อาจไม่เปลี่ยนตาม

- ระดับความรุนแรง: High
- ไฟล์ที่เกี่ยวข้อง:
  - [app/pages/index.vue](c:\Users\pawat\Desktop\Lab football\Lab-Score\app\pages\index.vue)
  - [app/composables/useFixtures.ts](c:\Users\pawat\Desktop\Lab football\Lab-Score\app\composables\useFixtures.ts)
  - [app/composables/useLeagueConfig.ts](c:\Users\pawat\Desktop\Lab football\Lab-Score\app\composables\useLeagueConfig.ts)

ปัญหา:

- หน้า `index.vue` เรียก `useLeagueConfig()` เพื่อรับ `selectedLeagues`
- แต่ `useFixtures()` ก็เรียก `useLeagueConfig()` อีกรอบภายในตัวเอง
- ใน `useLeagueConfig()` มีการสร้าง `ref` ใหม่ทุกครั้งที่ถูกเรียก
- ผลคือ state ที่ sidebar แก้ กับ state ที่เอาไปคำนวณ `selectedLeagueIds` สำหรับ fetch อาจเป็นคนละชุดกัน

ผลกระทบ:

- ผู้ใช้ติ๊กเลือก/ยกเลิกลีกใน sidebar แล้วข้อมูลแมตช์อาจยังใช้ค่าดีฟอลต์เดิม
- หน้าเว็บดูเหมือน filter ทำงาน แต่ข้อมูลจริงไม่ตรงกับ UI

แนวทางแก้:

- ทำให้ `useLeagueConfig()` แชร์ state ชุดเดียวกันทั้งหน้า
- หรือส่ง `selectedLeagueIds` จากหน้า `index.vue` เข้า `useFixtures()` แทนการสร้าง state ซ้ำ -->

## 2. Date / Timezone

### 2.1 หน้าแรกใช้ Bangkok date แต่ query ด้วย timezone เป็น UTC

- ระดับความรุนแรง: High
- ไฟล์ที่เกี่ยวข้อง:
  - [app/composables/useFixtures.ts](c:\Users\pawat\Desktop\Lab football\Lab-Score\app\composables\useFixtures.ts)
  - [app/utils/date.ts](c:\Users\pawat\Desktop\Lab football\Lab-Score\app\utils\date.ts)
  - [app/pages/fixture.vue](c:\Users\pawat\Desktop\Lab football\Lab-Score\app\pages\fixture.vue)

ปัญหา:

- หน้าแรกคำนวณวันที่ด้วย `getBangkokCurrentDate()`
- แต่ตอนยิง `/api/fixtures` กลับส่ง `timezone: 'UTC'`
- ขณะที่หน้า `fixture.vue` ส่ง `timezone: 'Asia/Bangkok'`

ผลกระทบ:

- ข้อมูลหน้าแรกกับหน้าตารางแข่งอาจไม่ตรงกันในวันเดียวกัน
- ช่วงหลังเที่ยงคืนถึงเช้าในเวลาไทยอาจดึงแมตช์ผิดวัน
- ผู้ใช้เห็นผลการแข่งขันขาด/เกินจากที่ควรเป็น

แนวทางแก้:

- ใช้ timezone เดียวกันในทุกหน้าที่อิงวันที่ฝั่งผู้ใช้
- ถ้าธุรกิจอิงเวลาไทย ให้ใช้ `Asia/Bangkok` ให้สม่ำเสมอทั้งหน้าแรกและหน้า fixtures

## 3. Match Status / Business Logic

### 3.1 สถานะแมตช์ที่ไม่ใช่ `NS` หรือ `FT` ถูกตีเป็น `LIVE` ทั้งหมด

- ระดับความรุนแรง: Medium
- ไฟล์ที่เกี่ยวข้อง:
  - [app/utils/match.ts](c:\Users\pawat\Desktop\Lab football\Lab-Score\app\utils\match.ts)

ปัญหา:

- ฟังก์ชัน `getMatchStatus()` คืนค่า `LIVE` เป็น default
- ทำให้สถานะอื่นจาก provider เช่น `PST`, `CANC`, `ABD`, `INT` ถูกตีเป็น live ทั้งหมด

ผลกระทบ:

- จำนวน live match อาจเกินจริง
- badge สดอาจขึ้นผิด
- แมตช์ที่เลื่อนหรือยกเลิกอาจถูกเรนเดอร์เหมือนกำลังแข่งอยู่

แนวทางแก้:

- แยก status mapping ให้ชัดเจนตามชุดสถานะของ API provider
- เพิ่มกลุ่มสำหรับ postponed/cancelled/interrupted หรือทำ fallback เป็นสถานะกลางแทน `LIVE`

## 4. API Contract / Error Handling

### 4.1 ฝั่ง client รอ `errors.plan` แต่ฝั่ง server กลืน provider error ไปแล้ว

- ระดับความรุนแรง: Medium
- ไฟล์ที่เกี่ยวข้อง:
  - [server/api/fixtures.get.ts](c:\Users\pawat\Desktop\Lab football\Lab-Score\server\api\fixtures.get.ts)
  - [app/composables/useFixtures.ts](c:\Users\pawat\Desktop\Lab football\Lab-Score\app\composables\useFixtures.ts)
  - [app/pages/fixture.vue](c:\Users\pawat\Desktop\Lab football\Lab-Score\app\pages\fixture.vue)
  - [app/types/fixture.ts](c:\Users\pawat\Desktop\Lab football\Lab-Score\app\types\fixture.ts)

ปัญหา:

- client พยายามอ่าน `data.errors.plan`
- แต่ route `/api/fixtures` ตอน provider error กลับส่งแค่ `results`, `response`, และ `meta`
- ในกรณี throw error ยังเปลี่ยนข้อความเป็น generic `"Internal Server Error"` อีก

ผลกระทบ:

- UI ไม่สามารถแสดงข้อความ plan limit จาก provider ได้
- logic ที่ตั้งใจจะ auto-adjust date จากข้อความ error ใช้งานจริงไม่ได้
- debug ปัญหายากขึ้น เพราะรายละเอียดจาก provider หายไป

แนวทางแก้:

- กำหนด response contract ให้ตรงกันระหว่าง server และ client
- ถ้าต้องใช้ `errors.plan` ฝั่ง server ต้องส่ง `errors` กลับมาด้วย
- ถ้าไม่ต้องใช้แล้ว ให้ลบ logic ฝั่ง client ที่อิง `errors.plan` ออก

## 5. Regression Risk ระหว่างหน้า

### 5.1 หน้าแรกกับหน้า `fixture` มี logic ซ้ำ แต่พฤติกรรมไม่เหมือนกัน

- ระดับความรุนแรง: Medium
- ไฟล์ที่เกี่ยวข้อง:
  - [app/composables/useFixtures.ts](c:\Users\pawat\Desktop\Lab football\Lab-Score\app\composables\useFixtures.ts)
  - [app/pages/index.vue](c:\Users\pawat\Desktop\Lab football\Lab-Score\app\pages\index.vue)
  - [app/pages/fixture.vue](c:\Users\pawat\Desktop\Lab football\Lab-Score\app\pages\fixture.vue)

ปัญหา:

- ทั้งสองหน้าดึง fixtures คล้ายกัน แต่ใช้วิธีคนละแบบ
- หน้าแรกใช้ `useFetch` + debounced query + URL date
- หน้า `fixture` ใช้ `useAsyncData` + local selected date + timezone คนละค่า

ผลกระทบ:

- แก้บั๊กที่หน้าหนึ่งแล้วอีกหน้าอาจยังผิดอยู่
- ผู้ใช้เห็นข้อมูลต่างกันแม้เป็นโดเมนข้อมูลเดียวกัน

แนวทางแก้:

- รวม logic ดึง fixtures ให้ใช้ composable กลางชุดเดียวกัน
- ให้หน้าทั้งสองส่ง input และตีความผลลัพธ์ด้วยกติกาเดียวกัน

## 6. จุดที่ควรตรวจหลังแก้

หลังแก้แล้วควรทดสอบอย่างน้อย:

- เปลี่ยนลีกจาก sidebar บนหน้าแรก แล้วรายการแมตช์ต้องเปลี่ยนตามจริง
- หน้าแรกกับหน้า `fixture` ต้องแสดงข้อมูลวันเดียวกันตรงกัน
- แมตช์ที่เลื่อน/ยกเลิกต้องไม่ถูกนับเป็น live
- กรณี provider ส่ง plan-limit หรือ access-limit ต้องมีข้อความแสดงผลที่ผู้ใช้เข้าใจได้
- กรณีไม่มีแมตช์ ต้องแสดง empty state ที่สอดคล้องกับ filter ปัจจุบัน

## ลำดับแนะนำในการแก้

1. แก้ shared state ของลีกก่อน
2. ทำ timezone ให้ตรงกันทั้งระบบ
3. ปรับ status mapping ของแมตช์
4. ทำ server/client error contract ให้ตรงกัน
5. ค่อย refactor logic fixtures ที่ซ้ำกันระหว่างหน้า

## หมายเหตุ

- finding ชุดนี้เป็นผลจาก code review เชิงพฤติกรรม ไม่ใช่แค่ syntax review
- ต่อให้ `build` ผ่าน บั๊กกลุ่มนี้ก็ยังสามารถเกิดตอนใช้งานจริงได้
