export interface AreaResult {
  area_name: string;
  target: number | null;
  result_count: number | null;
  result_percentage: number | null;
  score: number | null;
  status: 'ผ่าน' | 'ไม่ผ่าน' | 'รอประเมิน';
}

export interface Indicator {
  id: string;
  order: number | string;
  name: string;
  target_criteria: string;
  weight: number;
  score_criteria: {
    1: string | number;
    2: string | number;
    3: string | number;
    4: string | number;
    5: string | number;
  };
  max_score: number;
  results: Record<string, Record<string, AreaResult>>; // { timeframe: { area: AreaResult } }
  responsible_group: string;
  fiscal_year: string;
}

export const AREAS = [
  'ระดับจังหวัด',
  'คปสอ.เมือง',
  'คปสอ.ควนโดน',
  'คปสอ.ท่าแพ',
  'คปสอ.ควนกาหลง',
  'คปสอ.ละงู',
  'คปสอ.ทุ่งหว้า',
  'คปสอ.มะนัง',
];

export const TIMEFRAMES = [
  'ภาพรวม (สะสม)',
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
