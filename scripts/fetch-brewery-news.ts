/**
 * Fetch brewery news articles from Google News RSS
 * 
 * Usage:
 *   npx tsx scripts/fetch-brewery-news.ts                    # Normal run
 *   npx tsx scripts/fetch-brewery-news.ts --dry-run          # Test without saving
 *   npx tsx scripts/fetch-brewery-news.ts --force            # Update all breweries
 *   npx tsx scripts/fetch-brewery-news.ts --limit 10         # Limit to 10 breweries
 *   npx tsx scripts/fetch-brewery-news.ts --brewery "Name"   # Single brewery
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import Parser from 'rss-parser';
import { supabaseAdmin, DatabaseBreweryArticle } from '../lib/supabase';
import { getBreweryDataFromSupabase } from '../lib/supabase-client';

const parser = new Parser();

// Maryland news sources for relevance scoring
const MARYLAND_NEWS_SOURCES = [
  'baltimoresun.com',
  'washingtonpost.com',
  'baltimorebrew.com',
  'dcist.com',
  'marylandmatters.org',
  'wtop.com',
  'wbal.com',
  'wjz.com',
  'foxbaltimore.com',
  'cbsnews.com/baltimore',
  'nbcwashington.com',
  'abc7news.com',
];

// Beer-related keywords for relevance scoring
const BEER_KEYWORDS = [
  'beer', 'brewery', 'brewing', 'brewer', 'ale', 'lager', 'ipa', 'stout', 'porter',
  'craft beer', 'microbrewery', 'taproom', 'brewpub', 'hops', 'malt', 'fermentation'
];

/**
 * Calculate relevance score for an article
 */
function calculateRelevanceScore(
  article: any,
  breweryName: string
): number {
  let score = 0.5; // Base score

  const title = (article.title || '').toLowerCase();
  const description = (article.contentSnippet || article.content || '').toLowerCase();
  const source = (article.link || '').toLowerCase();
  const breweryNameLower = breweryName.toLowerCase();

  // Boost if brewery name appears in title (strong signal)
  if (title.includes(breweryNameLower)) {
    score += 0.3;
  }

  // Boost if brewery name appears in description
  if (description.includes(breweryNameLower)) {
    score += 0.2;
  }

  // Boost if from Maryland news source
  const isMarylandSource = MARYLAND_NEWS_SOURCES.some(mdSource => source.includes(mdSource));
  if (isMarylandSource) {
    score += 0.2;
  }

  // Boost if beer-related keywords present
  const beerKeywordCount = BEER_KEYWORDS.filter(keyword => 
    title.includes(keyword.toLowerCase()) || description.includes(keyword.toLowerCase())
  ).length;
  score += Math.min(beerKeywordCount * 0.1, 0.2); // Max 0.2 boost

  // Penalize if very old (older than 1 year = -0.1)
  if (article.pubDate) {
    const pubDate = new Date(article.pubDate);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (pubDate < oneYearAgo) {
      score -= 0.1;
    }
  }

  return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
}

/**
 * Fetch articles from Google News RSS
 */
async function fetchGoogleNewsArticles(breweryName: string): Promise<any[]> {
  try {
    const query = `"${breweryName}" Maryland brewery`;
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    
    console.log(`  📰 Fetching: ${rssUrl}`);
    
    const feed = await parser.parseURL(rssUrl);
    
    if (!feed.items || feed.items.length === 0) {
      console.log(`  ⚠️  No articles found`);
      return [];
    }

    return feed.items;
  } catch (error) {
    console.error(`  ❌ Error fetching RSS feed:`, error);
    return [];
  }
}

/**
 * Extract image URL from article content
 */
function extractImageUrl(article: any): string | null {
  // Try content:encoded first (Google News format)
  if (article['content:encoded']) {
    const contentMatch = article['content:encoded'].match(/<img[^>]+src="([^"]+)"/i);
    if (contentMatch && contentMatch[1]) {
      return contentMatch[1];
    }
  }

  // Try content field
  if (article.content) {
    const contentMatch = article.content.match(/<img[^>]+src="([^"]+)"/i);
    if (contentMatch && contentMatch[1]) {
      return contentMatch[1];
    }
  }

  // Try enclosure (for media RSS)
  if (article.enclosure && article.enclosure.type?.startsWith('image/')) {
    return article.enclosure.url;
  }

  return null;
}

/**
 * Process and save articles for a brewery
 */
