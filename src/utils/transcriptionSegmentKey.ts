import type { TranscriptionSegment } from '../types/transcription';

/**
 * Stable React key for a transcription segment list row.
 * Prefer opaque backend `id` when present; otherwise use list order plus timing/text so keys stay unique without showing ids in the UI.
 */
export function getTranscriptionSegmentKey(
  segment: TranscriptionSegment,
  positionInList: number
): string {
  if (segment.id != null && String(segment.id).length > 0) {
    return String(segment.id);
  }
  return `${positionInList}:${segment.startTime}:${segment.endTime}:${segment.text}`;
}
