import Link from 'next/link';
import { IPost } from '@/models/Post';

export default function PostCard({ post }: { post: IPost }) {
  return (
    <div className="border rounded-lg p-4 mb-4 hover:shadow-lg transition-shadow">
      <Link href={`/posts/${post.slug}`}>
        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
        <p className="text-gray-600 mb-2">
          By {post.author} on {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <p className="text-gray-800">
          {post.content.substring(0, 150)}...
        </p>
      </Link>
    </div>
  );
}
