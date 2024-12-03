import Link from 'next/link';
import { IPost } from '@/models/Post';
import { generateThemeFromHost } from '@/utils/styleUtils';

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export default function PostCard({ post, host }: { post: IPost; host: string }) {
  const theme = generateThemeFromHost(host);
  const cleanContent = stripHtmlTags(post.content);
  
  return (
    <div 
      style={{
        border: `2px solid ${theme.primary}`,
        borderRadius: theme.borderRadius,
        padding: theme.spacing,
        marginBottom: theme.spacing,
        backgroundColor: theme.background,
        fontFamily: theme.fontFamily,
        transition: 'all 0.3s ease',
      }}
    >
      <Link href={`/posts/${post.slug}`}>
        <h2 style={{ 
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: theme.spacing,
          color: theme.primary 
        }}>
          {post.title}
        </h2>
        <p style={{ 
          color: theme.secondary,
          marginBottom: theme.spacing
        }}>
          By {post.author} on {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <p style={{ color: theme.text }}>
          {cleanContent.substring(0, 150)}...
        </p>
      </Link>
    </div>
  );
}
