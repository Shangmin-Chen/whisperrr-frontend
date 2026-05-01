/**
 * Single source of truth for upload file rules: size, extensions, MIME types,
 * dropzone `accept`, user-facing copy, and optional client→server hints.
 */

import type { Accept } from 'react-dropzone';

const BYTES_PER_MB = 1024 * 1024;

function resolveMaxFileSizeBytes(): number {
  const raw = import.meta.env.VITE_MAX_FILE_SIZE;
  if (raw) {
    const sizeMb = parseInt(raw, 10);
    if (!isNaN(sizeMb) && sizeMb > 0) {
      return sizeMb * BYTES_PER_MB;
    }
  }
  return 50 * BYTES_PER_MB;
}

export interface FileRuleRow {
  /** e.g. ".mp3" */
  extension: string;
  /** Short label for UI, e.g. "MP3" */
  label: string;
  /** Primary MIME key for react-dropzone `accept` */
  dropzoneMime: string;
  /** Every MIME we treat as valid for this file (API + browser quirks) */
  mimeAliases: readonly string[];
}

export const FILE_RULE_DEFINITIONS: readonly FileRuleRow[] = [
  {
    extension: '.mp3',
    label: 'MP3',
    dropzoneMime: 'audio/mpeg',
    mimeAliases: ['audio/mpeg', 'audio/mp3', 'audio/mpeg3'],
  },
  {
    extension: '.wav',
    label: 'WAV',
    dropzoneMime: 'audio/wav',
    mimeAliases: ['audio/wav', 'audio/wave', 'audio/x-wav'],
  },
  {
    extension: '.m4a',
    label: 'M4A',
    dropzoneMime: 'audio/mp4',
    mimeAliases: ['audio/mp4', 'audio/m4a', 'audio/x-m4a'],
  },
  {
    extension: '.flac',
    label: 'FLAC',
    dropzoneMime: 'audio/flac',
    mimeAliases: ['audio/flac', 'audio/x-flac'],
  },
  {
    extension: '.ogg',
    label: 'OGG',
    dropzoneMime: 'audio/ogg',
    mimeAliases: ['audio/ogg', 'audio/vorbis'],
  },
  {
    extension: '.wma',
    label: 'WMA',
    dropzoneMime: 'audio/x-ms-wma',
    mimeAliases: ['audio/x-ms-wma', 'audio/wma'],
  },
  {
    extension: '.aac',
    label: 'AAC',
    dropzoneMime: 'audio/aac',
    mimeAliases: ['audio/aac', 'audio/x-aac'],
  },
  {
    extension: '.mp4',
    label: 'MP4',
    dropzoneMime: 'video/mp4',
    mimeAliases: ['video/mp4'],
  },
  {
    extension: '.avi',
    label: 'AVI',
    dropzoneMime: 'video/x-msvideo',
    mimeAliases: ['video/x-msvideo'],
  },
  {
    extension: '.mov',
    label: 'MOV',
    dropzoneMime: 'video/quicktime',
    mimeAliases: ['video/quicktime'],
  },
  {
    extension: '.mkv',
    label: 'MKV',
    dropzoneMime: 'video/x-matroska',
    mimeAliases: ['video/x-matroska'],
  },
  {
    extension: '.flv',
    label: 'FLV',
    dropzoneMime: 'video/x-flv',
    mimeAliases: ['video/x-flv'],
  },
  {
    extension: '.webm',
    label: 'WEBM',
    dropzoneMime: 'video/webm',
    mimeAliases: ['video/webm'],
  },
  {
    extension: '.wmv',
    label: 'WMV',
    dropzoneMime: 'video/x-ms-wmv',
    mimeAliases: ['video/x-ms-wmv'],
  },
  {
    extension: '.m4v',
    label: 'M4V',
    dropzoneMime: 'video/mp4',
    mimeAliases: ['video/mp4', 'video/x-m4v'],
  },
  {
    extension: '.3gp',
    label: '3GP',
    dropzoneMime: 'video/3gpp',
    mimeAliases: ['video/3gpp'],
  },
] as const;

