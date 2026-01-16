import { TimerWidget } from './widgets/timer/ui/TimerWidget';

function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '20px',
      }}
    >
      <h1>pomoDORONG</h1>
      <TimerWidget />
    </div>
  );
}

export default App;
