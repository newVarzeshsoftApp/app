import moment from 'jalali-moment';
import {ServiceEntryDto} from '../../../../services/models/response/ReservationResService';
import {RANDOM_COLORS, JALALI_MONTH_NAMES} from './constants';

/**
 * دریافت رنگ سرویس بر اساس metadata یا hash عنوان
 */
export const getServiceColor = (
  service: ServiceEntryDto,
  index: number,
): {border: string; bg: string; text: string} => {
  // بررسی وجود رنگ در metadata
  const reserveColor =
    (service.metadata?.reserveColor as any)?.value ||
    (service.metadata?.reserveColor as string);
  const textColor =
    (service.metadata?.textColor as any)?.value ||
    (service.metadata?.textColor as string);

  if (reserveColor && textColor) {
    return {
      border: reserveColor,
      bg: reserveColor,
      text: textColor,
    };
  }

  // استفاده از hash عنوان برای رنگ ثابت هر سرویس
  let hash = 0;
  if (service.title) {
    for (let i = 0; i < service.title.length; i++) {
      hash = service.title.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  return RANDOM_COLORS[Math.abs(hash) % RANDOM_COLORS.length];
};

/**
 * فرمت کردن time slot به صورت "ساعت XX تا YY"
 */
export const formatTimeSlot = (timeSlot: string): string => {
  const [from, to] = timeSlot.split('_');
  return `ساعت ${from} تا ${to}`;
};

/**
 * تبدیل تاریخ میلادی به شمسی و فرمت کردن
 */
export const formatDate = (dateStr: string): string => {
  try {
    let gregorianDate: moment.Moment;

    if (dateStr.includes('/')) {
      // فرمت: YYYY/MM/DD
      const [year, month, day] = dateStr.split('/');
      gregorianDate = moment(`${year}-${month}-${day}`, 'YYYY-MM-DD');
    } else if (dateStr.includes('-')) {
      // فرمت: YYYY-MM-DD
      gregorianDate = moment(dateStr, 'YYYY-MM-DD');
    } else {
      return dateStr;
    }

    // تبدیل به شمسی
    const jalaliMoment = gregorianDate.locale('fa');
    const jalaliDay = jalaliMoment.format('jD');
    const jalaliMonth = parseInt(jalaliMoment.format('jM'), 10);

    return `${jalaliDay} ${JALALI_MONTH_NAMES[jalaliMonth - 1]}`;
  } catch (error) {
    // در صورت خطا، تلاش برای پارس مستقیم به عنوان شمسی
    try {
      const [year, month, day] = dateStr.split('/');
      // بررسی اینکه آیا سال شمسی است (بزرگتر از 1400)
      if (parseInt(year, 10) > 1400) {
        return `${day} ${JALALI_MONTH_NAMES[parseInt(month, 10) - 1]}`;
      }
    } catch {
      // ignore
    }
    return dateStr;
  }
};

