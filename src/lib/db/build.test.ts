import { afterEach, describe, expect, it } from 'vitest';
import { throwDuringBuild } from './build';

describe('throwDuringBuild', () => {
  const original = process.env.NEXT_PHASE;
  afterEach(() => {
    process.env.NEXT_PHASE = original;
  });

  it('rethrows during next build', () => {
    process.env.NEXT_PHASE = 'phase-production-build';
    expect(() => throwDuringBuild(new Error('boom'))).toThrow('boom');
    expect(() => throwDuringBuild({ code: 'PGRST301' })).toThrow('PGRST301');
  });

  it('does nothing at runtime', () => {
    process.env.NEXT_PHASE = 'phase-production-server';
    expect(() => throwDuringBuild(new Error('boom'))).not.toThrow();
  });
});
