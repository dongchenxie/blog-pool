import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import Post from '@/models/Post'
import connectDB from '@/lib/mongodb'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers()
  const domain = headersList.get('host') || ''
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = `${protocol}://${domain}`

  await connectDB();
  const posts = await Post.find({ domain });
  
  // Generate entries for blog posts
  const blogPosts = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.updatedAt).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Add static pages specific to this domain
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
  ];
 
  return [...staticPages, ...blogPosts]
}