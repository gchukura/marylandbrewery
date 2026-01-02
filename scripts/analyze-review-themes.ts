/**
 * Analyze Common Themes in Google Reviews
 * 
 * This script analyzes Google review text to identify the most common
 * themes and topics mentioned by reviewers.
 * 
 * Usage:
 *   npx tsx scripts/analyze-review-themes.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFile } from 'fs/promises';
import { join } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

async function analyzeReviewThemes() {
  console.log('🔍 Analyzing Google Reviews for Common Themes...\n');

  // Fetch Google reviews
  const { data: reviews, error } = await supabaseAdmin
    .from('reviews')
    .select('review_text, rating')
    .eq('source', 'google')
    .not('review_text', 'is', null)
    .limit(2000); // Analyze a large sample

  if (error) {
    console.error('❌ Error fetching reviews:', error);
    return;
  }

  if (!reviews || reviews.length === 0) {
    console.log('⚠️  No reviews found');
    return;
  }

  console.log(`📊 Analyzing ${reviews.length} Google reviews...\n`);

  // Define theme keywords (top 5 most relevant themes)
  const themes = {
    'Beer Quality & Selection': [
      'beer', 'brew', 'brews', 'ipa', 'stout', 'lager', 'ale', 'pilsner', 
      'selection', 'variety', 'tasty', 'flavor', 'flavors', 'delicious', 
      'great beer', 'excellent beer', 'amazing beer', 'good beer', 'quality',
      'hoppy', 'smooth', 'unique', 'craft', 'local'
    ],
    'Food & Menu': [
      'food', 'menu', 'pizza', 'burger', 'wings', 'appetizer', 'kitchen',
      'dining', 'meal', 'eat', 'lunch', 'dinner', 'snacks', 'nachos',
      'tacos', 'sandwich', 'salad', 'delicious food', 'good food'
    ],
    'Service & Staff': [
      'service', 'staff', 'bartender', 'server', 'waitress', 'waiter',
      'friendly', 'helpful', 'attentive', 'knowledgeable', 'quick',
      'fast', 'great service', 'excellent service', 'good service'
    ],
    'Atmosphere & Ambiance': [
      'atmosphere', 'vibe', 'ambiance', 'cozy', 'relaxed', 'casual', 
      'friendly', 'welcoming', 'warm', 'comfortable', 'laid back',
      'cool', 'nice place', 'great place', 'awesome place'
    ],
    'Outdoor Seating & Space': [
      'outdoor', 'patio', 'outside', 'deck', 'beer garden', 'outdoor seating',
      'outdoor area', 'outside seating', 'patio seating', 'spacious', 'roomy'
    ]
  };

  // Count theme mentions
  const themeCounts: Record<string, number> = {};
  const themeExamples: Record<string, string[]> = {};
  const themeRatings: Record<string, number[]> = {};

  reviews.forEach(review => {
    if (!review.review_text) return;
    
    const text = review.review_text.toLowerCase();
    const rating = review.rating || 0;

    Object.entries(themes).forEach(([theme, keywords]) => {
      const found = keywords.some(keyword => text.includes(keyword.toLowerCase()));
      if (found) {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        
        // Track ratings for this theme
        if (!themeRatings[theme]) {
          themeRatings[theme] = [];
        }
        themeRatings[theme].push(rating);
        
        // Store example snippets
        if (!themeExamples[theme]) {
          themeExamples[theme] = [];
        }
        if (themeExamples[theme].length < 2) {
          const snippet = review.review_text.substring(0, 120).trim();
          if (snippet && !themeExamples[theme].includes(snippet)) {
            themeExamples[theme].push(snippet);
          }
        }
      }
    });
  });

  // Sort by frequency
  const sortedThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  console.log('═══════════════════════════════════════════════════════');
  console.log('📈 TOP 5 COMMON THEMES IN GOOGLE REVIEWS');
  console.log('═══════════════════════════════════════════════════════\n');

  sortedThemes.forEach(([theme, count], index) => {
    const percentage = ((count / reviews.length) * 100).toFixed(1);
    const avgRating = themeRatings[theme]
      ? (themeRatings[theme].reduce((a, b) => a + b, 0) / themeRatings[theme].length).toFixed(1)
      : 'N/A';
    
    console.log(`${index + 1}. ${theme}`);
    console.log(`   📊 Mentioned in ${count} reviews (${percentage}%)`);
    console.log(`   ⭐ Average rating when mentioned: ${avgRating}`);
    
    if (themeExamples[theme] && themeExamples[theme].length > 0) {
      console.log(`   💬 Example: "${themeExamples[theme][0]}..."`);
    }
    console.log('');
  });

  // Rating distribution
  console.log('═══════════════════════════════════════════════════════');
  console.log('⭐ RATING DISTRIBUTION');
  console.log('═══════════════════════════════════════════════════════\n');

  const ratingCounts: Record<number, number> = {};
  reviews.forEach(r => {
    if (r.rating) {
      ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
    }
  });

  [5, 4, 3, 2, 1].forEach(rating => {
    const count = ratingCounts[rating] || 0;
    const pct = ((count / reviews.length) * 100).toFixed(1);
    const bars = '█'.repeat(Math.round(count / reviews.length * 50));
    console.log(`${rating} stars: ${count.toString().padStart(4)} (${pct.padStart(5)}%) ${bars}`);
  });

  console.log(`\nTotal reviews analyzed: ${reviews.length}`);
  console.log(`Average rating: ${(
    reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
  ).toFixed(2)} stars\n`);

  // Save results to file
  const outputDir = join(process.cwd(), 'scripts', 'output');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputFile = join(outputDir, `review-themes-analysis-${timestamp}.txt`);
  
  // Build output text
  let outputText = '═══════════════════════════════════════════════════════\n';
  outputText += '📈 GOOGLE REVIEWS THEME ANALYSIS\n';
  outputText += `Generated: ${new Date().toLocaleString()}\n`;
  outputText += '═══════════════════════════════════════════════════════\n\n';
  outputText += `Total reviews analyzed: ${reviews.length}\n`;
  outputText += `Average rating: ${(
    reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
  ).toFixed(2)} stars\n\n`;
  
  outputText += '═══════════════════════════════════════════════════════\n';
  outputText += 'TOP 5 COMMON THEMES\n';
  outputText += '═══════════════════════════════════════════════════════\n\n';
  
  sortedThemes.forEach(([theme, count], index) => {
    const percentage = ((count / reviews.length) * 100).toFixed(1);
    const avgRating = themeRatings[theme]
      ? (themeRatings[theme].reduce((a, b) => a + b, 0) / themeRatings[theme].length).toFixed(1)
      : 'N/A';
    
    outputText += `${index + 1}. ${theme}\n`;
    outputText += `   Mentioned in ${count} reviews (${percentage}%)\n`;
    outputText += `   Average rating when mentioned: ${avgRating} stars\n`;
    
    if (themeExamples[theme] && themeExamples[theme].length > 0) {
      outputText += `   Example: "${themeExamples[theme][0]}..."\n`;
    }
    outputText += '\n';
  });
  
  outputText += '═══════════════════════════════════════════════════════\n';
  outputText += 'RATING DISTRIBUTION\n';
  outputText += '═══════════════════════════════════════════════════════\n\n';
  
  [5, 4, 3, 2, 1].forEach(rating => {
    const count = ratingCounts[rating] || 0;
    const pct = ((count / reviews.length) * 100).toFixed(1);
    const bars = '█'.repeat(Math.round(count / reviews.length * 50));
    outputText += `${rating} stars: ${count.toString().padStart(4)} (${pct.padStart(5)}%) ${bars}\n`;
  });
  
  try {
    // Create output directory if it doesn't exist
    const { mkdir } = await import('fs/promises');
    await mkdir(outputDir, { recursive: true });
    
    // Write to file
    await writeFile(outputFile, outputText, 'utf-8');
    console.log(`\n✅ Results saved to: ${outputFile}`);
  } catch (error) {
    console.error('\n⚠️  Could not save results to file:', error instanceof Error ? error.message : 'Unknown error');
    console.log('   Results are still displayed above.');
  }
}

analyzeReviewThemes().catch(console.error);

