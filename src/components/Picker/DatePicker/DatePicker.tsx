import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import moment from 'jalali-moment';
import WheelPicker from '../WheelPicker';

export type DateSelectorState = {
  jalaliDate: string;
  gregorianDate: string;
};

interface JalaliDatePickerProps {
  onChange?: (date: DateSelectorState) => void;
  initialValue?: DateSelectorState | null;
}

const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  onChange,
  initialValue,
}) => {
  const today = moment(); // Today's date in Jalali calendar
  const currentYear = today.jYear();
  const currentMonth = today.jMonth() + 1; // Months are 0-based in moment.js
  const currentDay = today.jDate();

  // Initialize state with `initialValue` or default to today's date
  const initialDate = initialValue
    ? moment.from(initialValue.jalaliDate, 'fa', 'YYYY/MM/DD')
    : today;

  const [selectedYear, setSelectedYear] = useState<number>(initialDate.jYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(
    initialDate.jMonth() + 1,
  );
  const [selectedDay, setSelectedDay] = useState<number>(initialDate.jDate());

  // Generate years, months, and days for the picker
  const years = Array.from({length: 50}, (_, i) => ({
    label: `${currentYear - i}`,
    value: `${currentYear - i}`,
  }));

  const months = [
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
  ].map((month, index) => ({
    label: month,
    value: `${index + 1}`,
  }));

  const days = Array.from({length: 31}, (_, i) => ({
    label: `${i + 1}`,
    value: `${i + 1}`,
  }));

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
    if (!initialValue) {
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
    // Ensure the day is valid for the selected month and year
    const maxDays = moment.jDaysInMonth(selectedYear, selectedMonth - 1);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
    updateDate();
  }, [selectedYear, selectedMonth, selectedDay]);
  useEffect(() => {
    if (initialValue) {
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
