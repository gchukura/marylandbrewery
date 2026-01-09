/**
 * Internal Link Validator for Next.js
 * 
 * This script scans all TSX/TS files for internal links and validates
 * that they point to existing routes in the app directory.
 * 
 * Usage: npx tsx scripts/validate-internal-links.ts
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';

const APP_DIR = join(process.cwd(), 'src/app');
const SRC_DIR = join(process.cwd(), 'src');

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

interface LinkInfo {
  file: string;
  line: number;
  href: string;
}

interface ValidationResult {
  valid: LinkInfo[];
  invalid: LinkInfo[];
  warnings: LinkInfo[];
}

/**
 * Get all valid routes from the app directory
 */
function getValidRoutes(): Set<string> {
  const routes = new Set<string>();
  
  function scanDirectory(dir: string, basePath: string = '') {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip private folders (starting with _) and special folders
        if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
        
        // Handle dynamic routes
        let routeSegment = entry.name;
        if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
          // Dynamic segment - will match any value
          routeSegment = ':dynamic';
        }
        
        const newPath = basePath ? `${basePath}/${routeSegment}` : `/${routeSegment}`;
        
        // Check if this directory has a page.tsx
        const hasPage = existsSync(join(fullPath, 'page.tsx')) || 
                       existsSync(join(fullPath, 'page.ts'));
        
        if (hasPage) {
          // Add the route (normalize dynamic segments for matching)
          routes.add(newPath.replace(/:dynamic/g, '*'));
        }
        
        scanDirectory(fullPath, newPath);
      }
    }
  }
  
  // Add root route
  if (existsSync(join(APP_DIR, 'page.tsx'))) {
    routes.add('/');
  }
  
  scanDirectory(APP_DIR);
  
  return routes;
}

/**
 * Extract all internal links from source files
 */
function extractLinks(): LinkInfo[] {
  const links: LinkInfo[] = [];
  
  // Patterns to match href values in Link components and anchor tags
  const hrefPatterns = [
    /href=["']([^"']+)["']/g,        // href="..." or href='...'
    /href=\{["']([^"']+)["']\}/g,    // href={"..."} or href={'...'}
    /href=\{`([^`]+)`\}/g,           // href={`...`} (template literals without expressions)
  ];
  
  function scanFile(filePath: string) {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      
      for (const pattern of hrefPatterns) {
        pattern.lastIndex = 0; // Reset regex state
        let match;
        
        while ((match = pattern.exec(line)) !== null) {
          const href = match[1];
          
          // Only check internal links (starting with /)
          if (href.startsWith('/') && !href.startsWith('//')) {
            // Skip external protocol links and anchors
            if (!href.includes('://') && !href.startsWith('/#')) {
              links.push({
                file: relative(process.cwd(), filePath),
                line: lineNum + 1,
                href: href,
              });
            }
          }
        }
      }
    }
  }
  
  function scanDirectory(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        scanDirectory(fullPath);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        scanFile(fullPath);
      }
    }
  }
  
  scanDirectory(SRC_DIR);
  
  return links;
}

/**
 * Check if a link matches any valid route
 */
function isValidRoute(href: string, routes: Set<string>): boolean {
  // Remove query string and hash
  const cleanHref = href.split('?')[0].split('#')[0];
  
  // Exact match
  if (routes.has(cleanHref)) return true;
  
  // Check against wildcard patterns (for dynamic routes)
  for (const route of routes) {
    if (route.includes('*')) {
      // Convert route pattern to regex
      const pattern = route
        .replace(/\*/g, '[^/]+')  // Replace * with segment match
        .replace(/\//g, '\\/');    // Escape slashes
      
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(cleanHref)) return true;
    }
  }
  
  return false;
}

/**
 * Check for known special routes that might not have page.tsx
 */
function isSpecialRoute(href: string): boolean {
  const specialRoutes = [
    '/opengraph-image',
    '/twitter-image',
    '/sitemap.xml',
    '/robots.txt',
    '/manifest.json',
    '/api/',
  ];
  
  return specialRoutes.some(route => href.startsWith(route) || href === route.replace('.xml', '').replace('.txt', '').replace('.json', ''));
}

/**
 * Check for static files in public directory
 */
function isStaticFile(href: string): boolean {
  const publicPath = join(process.cwd(), 'public', href);
  return existsSync(publicPath);
}

/**
 * Main validation function
 */
function validateLinks(): ValidationResult {
  console.log(`${colors.blue}🔍 Scanning for internal links...${colors.reset}\n`);
  
  const routes = getValidRoutes();
  const links = extractLinks();
  
  console.log(`${colors.blue}📁 Found ${routes.size} valid routes${colors.reset}`);
  console.log(`${colors.blue}🔗 Found ${links.length} internal links to validate${colors.reset}\n`);
  
  const result: ValidationResult = {
    valid: [],
    invalid: [],
    warnings: [],
  };
  
  // Track unique links to avoid duplicate reports
  const uniqueLinks = new Map<string, LinkInfo>();
  
  for (const link of links) {
    const key = link.href;
    if (!uniqueLinks.has(key)) {
      uniqueLinks.set(key, link);
    }
  }
  
  for (const [href, linkInfo] of uniqueLinks) {
    // Check if it's a valid route
    if (isValidRoute(href, routes)) {
      result.valid.push(linkInfo);
    } else if (isSpecialRoute(href)) {
      // Special routes (API, sitemap, etc.)
      result.valid.push(linkInfo);
    } else if (isStaticFile(href)) {
      // Static files in public folder
      result.valid.push(linkInfo);
    } else if (href.includes('${') || href.includes('`')) {
      // Dynamic template literal - can't validate statically
      result.warnings.push(linkInfo);
    } else {
      result.invalid.push(linkInfo);
    }
  }
  
  return result;
}

/**
 * Print results
 */
function printResults(result: ValidationResult): void {
  if (result.invalid.length > 0) {
    console.log(`${colors.red}❌ INVALID LINKS (${result.invalid.length}):${colors.reset}`);
    for (const link of result.invalid) {
      console.log(`   ${colors.red}${link.href}${colors.reset}`);
      console.log(`      └─ ${link.file}:${link.line}`);
    }
    console.log();
  }
  
  if (result.warnings.length > 0) {
    console.log(`${colors.yellow}⚠️  WARNINGS - Dynamic links (cannot validate statically):${colors.reset}`);
    for (const link of result.warnings) {
      console.log(`   ${colors.yellow}${link.href}${colors.reset}`);
      console.log(`      └─ ${link.file}:${link.line}`);
    }
    console.log();
  }
  
  console.log(`${colors.green}✅ Valid links: ${result.valid.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${result.warnings.length}${colors.reset}`);
  console.log(`${colors.red}❌ Invalid links: ${result.invalid.length}${colors.reset}`);
  console.log();
  
  if (result.invalid.length === 0) {
    console.log(`${colors.green}🎉 All static internal links are valid!${colors.reset}`);
  } else {
    console.log(`${colors.red}💥 Found ${result.invalid.length} broken link(s). Please fix before deploying.${colors.reset}`);
  }
}

// Run validation
const result = validateLinks();
printResults(result);

// Exit with error code if invalid links found
if (result.invalid.length > 0) {
  process.exit(1);
}