async function processBreweryArticles(
  breweryId: string,
  breweryName: string,
  dryRun: boolean = false
): Promise<number> {
  console.log(`\n🍺 Processing: ${breweryName} (${breweryId})`);

  // Fetch articles from Google News
  const articles = await fetchGoogleNewsArticles(breweryName);
  
  if (articles.length === 0) {
    return 0;
  }

  // Process and score articles
  const processedArticles: DatabaseBreweryArticle[] = [];
  const seenUrls = new Set<string>();

  for (const article of articles) {
    if (!article.link || !article.title) {
      continue;
    }

    // Deduplicate by URL
    if (seenUrls.has(article.link)) {
      continue;
    }
    seenUrls.add(article.link);

    // Calculate relevance score
    const relevanceScore = calculateRelevanceScore(article, breweryName);

    // Filter by relevance (only keep articles with score > 0.4)
    if (relevanceScore <= 0.4) {
      continue;
    }

    // Extract source from link
    let source: string | undefined;
    try {
      const url = new URL(article.link);
      source = url.hostname.replace('www.', '');
    } catch (e) {
      // Invalid URL, skip
      continue;
    }

    // Parse published date
    let publishedAt: string | undefined;
    if (article.pubDate) {
      try {
        publishedAt = new Date(article.pubDate).toISOString();
      } catch (e) {
        // Invalid date, continue without it
      }
    }

    const processedArticle: DatabaseBreweryArticle = {
      brewery_id: breweryId,
      title: article.title,
      description: article.contentSnippet || article.content?.substring(0, 500) || undefined,
      url: article.link,
      source: source,
      author: article.creator || undefined,
      image_url: extractImageUrl(article) || undefined,
      published_at: publishedAt,
      relevance_score: relevanceScore,
      fetched_at: new Date().toISOString(),
    };

    processedArticles.push(processedArticle);
  }

  // Sort by relevance score (highest first)
  processedArticles.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

  // Keep top 10 articles
  const topArticles = processedArticles.slice(0, 10);

  console.log(`  ✅ Found ${topArticles.length} relevant articles`);

  if (dryRun) {
    console.log(`  🔍 DRY RUN - Would save ${topArticles.length} articles:`);
    topArticles.forEach((article, idx) => {
      console.log(`    ${idx + 1}. ${article.title} (score: ${article.relevance_score?.toFixed(2)})`);
      console.log(`       ${article.url}`);
    });
    return topArticles.length;
  }

  // Upsert articles to Supabase
  if (topArticles.length > 0) {
    const { error } = await supabaseAdmin!
      .from('brewery_articles')
      .upsert(topArticles, {
        onConflict: 'brewery_id,url',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error(`  ❌ Error saving articles:`, error);
      return 0;
    }

    // Update brewery's articles_last_updated timestamp
    await supabaseAdmin!
      .from('breweries')
      .update({ articles_last_updated: new Date().toISOString() })
      .eq('id', breweryId);
  }

  return topArticles.length;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const breweryArg = args.find(a => a.startsWith('--brewery='));

  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;
  const breweryName = breweryArg ? breweryArg.split('=')[1] : undefined;

  console.log('📰 Brewery News Fetcher');
  console.log('======================');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  if (force) console.log('Force: Updating all breweries (ignoring 7-day limit)');
  if (limit) console.log(`Limit: Processing ${limit} breweries`);
  if (breweryName) console.log(`Brewery: ${breweryName}`);

  try {
    // Fetch breweries from Supabase
    const breweries = await getBreweryDataFromSupabase();

    if (!breweries || breweries.length === 0) {
      console.error('❌ No breweries found in database');
      process.exit(1);
    }

    console.log(`\n📊 Found ${breweries.length} breweries in database`);

    // Filter breweries
    let filteredBreweries = breweries;

    // Filter by brewery name if specified
    if (breweryName) {
      filteredBreweries = filteredBreweries.filter(b => 
        b.name.toLowerCase().includes(breweryName.toLowerCase())
      );
      if (filteredBreweries.length === 0) {
        console.error(`❌ No brewery found matching "${breweryName}"`);
        process.exit(1);
      }
    }

    // Filter by 7-day limit unless force flag is set
    if (!force) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      filteredBreweries = filteredBreweries.filter(brewery => {
        if (!brewery.articles_last_updated) {
          return true; // Never updated, include it
        }
        const lastUpdated = new Date(brewery.articles_last_updated);
        return lastUpdated < sevenDaysAgo;
      });
    }

    // Apply limit if specified
    if (limit) {
      filteredBreweries = filteredBreweries.slice(0, limit);
    }

    console.log(`\n🔄 Processing ${filteredBreweries.length} breweries...\n`);

    let totalArticles = 0;
    let processedCount = 0;

    for (const brewery of filteredBreweries) {
      const articleCount = await processBreweryArticles(
        brewery.id,
        brewery.name,
        dryRun
      );
      totalArticles += articleCount;
      processedCount++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ Complete!`);
    console.log(`   Processed: ${processedCount} breweries`);
    console.log(`   Articles: ${totalArticles} total`);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

