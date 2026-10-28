/**
 * Lighthouse CI on the Vercel preview (.github/workflows/lighthouse.yml). Mobile, three runs per
 * page. Budgets are warnings for now: they're reported on the PR, never failing it.
 *
 * Vercel previews sit behind Vercel Authentication; VERCEL_AUTOMATION_BYPASS_SECRET (Vercel >
 * Settings > Deployment Protection > Protection Bypass for Automation) lets Lighthouse in.
 */
const base = (process.env.PREVIEW_URL || '').replace(/\/$/, '');
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

module.exports = {
  ci: {
    collect: {
      url: [
        `${base}/`,
        `${base}/cities/frederick/breweries`,
        `${base}/breweries/7-locks-brewing`,
      ],
      numberOfRuns: 3,
      settings: {
        // Lighthouse's default form factor and throttling are mobile
        ...(bypass
          ? {
              extraHeaders: {
                'x-vercel-protection-bypass': bypass,
                'x-vercel-set-bypass-cookie': 'true',
              },
            }
          : {}),
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.05 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
      },
    },
    // Reports stay in the workflow (artifact), not public storage: previews are access-protected
    upload: { target: 'filesystem', outputDir: '.lighthouseci' },
  },
};