function buildMimeTypeList(): string[] {
  const set = new Set<string>();
  for (const row of FILE_RULE_DEFINITIONS) {
    for (const m of row.mimeAliases) {
      set.add(m);
    }
  }
  return [...set];
}

function buildExtensionList(): string[] {
  return FILE_RULE_DEFINITIONS.map((r) => r.extension);
}

function buildDropzoneAccept(): Accept {
  const acc: Record<string, string[]> = {};
  for (const row of FILE_RULE_DEFINITIONS) {
    const list = acc[row.dropzoneMime] ?? [];
    if (!list.includes(row.extension)) {
      list.push(row.extension);
    }
    acc[row.dropzoneMime] = list;
  }
  return acc;
}

function partitionAudioVideo(): { audio: FileRuleRow[]; video: FileRuleRow[] } {
  const audio: FileRuleRow[] = [];
  const video: FileRuleRow[] = [];
  for (const row of FILE_RULE_DEFINITIONS) {
    if (row.dropzoneMime.startsWith('video/')) {
      video.push(row);
    } else {
      audio.push(row);
    }
  }
  return { audio, video };
}

function joinLabels(rows: readonly FileRuleRow[]): string {
  return rows.map((r) => r.label).join(', ');
}

function buildInvalidFormatMessage(): string {
  const { audio, video } = partitionAudioVideo();
  return `Unsupported format. Please use audio formats (${joinLabels(audio)}) or video formats (${joinLabels(video)})`;
}

const _maxBytes = resolveMaxFileSizeBytes();
const _mimeTypes = buildMimeTypeList();
const _extensions = buildExtensionList();
const _dropzoneAccept = buildDropzoneAccept();
const _invalidFormatMessage = buildInvalidFormatMessage();

/** Optional headers so the backend can log or validate client-side limits without parsing the body. */
export const CLIENT_UPLOAD_HINT_HEADERS = {
  'X-Whisperrr-Client-Max-Upload-Bytes': String(_maxBytes),
} as const;

/**
 * Resolved rules for the current build (env applies at module load).
 */
export const FILE_RULES = {
  maxFileSizeBytes: _maxBytes,
  /** Distinct MIME types we accept */
  supportedMimeTypes: _mimeTypes as readonly string[],
  /** Lowercase extensions including leading dot */
  supportedExtensions: _extensions as readonly string[],
  supportedMimeTypeSet: new Set(_mimeTypes),
  dropzoneAccept: _dropzoneAccept,
  invalidFormatMessage: _invalidFormatMessage,
  extensionsShortUpper: _extensions.map((e) => e.replace('.', '').toUpperCase()).join(', '),
  clientUploadHintHeaders: CLIENT_UPLOAD_HINT_HEADERS,
} as const;

/** Convenience map: MIME → display label (first match wins). */
export const MIME_TO_DISPLAY_LABEL: Readonly<Record<string, string>> = (() => {
  const out: Record<string, string> = {};
  for (const row of FILE_RULE_DEFINITIONS) {
    for (const m of row.mimeAliases) {
      if (out[m] === undefined) {
        out[m] = row.label;
      }
    }
  }
  return out;
})();

export function getFileRulesDocumentationHint(): string {
  return 'Upload rules live in src/utils/fileRules.ts (size via VITE_MAX_FILE_SIZE).';
}

/**
 * Marketing / feature card: audio list + video list + formatted max size (pass from `formatFileSize`).
 */
export function getFeatureFormatsBlurb(formattedMaxSize: string): string {
  const { audio, video } = partitionAudioVideo();
  const audioPart = joinLabels(audio);
  const videoPart = joinLabels(video);
  return `Support for ${audioPart} and video formats (${videoPart}), up to ${formattedMaxSize}.`;
}

/** Compact line for the file upload dropzone helper text. */
export function getUploadSupportsCaption(formattedMaxSize: string): string {
  return `Supports: ${FILE_RULES.extensionsShortUpper} (max ${formattedMaxSize})`;
}
