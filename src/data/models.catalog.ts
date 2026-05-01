import type { ModelInfo } from '../types/transcription';

export const AVAILABLE_MODELS: ModelInfo[] = [
  { size: 'tiny', description: 'Fastest, least accurate', sizeMB: 39, speed: '~32x realtime', accuracy: 'Basic' },
  { size: 'base', description: 'Good balance of speed and accuracy', sizeMB: 74, speed: '~16x realtime', accuracy: 'Good' },
  { size: 'small', description: 'Better accuracy, slower', sizeMB: 244, speed: '~6x realtime', accuracy: 'Better' },
  { size: 'medium', description: 'Good accuracy, slower', sizeMB: 769, speed: '~2x realtime', accuracy: 'High' },
  { size: 'large', description: 'Best accuracy, slowest', sizeMB: 1550, speed: '~1x realtime', accuracy: 'Highest' },
  { size: 'large-v2', description: 'Best accuracy, slowest (v2)', sizeMB: 1550, speed: '~1x realtime', accuracy: 'Highest' },
  { size: 'large-v3', description: 'Best accuracy, slowest (v3)', sizeMB: 1550, speed: '~1x realtime', accuracy: 'Highest' },
];
