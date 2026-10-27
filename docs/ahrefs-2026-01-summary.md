# Ahrefs site audit, 2026-01-07: summary

Baseline from the Ahrefs "all issues" export of www.marylandbrewery.com (the raw CSVs were deleted from the repo on 2026-10-27). Counts are affected pages; link-level counts in brackets.

| Severity | Issue | Pages |
| --- | --- | --- |
| Error | 404 page | 597 (1,916 links) |
| Error | 4XX page in sitemap | 579 |
| Error | Indexable orphan page (no incoming internal links) | 1,426 |
| Error | Page links to a broken page | 338 (1,327 links) |
| Error | Broken redirect | 10 |
| Error | Double slash in URL | 8 (576 links) |
| Error | Non-canonical page in sitemap | 3 |
| Warning | Title too long | 1,025 |
| Warning | Meta description too long | 876 |
| Warning | Page links to a redirect | 578 |
| Warning | 3XX redirect | 15 |
| Warning | Slow page | 24 |
| Warning | Missing alt text | 14 |
| Notice | Structured data fails Google rich-results validation | 374 |
| Notice | Indexable page not in sitemap | 134 |
| Notice | Page in multiple sitemaps | 15 |

Compare against these numbers in the launch QA (docs/launch.md, prompt 12).
