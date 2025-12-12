import React, {useState, useEffect, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import moment from 'jalali-moment';
import WheelPicker from '../WheelPicker';

export type DateSelectorState = {
  jalaliDate?: string;
  gregorianDate?: string;
};

interface JalaliDatePickerProps {
  onChange?: (date: DateSelectorState) => void;
  initialValue?: DateSelectorState | null;
  /** Minimum selectable date (gregorian format: YYYY-MM-DD) */
  minDate?: string;
  /** Maximum selectable date (gregorian format: YYYY-MM-DD) */
  maxDate?: string;
}

const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  onChange,
  initialValue,
  minDate,
  maxDate,
}) => {
  const today = moment(); // Today's date in Jalali calendar
  const currentYear = today.jYear();

  // Parse min/max dates
  const minMoment = minDate ? moment(minDate, 'YYYY-MM-DD') : null;
  const maxMoment = maxDate ? moment(maxDate, 'YYYY-MM-DD') : null;

  // Initialize state with `initialValue` or default to today's date
  const initialDate = initialValue?.gregorianDate
    ? moment.from(initialValue?.gregorianDate ?? '', 'en', 'YYYY-MM-DD')
    : today;

  const [selectedYear, setSelectedYear] = useState<number>(initialDate.jYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(
    initialDate.jMonth() + 1,
  );
  const [selectedDay, setSelectedDay] = useState<number>(initialDate.jDate());

  // Generate years based on min/max constraints
  const years = useMemo(() => {
    const minYear = minMoment ? minMoment.jYear() : currentYear - 50;
    const maxYear = maxMoment ? maxMoment.jYear() : currentYear + 1;
    const yearCount = maxYear - minYear + 1;

    return Array.from({length: yearCount}, (_, i) => ({
      label: `${maxYear - i}`,
      value: `${maxYear - i}`,
    }));
  }, [currentYear, minMoment?.jYear(), maxMoment?.jYear()]);

  // Generate months based on min/max constraints for selected year
  const months = useMemo(() => {
    const monthNames = [
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

    let startMonth = 1;
    let endMonth = 12;

    // If selected year equals min year, start from min month
    if (minMoment && selectedYear === minMoment.jYear()) {
      startMonth = minMoment.jMonth() + 1;
    }
    // If selected year equals max year, end at max month
    if (maxMoment && selectedYear === maxMoment.jYear()) {
      endMonth = maxMoment.jMonth() + 1;
    }

    return monthNames
      .map((month, index) => ({
        label: month,
        value: `${index + 1}`,
      }))
      .filter(m => {
        const monthNum = parseInt(m.value, 10);
        return monthNum >= startMonth && monthNum <= endMonth;
      });
  }, [selectedYear, minMoment?.format(), maxMoment?.format()]);

  // Generate days based on min/max constraints for selected year/month
  const days = useMemo(() => {
    const maxDaysInMonth = moment.jDaysInMonth(selectedYear, selectedMonth - 1);
    let startDay = 1;
    let endDay = maxDaysInMonth;

    // If selected year/month equals min year/month, start from min day
    if (
      minMoment &&
      selectedYear === minMoment.jYear() &&
      selectedMonth === minMoment.jMonth() + 1
    ) {
      startDay = minMoment.jDate();
    }
    // If selected year/month equals max year/month, end at max day
    if (
      maxMoment &&
      selectedYear === maxMoment.jYear() &&
      selectedMonth === maxMoment.jMonth() + 1
    ) {
      endDay = Math.min(endDay, maxMoment.jDate());
    }

    return Array.from({length: endDay - startDay + 1}, (_, i) => ({
      label: `${startDay + i}`,
      value: `${startDay + i}`,
    }));
  }, [selectedYear, selectedMonth, minMoment?.format(), maxMoment?.format()]);

  // Updates the selected date and triggers `onChange`
  const updateDate = () => {
    const jalaliDate = `${selectedYear}/${selectedMonth}/${selectedDay}`;
    const gregorianDate = moment
      .from(jalaliDate, 'fa', 'YYYY/MM/DD')
      .format('YYYY-MM-DD');
    if (onChange) {
      onChange({gregorianDate: gregorianDate, jalaliDate: jalaliDate});
    }
  };

  useEffect(() => {
    if (!initialValue || initialValue.gregorianDate === undefined) {
      // When no initialValue, trigger onChange with current date
      const todayJalali = `${today.jYear()}/${
        today.jMonth() + 1
      }/${today.jDate()}`;
      const todayGregorian = today.format('YYYY-MM-DD');
      onChange?.({
        gregorianDate: todayGregorian,
        jalaliDate: todayJalali,
      });
    }
  }, []);

  useEffect(() => {
    // Ensure the month is valid for selected year with constraints
    let validMonth = selectedMonth;
    if (minMoment && selectedYear === minMoment.jYear()) {
      const minMonth = minMoment.jMonth() + 1;
      if (validMonth < minMonth) {
        validMonth = minMonth;
        setSelectedMonth(validMonth);
        return;
      }
    }
    if (maxMoment && selectedYear === maxMoment.jYear()) {
      const maxMonth = maxMoment.jMonth() + 1;
      if (validMonth > maxMonth) {
        validMonth = maxMonth;
        setSelectedMonth(validMonth);
        return;
      }
    }

    // Ensure the day is valid for the selected month and year
    const maxDays = moment.jDaysInMonth(selectedYear, selectedMonth - 1);
    let validDay = selectedDay;

    // Check min date constraint
    if (
      minMoment &&
      selectedYear === minMoment.jYear() &&
      selectedMonth === minMoment.jMonth() + 1
    ) {
      const minDay = minMoment.jDate();
      if (validDay < minDay) {
        validDay = minDay;
      }
    }

    // Check max date constraint
    if (
      maxMoment &&
      selectedYear === maxMoment.jYear() &&
      selectedMonth === maxMoment.jMonth() + 1
    ) {
      const maxDay = maxMoment.jDate();
      if (validDay > maxDay) {
        validDay = maxDay;
      }
    }

    // Check max days in month
    if (validDay > maxDays) {
      validDay = maxDays;
    }

    if (validDay !== selectedDay) {
      setSelectedDay(validDay);
      return;
    }

    updateDate();
  }, [selectedYear, selectedMonth, selectedDay, minDate, maxDate]);

  useEffect(() => {
    if (initialValue && initialValue.gregorianDate !== undefined) {
      const jalaliDate = initialValue.jalaliDate;
      const gregorianDate = initialValue.gregorianDate;
      onChange?.({gregorianDate, jalaliDate});
      setSelectedYear(initialDate.jYear());
      setSelectedMonth(initialDate.jMonth() + 1);
      setSelectedDay(initialDate.jDate());
    } else {
      updateDate();
    }
  }, [initialValue]);

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <WheelPicker
          values={days}
          defaultValue={`${selectedDay}`}
          onChange={item => setSelectedDay(parseInt(item.value, 10))}
          position="RIGHT"
        />
      </View>
      <View style={styles.pickerContainer}>
        <WheelPicker
          values={months}
          defaultValue={`${selectedMonth}`}
          onChange={item => setSelectedMonth(parseInt(item.value, 10))}
          position="CENTER"
        />
      </View>
      <View style={styles.pickerContainer}>
        <WheelPicker
          values={years}
          defaultValue={`${selectedYear}`}
          onChange={item => setSelectedYear(parseInt(item.value, 10))}
          position="LEFT"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  pickerContainer: {
    flex: 1,
  },
});

export default JalaliDatePicker;
