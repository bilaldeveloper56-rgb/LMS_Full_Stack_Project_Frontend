import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

/**
 * QuizTimer component.
 * Synchronizes client countdown with server-authoritative `startedAt` and `durationMinutes`.
 *
 * @param {object} props
 * @param {string|Date} props.startedAt
 * @param {number} props.durationMinutes
 * @param {Function} props.onExpire
 */
export function QuizTimer({ startedAt, durationMinutes, onExpire }) {
  const hasExpiredRef = useRef(false);

  const calculateRemainingSeconds = () => {
    if (!startedAt || !durationMinutes) return 0;
    const startTimeMs = new Date(startedAt).getTime();
    const durationMs = durationMinutes * 60 * 1000;
    const endTimeMs = startTimeMs + durationMs;
    const remainingMs = endTimeMs - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  };

  const [remainingSeconds, setRemainingSeconds] = useState(calculateRemainingSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateRemainingSeconds();
      setRemainingSeconds(remaining);

      if (remaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, durationMinutes, onExpire]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isUrgent = remainingSeconds > 0 && remainingSeconds < 300; // < 5 mins
  const isZero = remainingSeconds === 0;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-sm font-bold border transition-colors ${
        isZero
          ? 'bg-danger-100 text-danger-800 border-danger-300 animate-pulse'
          : isUrgent
          ? 'bg-warning-50 text-warning-800 border-warning-300'
          : 'bg-primary-50 text-primary-800 border-primary-200'
      }`}
      aria-label={`Time remaining: ${minutes} minutes and ${seconds} seconds`}
    >
      {isUrgent || isZero ? (
        <AlertTriangle className="w-4 h-4 text-warning-700 animate-bounce" />
      ) : (
        <Clock className="w-4 h-4 text-primary-600" />
      )}
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {isZero && <span className="text-[11px] font-sans font-normal ml-1">Time Expired</span>}
    </div>
  );
}

export default QuizTimer;
