import type { Track } from '../model/types';

const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function getVideoIdFromUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] ?? null;
    }

    if (!host.endsWith('youtube.com')) {
      return null;
    }

    if (url.pathname === '/watch') {
      return url.searchParams.get('v');
    }

    const [firstPathPart, secondPathPart] = url.pathname
      .split('/')
      .filter(Boolean);

    if (firstPathPart === 'embed' || firstPathPart === 'shorts') {
      return secondPathPart ?? null;
    }

    return null;
  } catch {
    return null;
  }
}

export function parseYouTubeVideoId(input: string) {
  const trimmedInput = input.trim();

  if (YOUTUBE_VIDEO_ID_PATTERN.test(trimmedInput)) {
    return trimmedInput;
  }

  const videoId = getVideoIdFromUrl(trimmedInput);

  if (!videoId || !YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) {
    return null;
  }

  return videoId;
}

interface TrackDraftInput {
  urlOrId: string;
  title?: string;
  durationMinutes?: number | null;
}

export function createTrackFromDraft(
  input: TrackDraftInput
): { ok: true; track: Track } | { ok: false; message: string } {
  const videoId = parseYouTubeVideoId(input.urlOrId);

  if (!videoId) {
    return {
      ok: false,
      message: 'Enter a valid YouTube URL or 11-character video ID.',
    };
  }

  const title = input.title?.trim() || `YouTube video ${videoId}`;
  const durationSeconds =
    input.durationMinutes && input.durationMinutes > 0
      ? Math.round(input.durationMinutes * 60)
      : undefined;

  return {
    ok: true,
    track: {
      videoId,
      title,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      durationSeconds,
    },
  };
}
