import { MotionConfig } from 'motion/react';
import { HomePage } from './pages/home/ui/HomePage';

function App() {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ type: 'spring', stiffness: 360, damping: 34, mass: 0.8 }}
    >
      <HomePage />
    </MotionConfig>
  );
}

export default App;
