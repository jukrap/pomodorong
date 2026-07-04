export function getTrackFallbackThumbnail(videoId: string) {
  const safeVideoId = videoId.replace(/[<>&"']/g, '');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
      <rect width="320" height="180" rx="22" fill="#edf1f6"/>
      <rect x="118" y="63" width="84" height="54" rx="18" fill="#ffffff"/>
      <path d="M152 77v26l25-13z" fill="#ff493f"/>
      <text x="160" y="139" text-anchor="middle" fill="#6d7686" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="700">YouTube video</text>
      <text x="160" y="158" text-anchor="middle" fill="#9aa3b1" font-family="Inter, Arial, sans-serif" font-size="12">${safeVideoId}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
