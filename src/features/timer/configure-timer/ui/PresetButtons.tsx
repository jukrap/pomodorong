import { DEFAULT_PRESETS } from '../../../../entities/timer/model/types';
import { useTimerStore } from '../../../../entities/timer/model/store';
import './TimerConfiguration.css';

const PRESET_LABELS: Record<string, string> = {
  classic: 'Classic',
  standard: 'Standard',
  deepwork: 'Deep Work',
  custom: 'Custom',
};

export function PresetButtons() {
  const currentPreset = useTimerStore(state => state.currentPreset);
  const setPreset = useTimerStore(state => state.setPreset);

  return (
    <div className="preset-buttons" role="group" aria-label="Timer presets">
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
          <span>{PRESET_LABELS[preset.id] ?? preset.name}</span>
          <small>
            {preset.id === 'custom'
              ? 'Edit'
              : `${preset.workDuration}/${preset.breakDuration}`}
          </small>
        </button>
      ))}
    </div>
  );
}
