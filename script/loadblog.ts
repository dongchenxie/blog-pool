import mongoose from 'mongoose';
import OpenAI from 'openai';
import Domain from '../models/Domain';
import Post from '../models/Post';
import { scrapeWebsite } from './scraper';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini-2024-07-18';

interface BlogConfig {
  domains: string[];
  clientDomains: string[];
  titles: string[];
  descriptions: string[];
  keywords: string[];
  totalPosts: number;
  threadCount: number;
  sectionRange: { min: number; max: number };
  subsectionRange: { min: number; max: number };
}

function getRandomItems<T>(array: T[], min: number = 1, max: number = array.length): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function generateBlogOutline(keywords: string[], config: BlogConfig): Promise<string> {
  const outlinePrompt = `Create a detailed outline for a comprehensive blog post about ${keywords.join(', ')}.
  
  Requirements:
  1. Include a main title
  2. Create a detailed table of contents with ${config.sectionRange.min}-${config.sectionRange.max} major sections
  3. Each major section should have ${config.subsectionRange.min}-${config.subsectionRange.max} subsections
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
    model: OPENAI_MODEL,
    temperature: 0.7,
  });

  // Enhanced cleanup
  let outline = outlineCompletion.choices[0]?.message?.content || '';
  outline = outline
    .replace(/```html\s*/gi, '')  // Remove ```html with any whitespace
    .replace(/```\s*/g, '')       // Remove ``` with any whitespace
    .replace(/^\s+|\s+$/g, '');   // Trim whitespace

  return outline;
}

async function generateSectionContent(
  section: string,
  keywords: string[],
  ourDomain: string,
  clientDomains: string[],
  scrapedContents: string[],
  config: BlogConfig
): Promise<string> {
  // Use config values for subsection count
  const subsectionsPrompt = `Create ${config.subsectionRange.min}-${config.subsectionRange.max} detailed subsection titles for the section "${section}" about ${keywords.join(', ')}.
  Return only the subsection titles, one per line.`;

  const subsectionsCompletion = await openai.chat.completions.create({
    messages: [
      { 
        role: "system", 
        content: "You are a content organizer. Return only subsection titles, one per line."
      },
      { 
        role: "user", 
        content: subsectionsPrompt 
      }
    ],
    model: OPENAI_MODEL,
    temperature: 0.7,
  });

  const subsectionTitles = subsectionsCompletion.choices[0]?.message?.content
    ?.split('\n')
    .filter(title => title.trim()) || [];

  // Generate content for each subsection
  const subsectionContents = await Promise.all(subsectionTitles.map(async (subsectionTitle) => {
    const subsectionPrompt = `Write detailed content for the subsection "${subsectionTitle}" within the main section "${section}" about ${keywords.join(', ')}.
    Use this related content as context: ${scrapedContents.join('\n\n')}

    Requirements:
    - Begin with core concepts
    - Provide detailed explanations
    - Include specific examples
    - Add practical applications
    - Address common questions
    
    Format Requirements:
    - Use ONLY HTML tags
    - Use <h3> for the subsection title
    - Use <p> for paragraphs
    - Use appropriate HTML elements for structure
    - Include at least one special element (pro-tip, case study, or key insight)
    
    Integration Requirements:
    - Reference ${ourDomain} naturally where relevant
    - Mention ${clientDomains.join(', ')} when discussing specific products
    - Include data-backed claims`;

    const subsectionCompletion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are an expert content writer creating detailed, engaging subsection content."
        },
        { 
          role: "user", 
          content: subsectionPrompt 
        }
      ],
      model: OPENAI_MODEL,
      temperature: 0.7,
    });

    return subsectionCompletion.choices[0]?.message?.content || '';
  }));

  // Combine section content
  const sectionContent = `
    <h2>${section}</h2>
    ${subsectionContents.join('\n\n')}
  `;

  return sectionContent.trim();
}

async function generateBlogPost(keywords: string[], ourDomain: string, clientDomains: string[], config: BlogConfig): Promise<{
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
  const outline = await generateBlogOutline(keywords, config);
  
  // Parse the outline to extract sections (you'll need to implement this based on your outline structure)
  const sections = outline.match(/<h2>(.*?)<\/h2>/g)?.map(section => 
    section.replace(/<h2>|<\/h2>/g, '').trim()
  ) || [];

  // Generate content for each section
  const sectionContents = await Promise.all(
    sections.map(section => 
      generateSectionContent(section, keywords, ourDomain, selectedClientDomains, scrapedContents, config)
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
    const post = await generateBlogPost(selectedKeywords, domain, config.clientDomains, config);

    await Post.create({
      title: post.title,
      content: post.content,
      slug: post.slug,
      author: 'mini dsfds18',
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
    'https://learn.lovevery.com/',
    'https://lovevery.com/products/',
  ],
  titles: [
    'Baby Development Guide',
    'Early Learning Resources',
    'Parenting Tips & Tricks',
    'Child Development Blog',
    'Educational Toy Reviews',
  ],
  descriptions: [
    'Your trusted guide to child development and educational toys',
    'Expert advice on early childhood learning and development',
    'Comprehensive resources for conscious parenting',
    'Research-backed insights into child growth and play',
  ],
  keywords: [
    'Baby Development',
    'Educational Toys',
    'Early Learning',
    'Montessori Play',
    'Child Development',
    'Sensory Activities',
    'Motor Skills',
    'Developmental Milestones',
    'Learning Through Play',
    'Baby Safety',
  ],
  totalPosts: 2,
  threadCount: 3, // Configurable thread count
  sectionRange: { min: 5, max: 10 },
  subsectionRange: { min: 5, max: 10 },
};

// Run the script
generateAndSavePosts(blogConfig);
