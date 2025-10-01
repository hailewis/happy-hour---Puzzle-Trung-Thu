
import React, { useState, useEffect } from 'react';

interface TimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialSeconds, onTimeUp }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const timerId = setInterval(() => {
      setSecondsLeft(prevSeconds => prevSeconds - 1);
    }, 1000);

    return () => clearInterval(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const timerColor = secondsLeft <= 10 ? 'text-red-400' : secondsLeft <= 60 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className={`font-mono text-lg font-bold px-3 py-1 rounded-md bg-gray-900 ${timerColor}`}>
      <span>{String(minutes).padStart(2, '0')}</span>:<span>{String(seconds).padStart(2, '0')}</span>
    </div>
  );
};

export default Timer;
