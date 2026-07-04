import { useState } from 'react';
import { useTimerStore } from '../../../../entities/timer/model/store';
import './TimerConfiguration.css';

export function CustomTimerForm() {
  const currentPreset = useTimerStore(state => state.currentPreset);
  const setPreset = useTimerStore(state => state.setPreset);

  const [workDuration, setWorkDuration] = useState(currentPreset.workDuration);
  const [breakDuration, setBreakDuration] = useState(
    currentPreset.breakDuration
  );

  if (currentPreset.id !== 'custom') {
    return null;
  }

  const handleApply = () => {
    setPreset({
      id: 'custom',
      name: '커스텀',
      workDuration,
      breakDuration,
    });
  };

  return (
    <div className="custom-timer-form">
      <label>
        <span>작업 시간</span>
        <strong>{workDuration}분</strong>
        <input
          type="range"
          min="1"
          max="240"
          value={workDuration}
          onChange={e => setWorkDuration(Number(e.target.value))}
        />
      </label>

      <label>
        <span>휴식 시간</span>
        <strong>{breakDuration}분</strong>
        <input
          type="range"
          min="1"
          max="60"
          value={breakDuration}
          onChange={e => setBreakDuration(Number(e.target.value))}
        />
      </label>

      <button type="button" onClick={handleApply}>
        적용
      </button>
    </div>
  );
}
