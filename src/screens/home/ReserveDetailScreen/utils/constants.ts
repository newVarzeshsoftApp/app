// تعداد روزهایی که همزمان نمایش داده می‌شود
export const VISIBLE_DAYS_COUNT = 3;

// عرض ستون ساعت
export const TIME_COLUMN_WIDTH = 45;

// روزهای هفته - دوشنبه = 1 (میلادی)
export const WEEK_DAYS_MAP: Record<string, {label: string; id: number}> = {
  day1: {label: 'دوشنبه', id: 1},
  day2: {label: 'سه‌شنبه', id: 2},
  day3: {label: 'چهارشنبه', id: 3},
  day4: {label: 'پنج‌شنبه', id: 4},
  day5: {label: 'جمعه', id: 5},
  day6: {label: 'شنبه', id: 6},
  day7: {label: 'یکشنبه', id: 0},
};

// رنگ‌های رندوم برای سرویس‌ها
export const RANDOM_COLORS = [
  {border: '#8B4513', bg: '#D2B48C', text: '#FFFFFF'}, // قهوه‌ای
  {border: '#5BC8FF', bg: '#B3E5FC', text: '#FFFFFF'}, // آبی روشن
  {border: '#9C27B0', bg: '#E1BEE7', text: '#FFFFFF'}, // بنفش
  {border: '#4CAF50', bg: '#C8E6C9', text: '#FFFFFF'}, // سبز
  {border: '#FF9800', bg: '#FFE0B2', text: '#FFFFFF'}, // نارنجی
];

// نام‌های ماه‌های شمسی
export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];
