export interface ResultHistory {
  status: string;
  timestamp: string;
  user: string;
  feedback?: string;
  score?: number | null;
  result_percentage?: number | string | null;
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
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user' | 'กลุ่มงาน สสจ.';
  unit: string;
  assigned_indicators?: string[]; // Array of indicator IDs
}

export const RESPONSIBLE_GROUPS = [
  { name: 'บริหารทั่วไป', color: 'bg-gray-500 text-white' },
  { name: 'พัฒนายุทธศาสตร์สาธารณสุข', color: 'bg-blue-500 text-white' },
  { name: 'ประกันสุขภาพ', color: 'bg-green-500 text-white' },
  { name: 'สุขภาพดิจิทัล', color: 'bg-indigo-500 text-white' },
  { name: 'นิติการ', color: 'bg-slate-700 text-white' },
  { name: 'ส่งเสริมสุขภาพ', color: 'bg-pink-500 text-white' },
  { name: 'ควบคุมโรคติดต่อ', color: 'bg-orange-500 text-white' },
  { name: 'ควบคุมโรคไม่ติดต่อ สุขภาพจิตและยาเสพติด', color: 'bg-red-500 text-white' },
  { name: 'พัฒนารูปแบบบริการและคุณภาพ', color: 'bg-teal-500 text-white' },
  { name: 'ปฐมภูมิและเครือข่ายสุขภาพ', color: 'bg-cyan-500 text-white' },
  { name: 'ทันตสาธารณสุข', color: 'bg-purple-500 text-white' },
  { name: 'อนามัยสิ่งแวดล้อมและอาชีวอนามัย', color: 'bg-lime-500 text-white' },
  { name: 'แพทย์แผนไทยและการแพทย์ทางเลือก', color: 'bg-emerald-500 text-white' },
  { name: 'คุ้มครองผู้บริโภคและเภสัชสาธารณสุข', color: 'bg-rose-500 text-white' }
];

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
