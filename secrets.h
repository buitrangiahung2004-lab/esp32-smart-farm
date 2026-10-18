// Đổi tên file này thành secrets.h (cùng thư mục với esp32_smartfarm.ino) rồi điền thông tin thật.
// KHÔNG chia sẻ / đưa secrets.h lên GitHub (thêm "secrets.h" vào .gitignore).
#pragma once

#define WIFI_SSID      "74/5A9"
#define WIFI_PASSWORD  "38383838@"

// Link Firebase Realtime Database nếu dùng 4G (để "" nếu chỉ dùng Wi-Fi nội bộ)
#define FIREBASE_URL   ""

// Lấy endpoint MCP mới trong trang quản lý agent của xiaozhi.me
#define MCP_ENDPOINT   "wss://api.xiaozhi.me/mcp/?token=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5MjE4NSwiYWdlbnRJZCI6MjQyMzcyNCwiZW5kcG9pbnRJZCI6ImFnZW50XzI0MjM3MjQiLCJwdXJwb3NlIjoibWNwLWVuZHBvaW50IiwiaWF0IjoxNzkwNTI2NzM0LCJleHAiOjE4MjIwODQzMzR9.JEjRLIISS3uLvRGbo3VvPLf20FTosQOpygNwfrOUPDaP7xQM1oJ6OYoJBB0JHo5em7VoTmY4nuEiY6lbrGA91w"
