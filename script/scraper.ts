import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

interface ScrapedContent {
  title: string;
  content: string;
  timestamp: number;
}

const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function ensureCacheDir() {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

function getCacheKey(url: string): string {
  return createHash('md5').update(url).digest('hex');
}

async function getCachedContent(url: string): Promise<ScrapedContent | null> {
  try {
    const cacheKey = getCacheKey(url);
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    const content = await fs.readFile(cachePath, 'utf-8');
    const cached = JSON.parse(content) as ScrapedContent;
    
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      return null;
    }
    
    return cached;
  } catch {
    return null;
  }
}

async function setCachedContent(url: string, content: ScrapedContent) {
  const cacheKey = getCacheKey(url);
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
  await fs.writeFile(cachePath, JSON.stringify(content));
}

export async function scrapeWebsite(url: string): Promise<string> {
  await ensureCacheDir();
  
  // Check cache first
  const cached = await getCachedContent(url);
  if (cached) {
    return cached.content;
  }

  // Random user agents to appear more like real browsers
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
  ];

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const html = await response.text();
    
    // Basic HTML parsing to extract content
    const content = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Cache the result
    await setCachedContent(url, {
      title: url,
      content,
      timestamp: Date.now()
    });

    return content;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return '';
  }
}