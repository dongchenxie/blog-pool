import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET() {
  try {
    const headersList = await headers();
    const domain = headersList.get('host') || '';
    await connectDB();
    const posts = await Post.find({ domain }).sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch posts',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();
    const post = await Post.create(body);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json({ 
      error: 'Failed to create post',
      details: (error as Error).message 
    }, { status: 500 });
  }
}