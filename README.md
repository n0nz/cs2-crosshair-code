# CS2 Crosshair Code Decoder

เว็บหน้าเดียวสำหรับถอดรหัส CS2 crosshair share code รุ่น 3/4 เป็นภาพตัวอย่างและคำสั่ง console ที่คั่นด้วย `;` ประมวลผลใน browser ไม่มี server หรือฐานข้อมูล

หน้าเว็บสลับภาษาไทย/อังกฤษได้ และ preview เลือก 16:9 native, 4:3 stretched หรือ 16:10 stretched ได้ โหมด stretched จำลองการยืดแนวนอนจากภาพเกมไปเต็มจอ 16:9 ภาพ preview ขยายเพื่อให้เห็นรายละเอียดชัดขึ้น ไม่ใช่ขนาดจริงแบบพิกเซลต่อพิกเซล

## ใช้งาน

เปิด `public/index.html` ผ่าน static server หรือ deploy ไป Cloudflare Workers Static Assets:

```sh
npx wrangler deploy
```

ใน Cloudflare dashboard ให้ใช้ Workers & Pages → Create → Worker → เชื่อม repository นี้ และตั้ง deploy command เป็น `npx wrangler deploy` (ไม่ต้องมี build command) หรือใช้ CLI ด้านบนหลัง login

ทดสอบตัวถอดรหัสด้วย `npm test` ตัวอย่างเริ่มต้นคือ `CSGO-uQPmY-jAqPO-O4O2C-Gj299-BzuKG`

รหัส v1 ก่อนอัปเดต 22 กันยายน 2026 จะถูกแจ้งว่าเป็นรหัสเก่า ไม่ถูกแปลงเป็นคำสั่งใหม่โดยอัตโนมัติ เพราะหน่วยขนาดเดิมต่างจากหน่วยพิกเซล และต้องเลือกความสูงจอที่ใช้ในเกมเดิมก่อนแปลง ค่าที่แสดงมาจาก share code โดยตรง จึงอาจต่างจากค่าที่เกมแสดงใน console หากผู้เล่นเปลี่ยนค่าหลังสร้าง code

อ้างอิง: [Valve patch notes](https://www.counter-strike.net/news/CS2), [csgo-sharecode source](https://github.com/akiver/csgo-sharecode/blob/main/src/index.ts) (MIT)
