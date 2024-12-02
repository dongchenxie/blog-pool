import mongoose from 'mongoose';
import OpenAI from 'openai';
import Domain from '../models/Domain';
import Post from '../models/Post';
import { scrapeWebsite } from './scraper';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

interface BlogConfig {
  domains: string[];
  clientDomains: string[];
  titles: string[];
  descriptions: string[];
  keywords: string[];
  totalPosts: number;
  threadCount: number; // Added for configuring thread count
}

function getRandomItems<T>(array: T[], min: number = 1, max: number = array.length): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function generateBlogOutline(keywords: string[]): Promise<string> {
  const outlinePrompt = `Create a detailed outline for a comprehensive blog post about ${keywords.join(', ')}.
  
  Requirements:
  1. Include a main title
  2. Create a detailed table of contents with major sections and subsections
  3. Each keyword should have its own major section with 3-4 subsections
  4. Include placeholders for:
     - Did You Know sections
     - Pro Tips
     - Common Questions
     - Quick Reference Guides
     - Further Reading
  
  IMPORTANT: Do not include any markdown formatting or \`\`\`html tags.
  Format the output directly in HTML using:
  - <h1> for main title
  - <h2> for major sections
  - <h3> for subsections
  - <ul> and <li> for table of contents
  
  Example format:
  <h1>Main Title</h1>
  <ul>
    <li><h2>Major Section</h2></li>
    <li><h3>Subsection</h3></li>
  </ul>`;

  const outlineCompletion = await openai.chat.completions.create({
    messages: [
      { 
        role: "system", 
        content: "You are a content outliner. Always respond with clean HTML without any markdown formatting or code blocks. Never include ```html tags in your response."
      },
      { 
        role: "user", 
        content: outlinePrompt 
      }
    ],
    model: "gpt-4-turbo-preview",
    temperature: 0.7,
  });

  // Clean up any potential markdown artifacts
  let outline = outlineCompletion.choices[0]?.message?.content || '';
  outline = outline.replace(/```html/g, '').replace(/```/g, '').trim();

  return outline;
}

async function generateSectionContent(
  section: string,
  keywords: string[],
  ourDomain: string,
  clientDomains: string[],
  scrapedContents: string[]
): Promise<string> {
  const sectionPrompt = `Write a comprehensive, in-depth section about "${section}" for a blog post about ${keywords.join(', ')}.
  Use this related content as context: ${scrapedContents.join('\n\n')}

  Content Strategy:
  1. Start with a thorough introduction explaining why this topic matters
  2. Break down each major concept into multiple detailed subsections
  3. For each subsection:
     - Begin with core concepts
     - Expand with detailed explanations
     - Provide specific examples
     - Include practical applications
     - Address common questions
  4. Include diverse content types:
     - Step-by-step guides
     - Detailed case studies
     - Expert analysis
     - Product comparisons
     - Industry research findings
     - Historical context and future predictions
     - Troubleshooting guides
     - Best practices and recommendations
  
  Format Requirements:
  - Use ONLY HTML tags (no markdown)
  - Use proper heading hierarchy (<h2>, <h3>, etc.)
  - Use <p> for paragraphs
  - Use <table> for comparison tables
  - Use <div class="pro-tip"> for pro tips
  - Use <div class="did-you-know"> for facts
  - Use <blockquote> for expert quotes
  - Use <ul> and <ol> for lists
  - Use <div class="case-study"> for case studies
  - Use <div class="key-insight"> for important findings
  
  Integration Requirements:
  - Naturally incorporate links to ${ourDomain} where relevant
  - Reference ${clientDomains.join(', ')} when discussing specific products or solutions
  - Include data-backed claims and statistics
  - Add comparison tables when discussing multiple options
  - Embed expert quotes to support key points`;

  const sectionCompletion = await openai.chat.completions.create({
    messages: [{ 
      role: "system", 
      content: "You are an expert content writer who creates comprehensive, engaging, and detailed content. Your writing is thorough and covers topics from multiple angles, always providing deep insights and practical value."
    },
    { 
      role: "user", 
      content: sectionPrompt 
    }],
    model: "gpt-4-turbo-preview",
    temperature: 0.7,
  });

  return sectionCompletion.choices[0]?.message?.content || '';
}

