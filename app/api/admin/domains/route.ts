import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Domain from '@/models/Domain';
import Post from '@/models/Post';

async function isLocalhost(request: Request) {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  return host.includes('localhost') || host.includes('127.0.0.1');
}

export async function GET() {
  try {
    // if (!await isLocalhost(Request)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

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
