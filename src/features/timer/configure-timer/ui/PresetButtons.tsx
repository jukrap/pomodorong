import { DEFAULT_PRESETS } from '../../../../entities/timer/model/types';
import { useTimerStore } from '../../../../entities/timer/model/store';

export function PresetButtons() {
  const currentPreset = useTimerStore(state => state.currentPreset);
  const setPreset = useTimerStore(state => state.setPreset);

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}
    >
      {DEFAULT_PRESETS.map(preset => (
        <button
          key={preset.id}
          onClick={() => setPreset(preset)}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: currentPreset.id === preset.id ? '700' : '500',
            color: currentPreset.id === preset.id ? '#fff' : '#2d2d2d',
            background: currentPreset.id === preset.id 
              ? '#2d2d2d' 
              : 'transparent',
            border: `2px solid ${currentPreset.id === preset.id ? '#2d2d2d' : '#ddd'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
}