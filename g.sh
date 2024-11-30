#!/bin/bash

# Create models directory if it doesn't exist
mkdir -p models

# Create Domain model
cat > models/Domain.ts << 'EOL'
import mongoose from 'mongoose';

export interface IDomain {
  domain: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const DomainSchema = new mongoose.Schema<IDomain>({
  domain: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Domain || mongoose.model<IDomain>('Domain', DomainSchema);
EOL

# Create API directory structure
mkdir -p app/api/admin/domains

# Create domain management API route
cat > app/api/admin/domains/route.ts << 'EOL'
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Domain from '@/models/Domain';
import Post from '@/models/Post';

async function isLocalhost(request: Request) {
  const headersList = headers();
  const host = headersList.get('host') || '';
  return host.includes('localhost') || host.includes('127.0.0.1');
}

export async function GET() {
  try {
    if (!await isLocalhost(Request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const domains = await Domain.find({});
    return NextResponse.json(domains);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch domains',
      details: (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!await isLocalhost(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();
    const domain = await Domain.create(body);
    return NextResponse.json(domain, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to create domain',
      details: (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!await isLocalhost(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
    }

    await connectDB();
    await Domain.deleteOne({ domain });
    // Also delete all posts for this domain
    await Post.deleteMany({ domain });
    
    return NextResponse.json({ message: 'Domain deleted successfully' });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to delete domain',
      details: (error as Error).message 
    }, { status: 500 });
  }
}
EOL

# Update seed script
cat > script/seed.ts << 'EOL'
import mongoose from 'mongoose';
import Post from '../models/Post';
import Domain from '../models/Domain';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/blog';

const domains = [
  {
    domain: 'localhost:3000',
    title: 'Main Tech Blog',
    description: 'The main technical blog about web development'
  },
  {
    domain: 'blog1.localhost:3000',
    title: 'Design Blog',
    description: 'Blog about UI/UX design'
  }
];

const createSamplePosts = (domain: string) => [
  {
    title: `Getting Started with Next.js - ${domain}`,
    content: "Next.js is a powerful framework for building React applications...",
    slug: "getting-started-with-nextjs",
    author: "John Doe",
    domain,
  },
  {
    title: `Understanding TypeScript - ${domain}`,
    content: "TypeScript adds static typing to JavaScript...",
    slug: "understanding-typescript",
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
      console.log(`Created posts for ${domain.domain}`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
EOL

# Make the script executable
chmod +x script/seed.ts

echo "Files created successfully!"
echo "Run 'bun run seed' to seed the database with sample domains and posts."