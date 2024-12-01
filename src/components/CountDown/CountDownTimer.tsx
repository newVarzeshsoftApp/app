import React, {useState, useEffect} from 'react';
import BaseText from '../BaseText';

interface CountdownTimerProps {
  /** Initial time for the countdown in seconds */
  initialTime: number;
  /** Function to be called when the countdown completes */
  onComplete?: () => void;
  /** If true, the timer will reset */
  reset?: boolean;
}

/**
 * CountdownTimer component displays a countdown timer that updates every second.
 * When the timer reaches zero, it calls the onComplete function.
 *
 * @param {CountdownTimerProps} props - The props for CountdownTimer component.
 * @returns {JSX.Element} - Rendered CountdownTimer component.
 */
const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialTime,
  onComplete,
  reset,
}) => {
  /* ================== State & Store ================== */

  const [remainingTime, setRemainingTime] = useState<number>(initialTime);

  /* ================== Life Cycles & Mutations ================== */

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (reset) {
      // Reset the timer if reset is true
      setRemainingTime(initialTime);
    } else if (remainingTime > 0) {
      // Start the countdown if there is time remaining
      timer = setInterval(() => {
        setRemainingTime(prevTime => prevTime - 1);
      }, 1000);
    } else {
      // Call onComplete when the countdown finishes
      onComplete && onComplete();
    }

    // Clean up the timer on component unmount or when dependencies change
    return () => clearInterval(timer);
  }, [remainingTime, onComplete, reset, initialTime]);

  /* ================== Helper Functions ================== */

  // Formats the remaining time as mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return (
      String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0')
    );
  };

  return <BaseText>{formatTime(remainingTime)}</BaseText>;
};

export default CountdownTimer;
