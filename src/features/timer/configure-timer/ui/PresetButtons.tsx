import { DEFAULT_PRESETS } from '../../../../entities/timer/model/types';
import { useTimerStore } from '../../../../entities/timer/model/store';
import './TimerConfiguration.css';

export function PresetButtons() {
  const currentPreset = useTimerStore(state => state.currentPreset);
  const setPreset = useTimerStore(state => state.setPreset);

  return (
    <div className="preset-buttons" role="group" aria-label="타이머 프리셋">
      {DEFAULT_PRESETS.map(preset => (
        <button
          key={preset.id}
          className={`preset-buttons__button ${
            currentPreset.id === preset.id
              ? 'preset-buttons__button--active'
              : ''
          }`}
          type="button"
          onClick={() => setPreset(preset)}
          aria-pressed={currentPreset.id === preset.id}
        >
          <span>{preset.name}</span>
          <small>
            {preset.workDuration}/{preset.breakDuration}
          </small>
        </button>
      ))}
    </div>
  );
}
