import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const domain = searchParams.get('domain') || '';
    const skip = (page - 1) * limit;

    await connectDB();
    
    const [posts, total] = await Promise.all([
      Post.find({ domain })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ domain })
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      }
    });
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