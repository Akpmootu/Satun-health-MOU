import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------------
// 🛠️ คำแนะนำการตั้งค่า Supabase (Supabase Setup Instructions)
// ----------------------------------------------------------------------
// 1. ไปที่ https://supabase.com/ และสร้างโปรเจกต์ใหม่
// 2. ไปที่ Project Settings -> API
// 3. คัดลอก Project URL และ Project API keys (anon/public)
// 4. สร้างไฟล์ .env.local ในโฟลเดอร์ root ของโปรเจกต์ (ระดับเดียวกับ package.json)
// 5. เพิ่มตัวแปรสภาพแวดล้อมดังนี้:
//    VITE_SUPABASE_URL=your-project-url
//    VITE_SUPABASE_ANON_KEY=your-anon-key
// 6. สร้าง Table ชื่อ 'indicators' ใน Supabase SQL Editor:
/*
  CREATE TABLE indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_num TEXT,
    name TEXT,
    target_criteria TEXT,
    weight NUMERIC,
    score_criteria JSONB,
    max_score NUMERIC,
    results JSONB,
    responsible_group TEXT,
    fiscal_year TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
  );
*/
// ----------------------------------------------------------------------

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
