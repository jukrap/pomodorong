export function formatTrackDuration(durationSeconds?: number) {
  if (durationSeconds === 0) {
    return 'Live stream';
  }

  if (!durationSeconds) {
    return 'Unknown length';
  }

  const minutes = Math.floor(durationSeconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}