async function generateBlogPost(keywords: string[], ourDomain: string, clientDomains: string[]): Promise<{
  title: string;
  content: string;
  slug: string;
}> {
  const selectedClientDomains = getRandomItems(clientDomains, 1, 2);
  const scrapedContents = await Promise.all(
    selectedClientDomains.map(async (domain) => {
      const content = await scrapeWebsite(`https://${domain}`);
      return content.substring(0, 1000);
    })
  );

  // Get the outline first
  const outline = await generateBlogOutline(keywords);
  
  // Parse the outline to extract sections (you'll need to implement this based on your outline structure)
  const sections = outline.match(/<h2>(.*?)<\/h2>/g)?.map(section => 
    section.replace(/<h2>|<\/h2>/g, '').trim()
  ) || [];

  // Generate content for each section
  const sectionContents = await Promise.all(
    sections.map(section => 
      generateSectionContent(section, keywords, ourDomain, selectedClientDomains, scrapedContents)
    )
  );

  // Combine everything
  const title = outline.match(/<h1>(.*?)<\/h1>/)?.[1] || `${keywords[0]} Guide`;
  const content = `
    ${outline}
    ${sectionContents.join('\n\n')}
    <h2>Key Takeaways</h2>
    <ul>
      ${keywords.map(kw => `<li>Key insights about ${kw}</li>`).join('\n')}
    </ul>
  `;

  const slug = `${keywords[0].toLowerCase().replace(/\s+/g, '-')}-guide-${Date.now()}`;

  return { title, content, slug };
}

async function createDomain(domain: string, title: string, description: string) {
  try {
    const existingDomain = await Domain.findOne({ domain });
    if (!existingDomain) {
      await Domain.create({ domain, title, description });
      console.log(`Created domain: ${domain}`);
    }
  } catch (error) {
    console.error('Error creating domain:', error);
    throw error;
  }
}

async function generatePostsForDomain(domain: string, config: BlogConfig) {
  const title = getRandomItems(config.titles, 1)[0];
  const description = getRandomItems(config.descriptions, 1)[0];

  await createDomain(domain, title, description);

  const postTasks = Array.from({ length: config.totalPosts }, async (_, index) => {
    const selectedKeywords = getRandomItems(config.keywords, 2, 4);
    console.log(`Generating post ${index + 1} for ${domain} with keywords: ${selectedKeywords.join(', ')}`);
    const post = await generateBlogPost(selectedKeywords, domain, config.clientDomains);

    await Post.create({
      title: post.title,
      content: post.content,
      slug: post.slug,
      author: 'mini 2024-07-18',
      domain,
    });

    console.log(`Created post: ${post.title}`);
  });

  await Promise.all(postTasks);
}

async function generateAndSavePosts(config: BlogConfig) {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const domainBatches = config.domains.reduce((batches, domain, index) => {
      const batchIndex = Math.floor(index / config.threadCount);
      if (!batches[batchIndex]) {
        batches[batchIndex] = [];
      }
      batches[batchIndex].push(domain);
      return batches;
    }, [] as string[][]);

    for (const batch of domainBatches) {
      await Promise.all(batch.map((domain) => generatePostsForDomain(domain, config)));
    }

    console.log('All posts generated and saved successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Updated configuration
const blogConfig: BlogConfig = {
  domains: [
    // "newyork.sextoyforyou.com",
    // 'canada.bookstorynest.com',
    'beijing.fowardmedia.net',
  ],
  clientDomains: [
    'sextoyforyou.com',
    'sextoyforyou.com/product/miaomiss-cat-beard-mouth-gag/',
    'sextoyforyou.com/product/thunder-automatic-male-masturbator/',
  ],
  titles: [
    'Adult Wellness Guide',
    'Intimate Lifestyle Blog',
    'Pleasure & Wellness Hub',
    'Adult Product Reviews',
  ],
  descriptions: [
    'Your guide to intimate wellness and adult products',
    'Exploring intimate wellness and relationship advice',
    'Expert reviews and guides for adult products',
    'Comprehensive information about intimate wellness',
  ],
  keywords: [
    'Adult Toys',
    'Intimate Wellness',
    'Couples Products',
    'Personal Massagers',
    'Relationship Wellness',
    'Adult Accessories',
    'Intimate Health',
    'Product Reviews',
  ],
  totalPosts: 2,
  threadCount: 3, // Configurable thread count
};

// Run the script
generateAndSavePosts(blogConfig);
