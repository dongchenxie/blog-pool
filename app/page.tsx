import { Suspense } from 'react';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';
import { Metadata } from 'next';
import { headers } from 'next/headers';

interface PaginatedResponse {
  posts: any[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

async function getPosts(page: number = 1, domain: string): Promise<PaginatedResponse> {
  const res = await fetch(
    `http://localhost:3001/api/posts?page=${page}&limit=5&domain=${encodeURIComponent(domain)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export default async function Home({
  searchParams,
}: any) {
  const currentPage = Number(searchParams.page) || 1;
  const headersList = await headers();
  const domain = headersList.get('host') || '';
  const { posts, pagination } = await getPosts(currentPage, domain);

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams();
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Blog</h1>
      <div className="grid gap-6">
        <Suspense fallback={<div>Loading...</div>}>
          {posts.map((post: any) => (
            <PostCard key={post._id} post={post} host={domain} />
          ))}
        </Suspense>
      </div>
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        host={domain}
        createPageURL={createPageURL}
      />
    </div>
  );
}
