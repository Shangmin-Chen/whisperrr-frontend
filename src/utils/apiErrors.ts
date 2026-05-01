/**
 * Normalization of API / network errors from axios and unknown throws.
 */

import axios from 'axios';

export interface NormalizedApiError {
  status?: number;
  /** Driver message (often "Request failed with status code …") */
  message: string;
  /** Parsed server body: message or error field when JSON */
  bodyMessage?: string;
}

function parseBodyMessage(data: unknown): string | undefined {
  if (data == null || typeof data !== 'object') {
    return undefined;
  }
  const rec = data as Record<string, unknown>;
  const fromMessage = rec.message;
  if (typeof fromMessage === 'string' && fromMessage.trim() !== '') {
    return fromMessage;
  }
  const fromError = rec.error;
  if (typeof fromError === 'string' && fromError.trim() !== '') {
    return fromError;
  }
  return undefined;
}

function isAxiosLikePlainObject(
  err: unknown
): err is { response?: { status?: number; data?: unknown }; message?: string } {
  if (err === null || typeof err !== 'object') {
    return false;
  }
  return 'response' in err;
}

export function normalizeUnknownApiError(err: unknown): NormalizedApiError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const bodyMessage = parseBodyMessage(err.response?.data);
    const message = err.message || 'Request failed';
    return { status, message, bodyMessage };
  }
  if (isAxiosLikePlainObject(err)) {
    const status = err.response?.status;
    const bodyMessage = parseBodyMessage(err.response?.data);
    const message = typeof err.message === 'string' ? err.message : 'Request failed';
    return { status, message, bodyMessage };
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  if (typeof err === 'string') {
    return { message: err };
  }
  return { message: 'Unknown error' };
}

/** Prefer server message, then Error message, then fallback. */
export function getUserFacingApiMessage(err: unknown, fallback: string): string {
  const n = normalizeUnknownApiError(err);
  return n.bodyMessage ?? n.message ?? fallback;
}
