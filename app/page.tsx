import { Suspense } from 'react';
import PostCard from '@/components/PostCard';
import { Metadata } from 'next';
import { headers } from 'next/headers'

// Add interface for Post type

async function getPosts(): Promise<any[]> {
  const res = await fetch('http://localhost:3000/api/posts', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const domain = headersList.get('host') || ''
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = `${protocol}://${domain}`

  return {
    title: 'Latest Blog Posts',
    description: 'Read the latest articles about web development, programming tips, and tech insights.',
    openGraph: {
      title: 'Latest Blog Posts | My Tech Blog',
      description: 'Read the latest articles about web development, programming tips, and tech insights.',
      images: [
        {
          url: '/home-og-image.jpg',
          width: 1200,
          height: 630,
        },
      ],
    },
  }
}

export default async function Home() {
  const posts = await getPosts();
  const headersList = await headers()
  const domain = headersList.get('host') || ''
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Blog {domain}</h1>
      <div className="grid gap-6">
        <Suspense fallback={<div>Loading...</div>}>
          {posts.map((post: any) => (
            <PostCard key={post._id} post={post} />
          ))}
        </Suspense>
      </div>
    </div>
  );
}
