import { afterEach, describe, expect, it, vi } from 'vitest';
import { getJSON } from '../services/http.js';

afterEach(() => vi.unstubAllGlobals());

describe('HTTP service', () => {
  it('normalizes invalid JSON responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
      })
    );

    await expect(getJSON('/weather')).rejects.toThrow(/unreadable response/i);
  });

  it('preserves request cancellation', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

    await expect(getJSON('/weather')).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});
