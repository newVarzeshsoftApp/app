export const GROUP_CLASS_ROOM_KEY = 'GROUP_CLASS_ROOM';

export const GROUP_CLASS_ROOM_LIST_PAGE_SIZE = 10;

// Schedule days from API use 1-7 (same as reserve day1-day7); 7 = یکشنبه.
export const GROUP_CLASS_ROOM_DAY_LABELS: Record<number, string> = {
  1: 'دوشنبه',
  2: 'سه‌شنبه',
  3: 'چهارشنبه',
  4: 'پنج‌شنبه',
  5: 'جمعه',
  6: 'شنبه',
  7: 'یکشنبه',
};

export const GROUP_CLASS_ROOM_DAY_DISPLAY_ORDER = [6, 7, 1, 2, 3, 4, 5];

export const GROUP_CLASS_ROOM_EVEN_DAY_IDS = [6, 1, 3];

export const GROUP_CLASS_ROOM_ODD_DAY_IDS = [7, 2, 4];
