import { Indicator } from '../types';

export const MOCK_DATA: Indicator[] = [
  {
    id: '1',
    order: 1,
    name: 'ร้อยละหญิงตั้งครรภ์ได้รับการฝากครรภ์ครั้งแรกก่อนหรือเท่ากับ 12 สัปดาห์',
    target_criteria: 'ร้อยละ 75',
    weight: 0.5,
    score_criteria: { 1: 65, 2: 70, 3: 75, 4: 80, 5: 85 },
    max_score: 2.5,
    results: {
      'ภาพรวม (สะสม)': {
        'ระดับจังหวัด': { area_name: 'ระดับจังหวัด', target: 100, result_count: 83, result_percentage: 83, score: 5, status: 'ผ่าน' },
        'คปสอ.เมือง': { area_name: 'คปสอ.เมือง', target: 20, result_count: 15, result_percentage: 75, score: 3, status: 'ผ่าน' },
        'คปสอ.ควนโดน': { area_name: 'คปสอ.ควนโดน', target: 15, result_count: 10, result_percentage: 66, score: 1, status: 'ไม่ผ่าน' },
      },
      'ไตรมาส 1 (ต.ค.-ธ.ค.)': {
        'ระดับจังหวัด': { area_name: 'ระดับจังหวัด', target: 25, result_count: 20, result_percentage: 80, score: 4, status: 'ผ่าน' },
      },
      'ตุลาคม': {
        'ระดับจังหวัด': { area_name: 'ระดับจังหวัด', target: 10, result_count: 8, result_percentage: 80, score: 4, status: 'ผ่าน' },
      }
    },
    responsible_group: 'กลุ่มงานส่งเสริมสุขภาพ',
    fiscal_year: '2569',
  },
  {
    id: '2',
    order: 2,
    name: 'ร้อยละเด็กอายุครบ 12 เดือนในเขตรับผิดชอบ มีภาวะโลหิตจาง',
    target_criteria: '<=ร้อยละ20',
    weight: 1,
    score_criteria: { 1: 17, 2: 16, 3: 15, 4: 14, 5: 13 },
    max_score: 5,
    results: {
      'ภาพรวม (สะสม)': {
        'ระดับจังหวัด': { area_name: 'ระดับจังหวัด', target: 0, result_count: 0, result_percentage: 0, score: 0, status: 'รอประเมิน' },
      }
    },
    responsible_group: 'กลุ่มงานส่งเสริมสุขภาพ',
    fiscal_year: '2569',
  },
  {
    id: '5',
    order: 5,
    name: 'ระดับความสำเร็จของ คปสอ. ที่สามารถพัฒนาอนามัยสิ่งแวดล้อมได้ตามเกณฑ์ GREEN & CLEAN Hospital Challenge และ GREEN & CLEAN Sub – District Health Promoting Hospital',
    target_criteria: 'ระดับ 3',
    weight: 0.5,
    score_criteria: { 1: '-', 2: '-', 3: 1, 4: 2, 5: 3 },
    max_score: 2.5,
    results: {
      'ภาพรวม (สะสม)': {
        'ระดับจังหวัด': { area_name: 'ระดับจังหวัด', target: null, result_count: null, result_percentage: 0, score: 1, status: 'ไม่ผ่าน' },
      },
      'ไตรมาส 1 (ต.ค.-ธ.ค.)': {
        'ระดับจังหวัด': { area_name: 'ระดับจังหวัด', target: null, result_count: null, result_percentage: 0, score: 1, status: 'ไม่ผ่าน' },
      }
    },
    responsible_group: 'กลุ่มงานอนามัยสิ่งแวดล้อม',
    fiscal_year: '2569',
  },
  {
    id: '7.1',
    order: '7.1',
    name: 'ร้อยละของผู้ป่วยโรคเบาหวานชนิดที่ 2 อายุตั้งแต่ 18 ปีขึ้นไปที่เข้าเกณฑ์และเข้าร่วม NCDs remission clinic',
    target_criteria: '>=ร้อยละ 85',
    weight: 0.5,
    score_criteria: { 1: 45, 2: 55, 3: 65, 4: 75, 5: 85 },
    max_score: 2.5,
    results: {
      'ภาพรวม (สะสม)': {
        'ระดับจังหวัด': { area_name: 'ระดับจังหวัด', target: 0, result_count: 0, result_percentage: 0, score: 0, status: 'รอประเมิน' },
      }
    },
    responsible_group: 'กลุ่มงานควบคุมโรคไม่ติดต่อ',
    fiscal_year: '2569',
  },
];
