'use client';

export default function Error() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-red-600">
        Error loading post
      </h1>
      <p className="mt-4">
        There was a problem loading this post. Please try again later.
      </p>
    </div>
  );
}