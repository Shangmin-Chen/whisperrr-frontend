import { describe, expect, it } from 'vitest';
import { getUserFacingApiMessage, normalizeUnknownApiError } from '../apiErrors';

describe('apiErrors', () => {
  it('normalizes duck-typed axios-like 404 objects from tests', () => {
    const err = { response: { status: 404, data: { message: 'missing' } }, message: 'Not Found' };
    const n = normalizeUnknownApiError(err);
    expect(n.status).toBe(404);
    expect(n.bodyMessage).toBe('missing');
    expect(getUserFacingApiMessage(err, 'fallback')).toBe('missing');
  });

  it('uses fallback when no body message', () => {
    expect(getUserFacingApiMessage(new Error('oops'), 'fallback')).toBe('oops');
    expect(getUserFacingApiMessage('x', 'fallback')).toBe('x');
    expect(getUserFacingApiMessage(123, 'fallback')).toBe('Unknown error');
  });
});
