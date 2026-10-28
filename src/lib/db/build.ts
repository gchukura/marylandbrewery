/** True inside `next build` (including its page-rendering workers). */
export function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

/**
 * Read functions return [] or null on failure so a live page degrades instead of crashing.
 * During `next build` that would ship empty pages, so the error is rethrown and the build fails.
 */
export function throwDuringBuild(error: unknown): void {
  if (isProductionBuild()) {
    throw error instanceof Error ? error : new Error(`Data fetch failed during build: ${JSON.stringify(error)}`);
  }
}
