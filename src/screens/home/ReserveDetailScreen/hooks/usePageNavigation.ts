import {useState, useRef, useCallback} from 'react';
import {Animated, Easing, Dimensions} from 'react-native';
import {VISIBLE_DAYS_COUNT, TIME_COLUMN_WIDTH} from '../utils/constants';
import {DayEntryDto} from '../../../../services/models/response/ReservationResService';

interface UsePageNavigationProps {
  totalPages: number;
}

export const usePageNavigation = ({totalPages}: UsePageNavigationProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  // Temporary page for display during animation (to show new content without removing old)
  const [displayPage, setDisplayPage] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>(
    'right',
  );

  // Get visible days for a specific time slot
  // Use displayPage which updates during animation to show new content
  const getVisibleDaysForSlot = useCallback(
    (slotDays: DayEntryDto[]) => {
      const sortedDays = [...slotDays].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      const startIndex = displayPage * VISIBLE_DAYS_COUNT;
      return sortedDays.slice(startIndex, startIndex + VISIBLE_DAYS_COUNT);
    },
    [displayPage],
  );

  // Navigate between pages with smooth continuous animation
  const navigatePage = useCallback(
    (direction: 'prev' | 'next') => {
      // When going next, slide should go right (content moves right, new content comes from left)
      // When going prev, slide should go left (content moves left, new content comes from right)
      const newDirection = direction === 'next' ? 'right' : 'left';
      setSlideDirection(newDirection);

      const screenWidth = Dimensions.get('window').width;
      const slideDistance =
        (screenWidth - TIME_COLUMN_WIDTH) / VISIBLE_DAYS_COUNT;

      // Create a single smooth continuous animation
      // Use timer to change page at the right moment for seamless transition
      const targetSlideValue =
        newDirection === 'right' ? slideDistance : -slideDistance;
      const resetSlideValue =
        newDirection === 'right' ? -slideDistance : slideDistance;

      // Start slide out animation
      const slideOutAnim = Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: targetSlideValue,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]);

      // Calculate next page value
      const nextPage =
        direction === 'prev' && currentPage > 0
          ? currentPage - 1
          : direction === 'next' && currentPage < totalPages - 1
          ? currentPage + 1
          : currentPage;

      // After slide out completes, change displayPage and start slide in
      // This keeps old items visible for the full duration of slide out
      slideOutAnim.start(() => {
        // Update displayPage to show new content (old content already slid out completely)
        setDisplayPage(nextPage);

        // Instantly reset position to opposite side (no animation gap)
        slideAnim.setValue(resetSlideValue);
        opacityAnim.setValue(0.3);

        // Immediately start slide in (continuous, no gap)
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Update currentPage state ONLY after all animations complete
          // This ensures items don't disappear before animation finishes
          if (nextPage !== currentPage) {
            setCurrentPage(nextPage);
            setDisplayPage(nextPage); // Sync displayPage with currentPage
          }
        });
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
