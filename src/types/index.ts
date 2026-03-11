export interface ResultHistory {
  status: string;
  timestamp: string;
  user: string;
  feedback?: string;
  score?: number | null;
  result_percentage?: number | string | null;
  note?: string;
}

export interface AreaResult {
  area_name: string;
  target: number | string | null;
  result_count: number | null;
  result_percentage: number | string | null;
  score: number | null;
  weighted_score?: number | null;
  status: 'ผ่าน' | 'ไม่ผ่าน' | 'รอประเมิน' | 'รอยืนยัน' | 'แก้ไข';
  feedback?: string;
  history?: ResultHistory[];
  note?: string;
  data_as_of?: string;
  rejection_time?: string;
  rejection_deadline?: string;
  ppho_work_group?: string;
}

export interface Indicator {
  id: string;
  order: number | string;
  name: string;
  target_criteria: string;
  weight: number;
  score_criteria: {
    "1": string | number;
    "2": string | number;
    "3": string | number;
    "4": string | number;
    "5": string | number;
  };
  max_score: number;
  results: Record<string, Record<string, AreaResult>>; // { timeframe: { area: AreaResult } }
  responsible_group: string;
  responsible_groups?: string[]; // Array of group names
  fiscal_year: string;
  data_source?: string; // Link to data source
  excellence_category?: string; // 4+1 Excellence Category
  targets?: {
    "6_months"?: string;
    "9_months"?: string;
    "12_months"?: string;
  };
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'user' | 'กลุ่มงาน สสจ.' | 'ผู้บริหาร';
  unit: string;
}

export interface WorkGroup {
  id?: string;
  name: string;
  color: string;
}

export const AREAS = [
  'จังหวัด',
  'คปสอ.เมืองสตูล',
  'คปสอ.ละงู',
  'คปสอ.ควนกาหลง',
  'คปสอ.ทุ่งหว้า',
  'คปสอ.ควนโดน',
  'คปสอ.ท่าแพ',
  'คปสอ.มะนัง'
];

export const TIMEFRAMES = [
  'ภาพรวม (สะสม)',
  'รอบ 6 เดือน (ต.ค.-มี.ค.)',
  'รอบ 9 เดือน (เม.ย.-มิ.ย.)',
  'รอบ 12 เดือน (ก.ค.-ก.ย.)',
  'ไตรมาส 1 (ต.ค.-ธ.ค.)',
  'ไตรมาส 2 (ม.ค.-มี.ค.)',
  'ไตรมาส 3 (เม.ย.-มิ.ย.)',
  'ไตรมาส 4 (ก.ค.-ก.ย.)',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน'
];
