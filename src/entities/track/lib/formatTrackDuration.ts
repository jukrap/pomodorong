export function formatTrackDuration(durationSeconds?: number) {
  if (durationSeconds === 0) {
    return '라이브 스트림';
  }

  if (!durationSeconds) {
    return '길이 미확인';
  }

  const minutes = Math.floor(durationSeconds / 60);
  return `${minutes}분`;
}
