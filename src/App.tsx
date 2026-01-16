import { TimerWidget } from './widgets/timer/ui/TimerWidget';
import { MusicPlayer } from './widgets/music-player/ui/MusicPlayer';

function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
        gap: '60px',
      }}
    >
      {/* 제목 */}
      <h1
        style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#2d2d2d',
          letterSpacing: '-1px',
          marginTop: '20px',
        }}
      >
        pomoDORONG
      </h1>

      {/* 타이머 */}
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <TimerWidget />
      </div>

      {/* 음악 플레이어 */}
      <div style={{ width: '100%', maxWidth: '640px' }}>
        <MusicPlayer />
      </div>
    </div>
  );
}

export default App;
