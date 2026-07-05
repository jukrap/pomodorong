# pomoDORONG

pomoDORONG is a focused Pomodoro web app built around external video and music. It keeps the timer first, then switches the media stack between work and break sessions so the whole flow stays lightweight and local.

The app is being rebuilt as a static, client-first product. There is no account system, paid backend, database, or API key requirement in the current direction.

## Features

- Work and break Pomodoro modes with preset and custom durations
- Mode-specific YouTube media stacks
- Local playlist editing with URL or video ID input
- Local volume, timer, playlist, and session stats persistence
- Current media dock with next, retry, and YouTube fallback actions
- Desktop and mobile responsive layout
- Subtle synth waveform background for atmosphere

## Product Direction

pomoDORONG is intended to stay simple to deploy and easy to reset:

- Static hosting first, with Vercel as the expected free deployment target
- Browser storage first, using versioned localStorage keys
- YouTube URL parsing instead of YouTube Data API usage
- Manual metadata entry instead of API-key-based track lookup
- Future focus scene experiments with Three.js only when they improve the timer experience

## Tech Stack

- React 19
- TypeScript
- Vite
- Zustand
- Motion
- YouTube IFrame API
- Geist Variable via Fontsource

## Local Development

```bash
npm install
npm run dev
```

The default development server runs at `http://localhost:5173`.

## Verification

```bash
npm run lint
npm run build
```

## Data And Privacy

All user data is saved on the current device only. Settings, media stacks, playback state, and basic session stats are stored in browser localStorage. Clearing site data resets the app.

## Deployment

The app is designed for static deployment. Build the production assets with:

```bash
npm run build
```

The generated files are written to `dist/`.

## License

MIT
