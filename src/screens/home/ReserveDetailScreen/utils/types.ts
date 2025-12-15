import {DayEntryDto, ServiceEntryDto} from '../../../../services/models/response/ReservationResService';

export interface TimeSlot {
  timeSlot: string;
  days: DayEntryDto[];
}

export interface SelectedItemData {
  item: ServiceEntryDto;
  dayData: DayEntryDto;
  timeSlot: string;
}

export interface ServiceColor {
  border: string;
  bg: string;
  text: string;
}

