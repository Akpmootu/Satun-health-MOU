import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------------
// 🛠️ คำแนะนำการตั้งค่า Supabase (Full Production Setup)
// ----------------------------------------------------------------------
// 1. ไปที่ https://supabase.com/ และสร้างโปรเจกต์ใหม่
// 2. ไปที่ Project Settings -> API เพื่อคัดลอก URL และ Anon Key
// 3. รันคำสั่ง SQL ด้านล่างนี้ใน SQL Editor ของ Supabase:

/*
  -- 1. ตารางตัวชี้วัด (Indicators)
  CREATE TABLE indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_num TEXT,
    name TEXT,
    target_criteria TEXT,
    weight NUMERIC,
    score_criteria JSONB,
    max_score NUMERIC DEFAULT 5,
    results JSONB DEFAULT '{}'::jsonb,
    responsible_group TEXT,
    fiscal_year TEXT,
    excellence_category TEXT,
    data_source TEXT,
    is_active BOOLEAN DEFAULT true,
    targets JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 2. ตารางผู้ใช้งาน (Users) - แนะนำให้ใช้ Supabase Auth ในอนาคต
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL, -- 'admin', 'user', 'กลุ่มงาน สสจ.', 'ผู้บริหาร'
    unit TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 3. ตารางกลุ่มงาน (Work Groups)
  CREATE TABLE work_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    color TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 4. ตารางข่าวสาร (News)
  CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    body TEXT,
    is_active BOOLEAN DEFAULT true,
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 5. ตารางตั้งค่าระบบ (System Settings)
  CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 6. ตารางแดชบอร์ดส่วนตัว (User Dashboards)
  CREATE TABLE user_dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    widgets JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- ---------------------------------------------------------
  -- 🛡️ การตั้งค่าความปลอดภัย (RLS Policies)
  -- ---------------------------------------------------------
  -- เปิดใช้งาน RLS ทุกตาราง
  ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE work_groups ENABLE ROW LEVEL SECURITY;
  ALTER TABLE news ENABLE ROW LEVEL SECURITY;
  ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_dashboards ENABLE ROW LEVEL SECURITY;

  -- ตัวอย่างนโยบาย (ปรับแต่งตามความต้องการ)
  CREATE POLICY "Allow public read" ON indicators FOR SELECT USING (true);
  CREATE POLICY "Allow public read" ON news FOR SELECT USING (is_active = true);
  CREATE POLICY "Allow public read" ON work_groups FOR SELECT USING (true);
  CREATE POLICY "Allow public read" ON system_settings FOR SELECT USING (true);
  
  -- หมายเหตุ: สำหรับการเขียนข้อมูล (INSERT/UPDATE/DELETE) 
  -- ควรสร้างนโยบายที่ตรวจสอบ Role ของผู้ใช้งาน
*/
// ----------------------------------------------------------------------

const supabaseUrl = 'https://huaqbvyobtvwtctekpua.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YXFidnlvYnR2d3RjdGVrcHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODM3MTQsImV4cCI6MjA4ODE1OTcxNH0.6TLbymrCItp5pbA--HzxHLI9AjYmqePnMpLkvTHcEvs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
