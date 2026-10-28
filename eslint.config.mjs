import { FlatCompat } from '@eslint/eslintrc';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'src/lib/db/database.types.ts', // generated: npm run db:types
      'scripts/archived/**',
      'lib/archived/**',
      'docs/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      'prefer-const': 'error',
      'no-var': 'error',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      // The data-layer PR removes these; warn until then
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: '@supabase/supabase-js', message: 'Supabase access goes through @/lib/db.' }],
          patterns: [{ group: ['@/lib/db/*', '**/lib/db/*'], message: 'Import from @/lib/db, not its internal files.' }],
        },
      ],
    },
  },
  {
    // The data layer itself, and scripts (which import its files directly)
    files: ['src/lib/db/**', 'scripts/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // CommonJS files
    files: ['**/*.js', '**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
);
