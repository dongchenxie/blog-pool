import mongoose from 'mongoose';
import Post from '../models/Post';
import Domain from '../models/Domain';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/blog';

const domains = Array.from({ length: 20 }, (_, i) => ({
  domain: `blog${i + 1}.localhost:3000`,
  title: `Blog ${i + 1}`,
  description: `Description for Blog ${i + 1}`
}));

const createSamplePosts = (domain: string) => [
  {
    title: `Getting Started with Next.js - ${domain}`,
    content: `Next.js has revolutionized the way we build React applications. In this comprehensive guide, we'll explore everything you need to know to get started with Next.js.`,
    slug: `getting-started-with-nextjs-${domain}`,
    author: "John Doe",
    domain,
  },
  {
    title: `Understanding TypeScript - ${domain}`,
    content: `TypeScript has become an essential tool in modern web development, providing static typing and enhanced developer experience for JavaScript projects.`,
    slug: `understanding-typescript-${domain}`,
    author: "Jane Smith",
    domain,
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Domain.deleteMany({});
    await Post.deleteMany({});
    console.log('Cleared existing data');

    // Create domains
    const createdDomains = await Domain.create(domains);
    console.log(`Created ${createdDomains.length} domains`);

    // Create posts for each domain
    for (const domain of domains) {
      const posts = createSamplePosts(domain.domain);
      await Post.create(posts);
      console.log(`Created ${posts.length} posts for ${domain.domain}`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();