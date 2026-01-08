import { vi } from 'vitest';

// Mock window.getSelection for jsdom
// jsdom's Selection API is limited, so we may need to enhance it
if (typeof window !== 'undefined') {
  // Ensure getSelection exists
  if (!window.getSelection) {
    window.getSelection = vi.fn(() => null);
  }
}

// Global test utilities can be added here
