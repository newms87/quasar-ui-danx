import { describe, it, expect } from 'vitest';

describe('Vitest Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should have access to jsdom environment', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});
