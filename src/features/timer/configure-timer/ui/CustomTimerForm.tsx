import { useState } from 'react';
import { useTimerStore } from '../../../../entities/timer/model/store';

export function CustomTimerForm() {
  const currentPreset = useTimerStore(state => state.currentPreset);
  const setPreset = useTimerStore(state => state.setPreset);
  
  const [workDuration, setWorkDuration] = useState(currentPreset.workDuration);
  const [breakDuration, setBreakDuration] = useState(currentPreset.breakDuration);

  // 커스텀 프리셋이 아니면 표시 안 함
  if (currentPreset.id !== 'custom') {
    return null;
  }

  const handleApply = () => {
    setPreset({
      id: 'custom',
      name: '커스텀',
      workDuration,
      breakDuration
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px'
      }}
    >
      {/* 작업 시간 */}
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#4a5568'
          }}
        >
          작업 시간: {workDuration}분
        </label>
        <input
          type="range"
          min="1"
          max="240"
          value={workDuration}
          onChange={e => setWorkDuration(Number(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            appearance: 'none',
            background: '#ddd',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
      </div>

      {/* 휴식 시간 */}
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#4a5568'
          }}
        >
          휴식 시간: {breakDuration}분
        </label>
        <input
          type="range"
          min="1"
          max="60"
          value={breakDuration}
          onChange={e => setBreakDuration(Number(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            appearance: 'none',
            background: '#ddd',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
      </div>

      {/* 적용 버튼 */}
      <button
        onClick={handleApply}
        style={{
          padding: '12px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#fff',
          background: '#2d2d2d',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        적용
      </button>
    </div>
  );
}