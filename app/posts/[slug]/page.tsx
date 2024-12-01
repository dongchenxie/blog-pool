import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Post from '@/models/Post';
import connectDB from '@/lib/mongodb';
import { headers } from 'next/headers';

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const headersList = await headers();
  const domain = headersList.get('host') || '';
  console.log(domain)
  await connectDB();
  const post = await Post.findOne({ slug: params.slug, domain });
  console.log(post)
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.content.substring(0, 155) + '...',
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 155) + '...',
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      authors: [post.author],
      images: [
        {
          url: `/blog/${post.slug}/og-image.jpg`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.content.substring(0, 155) + '...',
    },
  };
}

export default async function BlogPost({ params }: any) {
  const headersList = await headers();
  const domain = headersList.get('host') || '';
  await connectDB();
  const post = await Post.findOne({ slug: params.slug, domain });

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-8 prose lg:prose-xl">
      <h1>{post.title}</h1>
      <div className="text-gray-600">
        By {post.author} on {new Date(post.createdAt).toLocaleDateString()}
      </div>
      <div className="mt-8">{post.content}</div>
    </article>
  );
}