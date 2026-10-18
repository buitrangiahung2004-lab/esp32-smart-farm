const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Kết nối Supabase sử dụng biến môi trường trên Render hoặc giá trị mặc định khi chạy local
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://syyjhbpsnlsjclnysumo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eWpoYnBzbmxzamNsbnlzdW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjMzNTk2NCwiZXhwIjoyMTA3OTExOTY0fQ.BkMj3niCyBmcXJD7dAI2BSfuDakRi0TUSgUcH9ePueo';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Hàm lấy trạng thái từ bảng device_state trên Supabase
async function getFarmStateFromDB() {
  const { data, error } = await supabase.from('device_state').select('*').eq('id', 1).single();
  if (error || !data) {
    return {
      temp: 32.0,
      humidity: 65.0,
      soil: 55,
      setpoint: 32.0,
      soilThreshold: 40,
      heaterON: true,
      heaterPowerPct: 0,
      pumpON: false,
      pumpAuto: true,
      kp: 60.0,
      ki: 1.20,
      kd: 3500,
      autoTuning: false,
      lastEspSeen: 0
    };
  }
  return {
    temp: data.temp,
    humidity: data.humidity,
    soil: data.soil,
    setpoint: data.setpoint,
    soilThreshold: data.soil_threshold,
    heaterON: data.heater_on,
    heaterPowerPct: data.heater_power_pct,
    pumpON: data.pump_on,
    pumpAuto: data.pump_auto,
    kp: data.kp,
    ki: data.ki,
    kd: data.kd,
    autoTuning: data.auto_tuning || false,
    lastEspSeen: new Date(data.updated_at).getTime() || 0
  };
}

// API cho Web đọc thông số cảm biến từ Supabase
app.get('/api/sensors', async (req, res) => {
  const farmState = await getFarmStateFromDB();
  const isOnline = (Date.now() - farmState.lastEspSeen) < 15000;
  res.json({ ...farmState, espOnline: isOnline });
});

// API cho Web gửi lệnh điều khiển (Cập nhật trực tiếp lên Supabase)
app.get('/api/control', async (req, res) => {
  const q = req.query;
  let updateData = {};

  if (q.setpoint !== undefined) updateData.setpoint = parseFloat(q.setpoint);
  if (q.soilThreshold !== undefined) updateData.soil_threshold = parseInt(q.soilThreshold);
  if (q.kp !== undefined) updateData.kp = parseFloat(q.kp);
  if (q.ki !== undefined) updateData.ki = parseFloat(q.ki);
  if (q.kd !== undefined) updateData.kd = parseFloat(q.kd);
  if (q.pumpAuto !== undefined) updateData.pump_auto = (q.pumpAuto == '1' || q.pumpAuto === 'true');
  if (q.pump !== undefined) {
    updateData.pump_auto = false;
    updateData.pump_on = (q.pump == '1' || q.pump === 'true');
  }
  if (q.heater !== undefined) updateData.heater_on = (q.heater == '1' || q.heater === 'true');
  if (q.autotune !== undefined) updateData.auto_tuning = true;

  updateData.updated_at = new Date();

  await supabase.from('device_state').update(updateData).eq('id', 1);
  const farmState = await getFarmStateFromDB();

  res.json({ ok: true, state: farmState });
});

// API dành riêng cho ESP32 đồng bộ dữ liệu qua Cloud
app.post('/api/esp-sync', async (req, res) => {
  const b = req.body;
  let updateData = { updated_at: new Date() };

  if (b.temp !== undefined) updateData.temp = Number(b.temp);
  if (b.humidity !== undefined) updateData.humidity = Number(b.humidity);
  if (b.soil !== undefined) updateData.soil = Number(b.soil);
  if (b.heaterPowerPct !== undefined) updateData.heater_power_pct = Number(b.heaterPowerPct);
  if (b.pumpON !== undefined) updateData.pump_on = Boolean(b.pumpON);
  if (b.autoTuning !== undefined) updateData.auto_tuning = Boolean(b.autoTuning);

  await supabase.from('device_state').update(updateData).eq('id', 1);
  const farmState = await getFarmStateFromDB();

  res.json({
    ok: true,
    target: {
      setpoint: farmState.setpoint,
      soilThreshold: farmState.soilThreshold,
      pumpAuto: farmState.pumpAuto,
      pumpON: farmState.pumpON,
      heaterON: farmState.heaterON,
      kp: farmState.kp,
      ki: farmState.ki,
      kd: farmState.kd
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`IoTFarm Cloud Server dang chay tai cong ${PORT}`);
});
