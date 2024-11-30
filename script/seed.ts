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
    domain: 'design.localhost:3000',
    title: 'Design Blog',
    description: 'Blog about UI/UX design and creative processes'
  },
  {
    domain: 'coding.localhost:3000',
    title: 'Coding Tutorial Blog',
    description: 'Programming tutorials and coding best practices'
  },
  {
    domain: 'devops.localhost:3000',
    title: 'DevOps Central',
    description: 'Everything about DevOps, CI/CD, and cloud infrastructure'
  },
  {
    domain: 'mobile.localhost:3000',
    title: 'Mobile Dev Blog',
    description: 'Mobile app development insights and tutorials'
  }
];

const createSamplePosts = (domain: string) => [
  {
    title: `Getting Started with Next.js - ${domain}`,
    content: `Next.js has revolutionized the way we build React applications. In this comprehensive guide, we'll explore everything you need to know to get started with Next.js.

First, let's understand what makes Next.js special. Unlike traditional React applications, Next.js provides a robust framework with built-in features like server-side rendering (SSR), static site generation (SSG), and incremental static regeneration (ISR).

## Setting Up Your First Next.js Project

To create a new Next.js project, you can use the following command:
\`\`\`bash
npx create-next-app@latest my-next-app
\`\`\`

This will set up a new project with all the necessary configurations. Next.js 13 introduced several groundbreaking features, including:

1. The new App Router
2. React Server Components
3. Improved data fetching patterns
4. Built-in SEO optimizations

## Key Features and Best Practices

### Server Components
Server Components allow you to render complex components on the server, reducing the JavaScript bundle size sent to the client. Here's an example:

\`\`\`typescript
async function BlogPosts() {
  const posts = await fetchPosts();
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  );
}
\`\`\`

### Data Fetching
Next.js provides multiple ways to fetch data:
- Server-side rendering with getServerSideProps
- Static generation with getStaticProps
- Client-side fetching with SWR or React Query

### Routing and Navigation
The file-system based routing in Next.js makes it intuitive to create new pages and handle dynamic routes.

## Performance Optimization Tips

1. Use Image component for automatic image optimization
2. Implement proper caching strategies
3. Utilize dynamic imports for code splitting
4. Configure appropriate caching headers

Remember to follow the official documentation and stay updated with the latest features and best practices in the Next.js ecosystem.`,
    slug: "getting-started-with-nextjs",
    author: "John Doe",
    domain,
  },
  {
    title: `Understanding TypeScript - ${domain}`,
    content: `TypeScript has become an essential tool in modern web development, providing static typing and enhanced developer experience for JavaScript projects. Let's dive deep into TypeScript's core concepts and advanced features.

## Why TypeScript?

TypeScript adds several crucial features to JavaScript:
- Static typing
- Interface declarations
- Generics
- Decorators
- Enhanced IDE support

## Type System Fundamentals

### Basic Types
TypeScript provides various built-in types:

\`\`\`typescript
// Basic types
let isDone: boolean = false;
let decimal: number = 6;
let color: string = "blue";
let list: number[] = [1, 2, 3];
let tuple: [string, number] = ["hello", 10];

// Object types
interface User {
  name: string;
  age: number;
  email?: string; // Optional property
}

// Union types
type Status = "pending" | "approved" | "rejected";
\`\`\`

### Advanced Type Features

#### Generics
Generics allow you to write flexible, reusable code:

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

// Usage
let output = identity<string>("myString");
\`\`\`

#### Utility Types
TypeScript provides several utility types for common type transformations:

- Partial<T>
- Required<T>
- Pick<T, K>
- Omit<T, K>
- Record<K, T>

## Best Practices and Tips

1. Always define proper interfaces for objects
2. Use strict mode in tsconfig.json
3. Leverage type inference when possible
4. Document complex types with JSDoc comments

## Real-World Examples

### API Response Typing
\`\`\`typescript
interface APIResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<APIResponse<User>> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}
\`\`\`

### State Management with TypeScript
\`\`\`typescript
interface State {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

type Action =
  | { type: 'FETCH_USER_REQUEST' }
  | { type: 'FETCH_USER_SUCCESS'; payload: User }
  | { type: 'FETCH_USER_FAILURE'; payload: Error };
\`\`\`

Remember to regularly update your TypeScript knowledge as the language evolves with new features and improvements.`,
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
      console.log(`Created ${posts.length} posts for ${domain.domain}`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
