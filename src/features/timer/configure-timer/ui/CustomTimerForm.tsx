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
      name: 'Custom',
      workDuration,
      breakDuration,
    });
  };

  return (
    <div className="custom-timer-form">
      <label>
        <span>Work duration</span>
        <strong>{workDuration}m</strong>
        <input
          type="range"
          min="1"
          max="240"
          value={workDuration}
          onChange={e => setWorkDuration(Number(e.target.value))}
        />
      </label>

      <label>
        <span>Break duration</span>
        <strong>{breakDuration}m</strong>
        <input
          type="range"
          min="1"
          max="60"
          value={breakDuration}
          onChange={e => setBreakDuration(Number(e.target.value))}
        />
      </label>

      <button type="button" onClick={handleApply}>
        Apply
      </button>
    </div>
  );
}
