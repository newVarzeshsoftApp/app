import {useState, useRef, useCallback} from 'react';
import {Animated, Easing, Dimensions} from 'react-native';
import {VISIBLE_DAYS_COUNT, TIME_COLUMN_WIDTH} from '../utils/constants';
import {DayEntryDto} from '../../../../services/models/response/ReservationResService';

interface UsePageNavigationProps {
  totalPages: number;
}

export const usePageNavigation = ({totalPages}: UsePageNavigationProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>(
    'right',
  );

  // Get visible days for a specific time slot
  const getVisibleDaysForSlot = useCallback(
    (slotDays: DayEntryDto[]) => {
      const sortedDays = [...slotDays].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      const startIndex = currentPage * VISIBLE_DAYS_COUNT;
      return sortedDays.slice(startIndex, startIndex + VISIBLE_DAYS_COUNT);
    },
    [currentPage],
  );

  // Navigate between pages with smooth animation
  const navigatePage = useCallback(
    (direction: 'prev' | 'next') => {
      const newDirection = direction === 'next' ? 'left' : 'right';
      setSlideDirection(newDirection);

      const screenWidth = Dimensions.get('window').width;
      const slideDistance =
        (screenWidth - TIME_COLUMN_WIDTH) / VISIBLE_DAYS_COUNT;

      // Slide out animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: newDirection === 'left' ? -slideDistance : slideDistance,
          duration: 700,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.2,
          duration: 700,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Update page in the middle of animation
        if (direction === 'prev' && currentPage > 0) {
          setCurrentPage(prev => prev - 1);
        } else if (direction === 'next' && currentPage < totalPages - 1) {
          setCurrentPage(prev => prev + 1);
        }

        // Reset position to opposite side
        slideAnim.setValue(
          newDirection === 'left' ? slideDistance : -slideDistance,
        );
        opacityAnim.setValue(0.2);

        // Slide in animation
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.bezier(0.0, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.0, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [currentPage, totalPages, slideAnim, opacityAnim],
  );

  const canGoNext = currentPage < totalPages - 1;
  const canGoPrev = currentPage > 0;

  return {
    currentPage,
    slideAnim,
    opacityAnim,
    slideDirection,
    getVisibleDaysForSlot,
    navigatePage,
    canGoNext,
    canGoPrev,
  };
};

